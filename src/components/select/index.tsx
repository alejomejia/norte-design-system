'use client'

import { Select as BaseSelect } from '@base-ui/react/select'
import { type ReactNode } from 'react'

import { Icon } from '@/components/icon'

import { selectStyles } from './select.styles'

export type SelectItem = {
  value: string
  /** What the person reads, in the list and in the trigger once picked. */
  label: ReactNode
  disabled?: boolean
}

export type SelectProps = Omit<BaseSelect.Root.Props<string>, 'items' | 'children' | 'multiple'> & {
  /** The options, in order. */
  items: SelectItem[]
  /** The label above the trigger. Without one, give the select an `aria-label`. */
  label?: ReactNode
  /** What the trigger shows before anything is picked. */
  placeholder?: ReactNode
  'aria-label'?: string
  className?: string
}

/**
 * Picks one option from a short list, like the model an agent runs on. The list grows out of the trigger, and its
 * highlight glides from row to row as the pointer or the arrow keys move. Built on Base UI's Select, which brings the
 * keyboard, typeahead and form behavior. Idea from React Bits' Glide Select.
 *
 * @example
 * <Select label="Model" items={MODELS} defaultValue="fast" />
 */
export function Select({ items, label, placeholder, 'aria-label': ariaLabel, className, ...props }: SelectProps) {
  const styles = selectStyles()
  return (
    <BaseSelect.Root items={items} {...props}>
      <div className={styles.root({ className })}>
        {label && <BaseSelect.Label className={styles.label()}>{label}</BaseSelect.Label>}
        <BaseSelect.Trigger aria-label={ariaLabel} className={styles.trigger()}>
          <BaseSelect.Value placeholder={placeholder} className={styles.value()} />
          <BaseSelect.Icon className={styles.icon()}>
            <Icon name="chevron-down" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner alignItemWithTrigger={false} sideOffset={4} className={styles.positioner()}>
          <BaseSelect.Popup className={styles.popup()}>
            <BaseSelect.List className={styles.list()}>
              {items.map(({ value, label: itemLabel, disabled }) => (
                <BaseSelect.Item key={value} value={value} disabled={disabled} className={styles.item()}>
                  <BaseSelect.ItemText>{itemLabel}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className={styles.indicator()}>
                    <Icon name="approve" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
              {/* After the rows: an anchored element can only follow anchors that come before it. */}
              <span aria-hidden="true" className={styles.highlight()} />
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}
