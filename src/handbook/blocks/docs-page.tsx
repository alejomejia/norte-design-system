import { Controls, Description, Primary, Stories, useOf } from '@storybook/addon-docs/blocks'

import { statusOf } from '@/handbook/statuses'

import { PageHeader } from './page-header'

/**
 * The docs page of every component: the header card (its place in the sidebar, the version, its status and name),
 * its description as the lead, the main story, its props, then the rest of its stories. Without controls
 * (`parameters.controls.disable`, like a page's), there's no props table either.
 */
export function DocsPage() {
  const { csfFile, preparedMeta } = useOf('meta', ['meta'])
  const path = preparedMeta.title.split('/')
  const title = path.pop() ?? preparedMeta.title
  const status = statusOf(preparedMeta.tags)
  const stories = Object.keys(csfFile.stories).length
  const controls = !preparedMeta.parameters.controls?.disable

  return (
    <>
      <PageHeader section={path.join(' · ')} title={title} status={status}>
        <Description />
      </PageHeader>
      <Primary />
      {controls && <Controls />}
      {stories > 1 && <Stories includePrimary={false} title="Stories" />}
    </>
  )
}
