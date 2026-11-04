import { STATUSES, type Status } from '@/handbook/statuses'

const STYLES: Record<Status, string> = {
  ready: 'bg-accent-subtle text-accent-ink',
  beta: 'border-accent-ink text-accent-ink',
  planned: 'border-white/30 text-white/80',
  deprecated: 'bg-white/10 text-white/70 line-through',
}

/** A component's status, as the sidebar shows it, sized for the dark page header. */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-s border border-transparent px-2 text-caption font-medium ${STYLES[status]}`}>
      {STATUSES[status]}
    </span>
  )
}
