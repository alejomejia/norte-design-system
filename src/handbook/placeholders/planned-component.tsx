/** The stand-in for a planned component: a dashed frame with its name, so the sidebar maps what the system will cover. */
export function PlannedComponent({ name }: { name: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-l border border-dashed border-line-strong p-8 text-center">
      <p className="text-body-s font-medium text-ink">{name}</p>
      <p className="text-caption text-ink-subtle">Planned: not built yet</p>
    </div>
  )
}
