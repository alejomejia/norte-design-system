'use client'

import { createContext, useContext } from 'react'

import { type ACCORDION_HEADING_LEVELS, type ACCORDION_VARIANTS } from './accordion.const'

type AccordionLook = {
  variant: (typeof ACCORDION_VARIANTS)[number]
  headingLevel: (typeof ACCORDION_HEADING_LEVELS)[number]
}

/** The root's variant and heading level, so the items' triggers and panels don't repeat them. */
export const AccordionLookContext = createContext<AccordionLook>({ variant: 'line', headingLevel: 3 })

/** The variant and heading level of the `Accordion` around a part. */
export function useAccordionLook() {
  return useContext(AccordionLookContext)
}
