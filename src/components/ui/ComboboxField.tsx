import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

import { FieldError } from '@/components/ui/FieldError'
import { Label } from '@/components/ui/Label'

export type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

export type ComboboxFieldProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  error?: string
  hint?: string
  labelClassName?: string
  className?: string
  name?: string
  id?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
}

type PanelPosition = {
  top: number
  left: number
  width: number
}

const triggerBaseClassName =
  'mt-2 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-gorev-navy-950/70 px-4 py-2.5 text-left text-sm shadow-inner shadow-black/20 outline-none transition disabled:cursor-not-allowed disabled:opacity-60'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        'h-5 w-5 shrink-0 text-gorev-muted transition-transform duration-200',
        open && 'rotate-180',
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gorev-green-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

export function ComboboxField({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Seçin…',
  error,
  hint,
  labelClassName,
  className,
  name,
  id: idProp,
  required,
  disabled = false,
  searchable = true,
  searchPlaceholder = 'Kategori ara…',
  emptyMessage = 'Sonuç bulunamadı.',
}: ComboboxFieldProps) {
  const uid = useId()
  const id = idProp ?? uid
  const listboxId = `${id}-listbox`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(
    null,
  )

  const describedBy =
    [hint ? hintId : undefined, error ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('tr')
    if (!query) return options
    return options.filter((option) =>
      option.label.toLocaleLowerCase('tr').includes(query),
    )
  }, [options, searchQuery])

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setPanelPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setSearchQuery('')
  }, [])

  const openList = useCallback(() => {
    if (disabled || options.length === 0) return
    setOpen(true)
    const selectedIndex = options.findIndex((option) => option.value === value)
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [disabled, options, value])

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return
      onValueChange(option.value)
      close()
      triggerRef.current?.focus()
    },
    [close, onValueChange],
  )

  useLayoutEffect(() => {
    if (!open) return
    updatePanelPosition()
  }, [open, updatePanelPosition, filteredOptions.length])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      close()
    }

    function handleReposition() {
      updatePanelPosition()
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [close, open, updatePanelPosition])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      if (searchable) {
        searchRef.current?.focus()
      } else {
        listRef.current?.focus()
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, searchable])

  const activeIndex =
    filteredOptions.length === 0
      ? 0
      : Math.min(highlightedIndex, filteredOptions.length - 1)

  useEffect(() => {
    if (!open || !listRef.current) return
    const option = listRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    option?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) openList()
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          close()
        }
        break
      default:
        break
    }
  }

  function handleListKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex((index) =>
          Math.min(index + 1, filteredOptions.length - 1),
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex((index) => Math.max(index - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (filteredOptions[activeIndex]) {
          selectOption(filteredOptions[activeIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        close()
        triggerRef.current?.focus()
        break
      case 'Tab':
        close()
        break
      default:
        break
    }
  }

  const showSearch = searchable && options.length > 4

  const panel =
    open && panelPosition
      ? createPortal(
          <div
            ref={panelRef}
            className="z-[100] overflow-hidden rounded-xl border border-gorev-navy-700 bg-gorev-navy-900 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
            }}
            onKeyDown={handleListKeyDown}
          >
            {showSearch ? (
              <div className="border-b border-gorev-navy-800 p-2">
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setHighlightedIndex(0)
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-gorev-navy-700 bg-gorev-navy-950/80 px-3 py-2 text-sm text-gorev-snow outline-none placeholder:text-gorev-muted focus:border-gorev-yellow-400/45 focus:ring-2 focus:ring-gorev-yellow-400/25"
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                />
              </div>
            ) : null}

            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label}
              tabIndex={showSearch ? -1 : 0}
              className="max-h-60 overflow-y-auto overscroll-contain py-1"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gorev-muted">
                  {emptyMessage}
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value
                  const isHighlighted = index === activeIndex

                  return (
                    <li
                      key={option.value}
                      id={`${id}-option-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      className={cn(
                        'flex min-h-11 cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm transition',
                        option.disabled && 'cursor-not-allowed opacity-50',
                        isHighlighted && 'bg-gorev-navy-800',
                        !isHighlighted &&
                          !isSelected &&
                          'hover:bg-gorev-navy-800/80',
                        isSelected &&
                          'border-l-2 border-gorev-green-400 bg-gorev-green-500/10 pl-[calc(1rem-2px)] text-gorev-snow',
                        !isSelected && 'text-gorev-snow',
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectOption(option)}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected ? <CheckIcon /> : null}
                    </li>
                  )
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null

  return (
    <div ref={rootRef} className={cn('w-full', className)}>
      <Label
        htmlFor={id}
        className={labelClassName}
        requiredIndicator={Boolean(required)}
      >
        {label}
      </Label>
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-gorev-muted">
          {hint}
        </p>
      ) : null}

      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={Boolean(error)}
        aria-required={required}
        aria-describedby={describedBy}
        className={cn(
          triggerBaseClassName,
          error
            ? 'border-red-500/60 focus:border-red-400/70 focus:ring-2 focus:ring-red-400/20'
            : open
              ? 'border-gorev-yellow-400/45 ring-2 ring-gorev-yellow-400/25'
              : 'border-gorev-navy-700 hover:border-gorev-navy-600 focus:border-gorev-yellow-400/45 focus:ring-2 focus:ring-gorev-yellow-400/25',
        )}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate',
            selectedOption ? 'text-gorev-snow' : 'text-gorev-muted',
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {panel}
      <FieldError id={errorId} message={error} />
    </div>
  )
}
