'use client'

import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { useMemo } from 'react'

import { nameParts } from '@/lib/utils'

import { type ACCORDION_HEADING_LEVELS, type ACCORDION_VARIANTS } from './accordion.const'
import { AccordionLookContext } from './accordion.hooks'
import { accordionStyles } from './accordion.styles'
import { AccordionItem, AccordionPanel, AccordionTrigger } from './accordion-parts'

export type { AccordionItemProps, AccordionPanelProps, AccordionTriggerProps } from './accordion-parts'

export type AccordionProps = Omit<
  BaseAccordion.Root.Props<string>,
  'className' | 'orientation' | 'loopFocus' | 'hiddenUntilFound'
> & {
  /** `line`, hairlines between sections, flush with a panel's edges; `outline`, one bordered surface. */
  variant?: (typeof ACCORDION_VARIANTS)[number]
  /** The heading each trigger sits in, so the sections fit the page's outline: `3` under a panel's `h2`. */
  headingLevel?: (typeof ACCORDION_HEADING_LEVELS)[number]
  /**
   * Closed panels stay in the page, hidden with `hidden="until-found"`: the browser's find (⌘F) reaches their text and
   * opens the section, and fields inside keep what was typed. Turn it off for heavy panels, which then mount on open.
   */
  hiddenUntilFound?: boolean
  className?: string
}

/**
 * Sections that open and close under their headings, one at a time, or several with `multiple`. A panel grows open
 * and its content fades in, and the chevron turns down. Built on Base UI's Accordion, which brings the buttons, their
 * `aria-expanded` and the link between each heading and its panel.
 *
 * @example
 * <Accordion defaultValue={['agent']}>
 *   <Accordion.Item value="agent">
 *     <Accordion.Trigger icon="agent" description="Name and instructions">Agent</Accordion.Trigger>
 *     <Accordion.Panel>…</Accordion.Panel>
 *   </Accordion.Item>
 * </Accordion>
 */
function AccordionRoot({
  variant = 'line',
  headingLevel = 3,
  hiddenUntilFound = true,
  className,
  ...props
}: AccordionProps) {
  const look = useMemo(() => ({ variant, headingLevel }), [variant, headingLevel])
  return (
    <AccordionLookContext value={look}>
      <BaseAccordion.Root
        {...props}
        hiddenUntilFound={hiddenUntilFound}
        className={accordionStyles({ variant }).root({ className })}
      />
    </AccordionLookContext>
  )
}

// The root's name too: its function is `AccordionRoot`.
AccordionRoot.displayName = 'Accordion'

export const Accordion = Object.assign(
  AccordionRoot,
  nameParts('Accordion', { Item: AccordionItem, Trigger: AccordionTrigger, Panel: AccordionPanel }),
)
