'use client'

import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { type ReactNode } from 'react'

import { Icon, type IconName } from '@/components/icon'

import { useAccordionLook } from './accordion.hooks'
import { accordionStyles } from './accordion.styles'

export type AccordionItemProps = Omit<BaseAccordion.Item.Props, 'className' | 'value'> & {
  /** What names the section in the accordion's `value`. Without one, Base UI makes one up. */
  value?: string
  className?: string
}

/** One section: an `Accordion.Trigger` and the `Accordion.Panel` it opens. `disabled` keeps it shut. */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <BaseAccordion.Item {...props} className={accordionStyles().item({ className })} />
}

export type AccordionTriggerProps = Omit<BaseAccordion.Trigger.Props, 'className' | 'children'> & {
  /** An icon before the label, by its name in Norte's set. */
  icon?: IconName
  /** A second, quieter line under the label: what the section holds. Screen readers hear it in the button's name. */
  description?: ReactNode
  /** The label. */
  children: ReactNode
  className?: string
}

/**
 * The row that opens and closes its section: a button inside a heading, at the accordion's `headingLevel`, so the
 * sections show up in the page's outline. Enter or Space toggles it.
 */
export function AccordionTrigger({ icon, description, children, className, ...props }: AccordionTriggerProps) {
  const { variant, headingLevel } = useAccordionLook()
  const styles = accordionStyles({ variant })
  const Heading = `h${headingLevel}` as const
  return (
    <BaseAccordion.Header render={<Heading />} className={styles.header()}>
      <BaseAccordion.Trigger {...props} data-icon={icon ? '' : undefined} className={styles.trigger({ className })}>
        {icon && <Icon name={icon} className={styles.icon()} />}
        <span className={styles.text()}>
          <span className={styles.label()}>{children}</span>
          {description && <span className={styles.description()}>{description}</span>}
        </span>
        <Icon name="chevron-down" className={styles.chevron()} />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

export type AccordionPanelProps = Omit<BaseAccordion.Panel.Props, 'className'> & {
  /** Goes on the box that holds the content, inside the panel's padding: `flex flex-col gap-4` for a form. */
  className?: string
}

/**
 * What a section holds. It grows open and shrinks shut, its content fading with it. Named by its trigger, so screen
 * readers announce which section they're in.
 */
export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  const styles = accordionStyles(useAccordionLook())
  return (
    <BaseAccordion.Panel {...props} className={styles.panel()}>
      <div className={styles.inset()}>
        <div className={styles.content({ className })}>{children}</div>
      </div>
    </BaseAccordion.Panel>
  )
}
