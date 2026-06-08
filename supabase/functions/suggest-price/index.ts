import { createClient } from 'npm:@supabase/supabase-js@2'

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const GEMINI_MODEL = 'gemini-2.0-flash'

type ListingType = 'task' | 'service'

type SuggestPriceRequest = {
  title?: string
  description?: string
  category?: string
  city?: string
  listing_type?: ListingType
}

type PriceSuggestionPayload = {
  suggested_price: number
  minimum_price: number
  maximum_price: number
  short_reason: string
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function validateRequest(body: SuggestPriceRequest): string | null {
  const title = readString(body.title)
  const description = readString(body.description)
  const category = readString(body.category)
  const city = readString(body.city)
  const listingType = body.listing_type

  if (!title || title.length < 5) {
    return 'Başlık en az 5 karakter olmalı.'
  }
  if (!description || description.length < 20) {
    return 'Açıklama en az 20 karakter olmalı.'
  }
  if (!category) {
    return 'Kategori gerekli.'
  }
  if (!city) {
    return 'Şehir gerekli.'
  }
  if (listingType !== 'task' && listingType !== 'service') {
    return 'Geçersiz ilan türü.'
  }

  return null
}

function readPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeSuggestion(
  raw: Record<string, unknown>,
): PriceSuggestionPayload | null {
  const suggested = readPrice(raw.suggested_price ?? raw.suggestedPrice)
  const minimum = readPrice(
    raw.minimum_price ?? raw.minimumPrice ?? raw.min_price,
  )
  const maximum = readPrice(
    raw.maximum_price ?? raw.maximumPrice ?? raw.max_price,
  )
  const shortReason = readString(
    raw.short_reason ?? raw.shortReason ?? raw.reason,
  )

  if (
    suggested == null ||
    minimum == null ||
    maximum == null ||
    !shortReason
  ) {
    return null
  }

  const suggestedRounded = Math.round(suggested)
  let minRounded = Math.round(minimum)
  let maxRounded = Math.round(maximum)

  if (minRounded > maxRounded) {
    ;[minRounded, maxRounded] = [maxRounded, minRounded]
  }

  if (suggestedRounded < minRounded) minRounded = suggestedRounded
  if (suggestedRounded > maxRounded) maxRounded = suggestedRounded

  if (minRounded < 0 || maxRounded < 0 || suggestedRounded < 0) {
    return null
  }

  return {
    suggested_price: suggestedRounded,
    minimum_price: minRounded,
    maximum_price: maxRounded,
    short_reason: shortReason.slice(0, 500),
  }
}

function buildPrompt(body: SuggestPriceRequest): string {
  const listingLabel =
    body.listing_type === 'service'
      ? 'hizmet ilanı (hizmet veren)'
      : 'görev ilanı (iş yaptırmak isteyen müşteri)'

  return [
    'Sen görev.io için Türkiye pazarına odaklı bir fiyatlandırma asistanısın.',
    'Yalnızca geçerli JSON döndür; başka metin ekleme.',
    '',
    'Türkiye pazarı için görev.io platformunda fiyat önerisi üret.',
    `İlan türü: ${listingLabel}`,
    `Başlık: ${readString(body.title)}`,
    `Açıklama: ${readString(body.description)}`,
    `Kategori: ${readString(body.category)}`,
    `Şehir: ${readString(body.city)}`,
    '',
    'Yanıt şeması:',
    '{',
    '  "suggested_price": number,',
    '  "minimum_price": number,',
    '  "maximum_price": number,',
    '  "short_reason": string',
    '}',
    '',
    'Kurallar:',
    '- Tüm fiyatlar Türk Lirası (TRY), tam sayı.',
    '- short_reason Türkçe, 1-2 cümle, net ve profesyonel.',
    '- Görev ilanında müşterinin ödeyeceği bütçe aralığı; hizmet ilanında hizmet verenin başlangıç fiyatı mantığıyla öner.',
    '- Şehir ve kategoriye göre gerçekçi Türkiye piyasa aralığı kullan.',
  ].join('\n')
}

function extractJsonText(content: string): string {
  const trimmed = content.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch?.[1]) return fenceMatch[1].trim()
  return trimmed
}

function normalizeCityKey(city: string): string {
  return city
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function isLargeCity(city: string): boolean {
  const value = normalizeCityKey(city)
  return (
    value.includes('istanbul') ||
    value.includes('ankara') ||
    value.includes('izmir') ||
    value.includes('bursa') ||
    value.includes('antalya')
  )
}

function estimateBasePrice(body: SuggestPriceRequest): number {
  const category = readString(body.category).toLocaleLowerCase('tr-TR')
  const description = readString(body.description)
  const title = readString(body.title)
  const combined = `${title} ${description} ${category}`

  let base = 1500

  if (
    category.includes('yazılım') ||
    category.includes('yazilim') ||
    category.includes('web')
  ) {
    base = 4500
  } else if (
    category.includes('temizlik') ||
    category.includes('ev hizmet')
  ) {
    base = 900
  } else if (
    category.includes('taşıma') ||
    category.includes('tasima') ||
    category.includes('nakliye')
  ) {
    base = 2200
  } else if (
    category.includes('tamir') ||
    category.includes('usta') ||
    category.includes('tadilat')
  ) {
    base = 2800
  } else if (
    category.includes('eğitim') ||
    category.includes('egitim') ||
    category.includes('ders')
  ) {
    base = 1200
  } else if (
    category.includes('tasarım') ||
    category.includes('tasarim') ||
    category.includes('grafik')
  ) {
    base = 3200
  }

  if (/\b(acil|premium|profesyonel|kurumsal)\b/i.test(combined)) {
    base = Math.round(base * 1.15)
  }

  if (description.length > 250) {
    base = Math.round(base * 1.1)
  }

  if (isLargeCity(readString(body.city))) {
    base = Math.round(base * 1.2)
  }

  if (body.listing_type === 'service') {
    base = Math.round(base * 0.95)
  }

  return Math.max(500, base)
}

/** Yerel kural tabanlı yedek tahmin — Gemini başarısız olduğunda. */
function buildLocalFallbackEstimate(
  body: SuggestPriceRequest,
): PriceSuggestionPayload {
  const category = readString(body.category)
  const city = readString(body.city)
  const suggested = estimateBasePrice(body)
  const minimum = Math.round(suggested * 0.8)
  const maximum = Math.round(suggested * 1.25)

  const listingLabel =
    body.listing_type === 'service' ? 'hizmet ilanı' : 'görev ilanı'

  return {
    suggested_price: suggested,
    minimum_price: minimum,
    maximum_price: maximum,
    short_reason: `${category} kategorisinde ${city} için ${listingLabel} bazlı yerel tahmin kullanıldı; benzer işler genelde bu aralıkta fiyatlanır.`,
  }
}

async function requestGeminiSuggestion(
  body: SuggestPriceRequest,
  apiKey: string,
): Promise<PriceSuggestionPayload | null> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: buildPrompt(body) }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error('[suggest-price] Gemini error', {
      status: response.status,
      detail: detail.slice(0, 500),
    })
    return null
  }

  const completion = await response.json()
  const content = completion?.candidates?.[0]?.content?.parts?.[0]?.text

  if (typeof content !== 'string' || !content.trim()) {
    console.error('[suggest-price] Gemini empty response')
    return null
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(extractJsonText(content)) as Record<string, unknown>
  } catch {
    console.error('[suggest-price] Gemini JSON parse failed')
    return null
  }

  return normalizeSuggestion(parsed)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Yalnızca POST desteklenir.' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Oturum gerekli.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: 'Sunucu yapılandırması eksik.' }, 500)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return jsonResponse({ error: 'Geçersiz oturum.' }, 401)
    }

    const body = (await req.json()) as SuggestPriceRequest
    const validationError = validateRequest(body)

    if (validationError) {
      return jsonResponse({ error: validationError }, 400)
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    let suggestion: PriceSuggestionPayload | null = null
    let usedFallback = false

    if (geminiKey) {
      suggestion = await requestGeminiSuggestion(body, geminiKey)
    } else {
      console.warn('[suggest-price] GEMINI_API_KEY missing; using local fallback')
    }

    if (!suggestion) {
      suggestion = buildLocalFallbackEstimate(body)
      usedFallback = true
    }

    console.info('[suggest-price] result', {
      usedFallback,
      suggested: suggestion.suggested_price,
    })

    return jsonResponse(suggestion)
  } catch (error) {
    console.error('[suggest-price] unexpected', error)
    return jsonResponse(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      500,
    )
  }
})
