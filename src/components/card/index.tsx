'use client'

import { useRender } from '@base-ui/react/use-render'

import { type CARD_PADDINGS, type CARD_VARIANTS } from './card.const'
import { cardStyles } from './card.styles'
import { CardAction, CardBody, CardDescription, CardFooter, CardHeader, CardLink, CardTitle } from './card-parts'

export type {
  CardActionProps,
  CardBodyProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardLinkProps,
  CardTitleProps,
} from './card-parts'

export type CardProps = Omit<useRender.ComponentProps<'div'>, 'className'> & {
  /** `outline`, a white surface with a border, or `muted`, a quiet fill with none, for cards inside a panel. */
  variant?: (typeof CARD_VARIANTS)[number]
  /** The space inside it and between its parts: `s` (12px), `m` (16px) or `l` (24px). */
  padding?: (typeof CARD_PADDINGS)[number]
  /** Another element, for what the card is on the page: `render={<article />}`, `render={<li />}`. A `div` by default. */
  render?: useRender.ComponentProps<'div'>['render']
  className?: string
}

/**
 * A surface that groups content: a header (`Card.Title`, `Card.Description`, `Card.Action`), a body and a footer, each
 * optional, stacked with the card's padding between them. It takes no outside margin. To make the whole card a link,
 * put a `Card.Link` in its title: a real link stretched over the card, never a clickable `div`.
 *
 * @example
 * <Card>
 *   <Card.Header>
 *     <Card.Title>Run #128</Card.Title>
 *     <Card.Description>Research agent · 4m 12s</Card.Description>
 *   </Card.Header>
 *   <Card.Body>Compared five competitors' pricing for teams of 10 to 50 seats.</Card.Body>
 * </Card>
 */
function CardRoot({ variant = 'outline', padding = 'm', render, className, ref, ...props }: CardProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: { ...props, className: cardStyles({ variant, padding }).root({ className }) },
  })
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Body: CardBody,
  Footer: CardFooter,
  Link: CardLink,
})
