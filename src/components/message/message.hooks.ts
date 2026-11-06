'use client'

import { createContext, useContext } from 'react'

import { type MESSAGE_KINDS } from './message.const'

type MessageState = {
  kind: (typeof MESSAGE_KINDS)[number]
  busy: boolean
}

/** Who wrote the message and whether it's still being written, so its parts don't repeat them. */
export const MessageContext = createContext<MessageState>({ kind: 'person', busy: false })

/** The author's kind and the busy state of the `Message` around a part. */
export function useMessage() {
  return useContext(MessageContext)
}
