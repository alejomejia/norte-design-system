'use client'

import { createContext, useContext } from 'react'

import { APPROVAL_REQUEST_LABELS } from './approval-request.const'

/** Every string an approval request shows or announces. */
export type ApprovalRequestLabels = Record<keyof typeof APPROVAL_REQUEST_LABELS, string>

type ApprovalRequestState = {
  /** The title's id, which names the request. */
  titleId?: string
  labels: ApprovalRequestLabels
}

/** What the parts need from the request: the id that names it and its labels. */
export const ApprovalRequestContext = createContext<ApprovalRequestState>({ labels: APPROVAL_REQUEST_LABELS })

/** The request around a part: the title's id and the labels. */
export function useApprovalRequest(): ApprovalRequestState {
  return useContext(ApprovalRequestContext)
}
