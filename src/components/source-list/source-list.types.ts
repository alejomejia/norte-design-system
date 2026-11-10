import { type ReactNode } from 'react'

import { type CitationSource } from '@/components/citation'

import { type SOURCE_LIST_LABELS, type SOURCE_LIST_STATUSES } from './source-list.const'

export type SourceListStatus = (typeof SOURCE_LIST_STATUSES)[number]

export type SourceListLabels = typeof SOURCE_LIST_LABELS

/** A source in the list: what a citation points to, and whether the agent could read it. */
export type SourceListSource = CitationSource & {
  /** `read` (the default) or `failed`: a failed source has nothing to cite, so it takes no number. */
  status?: SourceListStatus
  /** Why it failed, under its title: "Timed out after 30s". */
  reason?: ReactNode
}
