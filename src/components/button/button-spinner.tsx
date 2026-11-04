import { cn } from '@/lib/utils'

/**
 * The spinner a button shows while its action runs, centered over the hidden label. Decorative: the button announces
 * itself as busy. Under reduced motion it stays still.
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn('absolute inset-0 m-auto size-4 animate-spin motion-reduce:animate-none', className)}
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}
