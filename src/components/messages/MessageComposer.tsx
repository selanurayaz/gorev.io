import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'

type MessageComposerProps = {
  disabled?: boolean
  isSending?: boolean
  onSend: (content: string) => Promise<boolean>
}

export function MessageComposer({
  disabled = false,
  isSending = false,
  onSend,
}: MessageComposerProps) {
  const [text, setText] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled || isSending) return

    const ok = await onSend(trimmed)
    if (ok) setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <form
      className="flex flex-col gap-2 border-t border-gorev-navy-800 bg-gorev-navy-950/80 p-3 sm:flex-row sm:items-end sm:p-4"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="message-input">
        Mesajınız
      </label>
      <textarea
        id="message-input"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
        placeholder="Mesajınızı yazın…"
        className="block min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-gorev-navy-700 bg-gorev-navy-950/70 px-3 py-2.5 text-sm text-gorev-snow outline-none transition placeholder:text-gorev-muted focus:border-gorev-yellow-400/45 focus:ring-2 focus:ring-gorev-yellow-400/25 disabled:opacity-60"
      />
      <Button
        type="submit"
        className="min-h-11 w-full shrink-0 px-4 sm:w-auto"
        loading={isSending}
        disabled={disabled || !text.trim()}
      >
        Gönder
      </Button>
    </form>
  )
}
