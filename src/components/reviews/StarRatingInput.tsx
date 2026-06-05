import { cn } from '@/lib/utils'

type StarRatingInputProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  error?: string
  label?: string
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={cn(
        'h-7 w-7 transition',
        filled ? 'text-gorev-yellow-400' : 'text-gorev-navy-700',
      )}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  )
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  error,
  label = 'Puan',
}: StarRatingInputProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gorev-snow">{label}</p>
      <div
        className="mt-2 flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1
          const filled = value >= starValue

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} yıldız`}
              disabled={disabled}
              onClick={() => onChange(starValue)}
              className={cn(
                'rounded-lg p-1 transition hover:bg-gorev-navy-800/60 disabled:cursor-not-allowed disabled:opacity-60',
                value === starValue && 'ring-1 ring-gorev-yellow-400/40',
              )}
            >
              <StarIcon filled={filled} />
            </button>
          )
        })}
        <span className="ml-2 text-sm text-gorev-muted">
          {value > 0 ? `${value}/5` : 'Seçin'}
        </span>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
