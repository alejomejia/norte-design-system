'use client'

import { createContext, type ReactNode, useContext } from 'react'

import { BREADCRUMB_SEPARATOR, type BREADCRUMB_TRUNCATE } from './breadcrumb.const'

type BreadcrumbLook = {
  separator: ReactNode
  truncate: (typeof BREADCRUMB_TRUNCATE)[number]
}

/** The root's separator and truncation, so items don't repeat them. */
export const BreadcrumbLookContext = createContext<BreadcrumbLook>({ separator: BREADCRUMB_SEPARATOR, truncate: 'all' })

/** The separator and truncation of the `Breadcrumb` around a part. */
export function useBreadcrumbLook() {
  return useContext(BreadcrumbLookContext)
}

type BreadcrumbPlace = {
  /** The first item has no separator before it. */
  first: boolean
  /** The last item is the current page, unless an item says otherwise. */
  last: boolean
}

/** Where an item sits in the path, set by the root around each one, so items don't need an index. */
export const BreadcrumbPlaceContext = createContext<BreadcrumbPlace>({ first: true, last: false })

/** Where the `Breadcrumb.Item` around a part sits in its path. */
export function useBreadcrumbPlace() {
  return useContext(BreadcrumbPlaceContext)
}
