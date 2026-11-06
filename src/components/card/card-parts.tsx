'use client'

import { useRender } from '@base-ui/react/use-render'
import { type ComponentProps, type ReactNode } from 'react'

import { cardStyles } from './card.styles'

/** The parts read the slots only: their look doesn't depend on the card's variant or padding. */
const styles = cardStyles()

export type CardHeaderProps = Omit<ComponentProps<'div'>, 'className'> & {
  /** `Card.Title`, `Card.Description` and `Card.Action`. */
  children: ReactNode
  className?: string
}

/** The top of a card: its title and description, with an action at the end. */
export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div {...props} className={styles.header({ className })} />
}

export type CardTitleProps = Omit<useRender.ComponentProps<'h3'>, 'className'> & {
  /** Another element, for the heading level that fits the page: `render={<h2 />}`. An `h3` by default. */
  render?: useRender.ComponentProps<'h3'>['render']
  className?: string
}

/** What the card is about, as a heading. */
export function CardTitle({ render, className, ref, ...props }: CardTitleProps) {
  return useRender({ defaultTagName: 'h3', render, ref, props: { ...props, className: styles.title({ className }) } })
}

export type CardDescriptionProps = Omit<ComponentProps<'p'>, 'className'> & { className?: string }

/** A line under the title: who, when, or what for. */
export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p {...props} className={styles.description({ className })} />
}

export type CardActionProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/** Beside the title, at the end of the header: a badge, an icon button, a menu. */
export function CardAction({ className, ...props }: CardActionProps) {
  return <div {...props} className={styles.action({ className })} />
}

export type CardBodyProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/**
 * The card's content. In a card with a `Card.Link`, a control in the body needs `relative` to sit above the link and
 * stay clickable.
 */
export function CardBody({ className, ...props }: CardBodyProps) {
  return <div {...props} className={styles.body({ className })} />
}

export type CardFooterProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/** The bottom of a card: its actions, at the end, wrapping when they don't fit. */
export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div {...props} className={styles.footer({ className })} />
}

export type CardLinkProps = Omit<useRender.ComponentProps<'a'>, 'className'> & {
  /**
   * Your router's link, so navigation stays client-side: `render={<NextLink href="/runs/128" />}`. It gets the classes,
   * children and the rest of the props.
   */
  render?: useRender.ComponentProps<'a'>['render']
  className?: string
}

/**
 * Makes the whole card a link: put it in the title, around its text. It's a real `<a>`, named by that text, stretched
 * over the card, so a click anywhere opens it while the action and footer stay clickable.
 */
export function CardLink({ render, className, ref, ...props }: CardLinkProps) {
  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: { ...props, 'data-card-link': '', className: styles.link({ className }) },
  })
}
