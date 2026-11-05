import { type Ref, type RefCallback } from 'react'

/**
 * One ref callback that sets every ref it's given, for a component that needs its own ref to an element an app may
 * also want one to. Undoes them all on detach, running the cleanup a callback ref returns (React 19) or setting the ref
 * to `null`. Memoize the result: a new callback each render detaches and attaches every ref again.
 * @example
 * const ref = useMemo(() => mergeRefs(inputRef, props.ref), [props.ref])
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(node)
      if (ref) ref.current = node
      return undefined
    })
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index]
        if (typeof cleanup === 'function') cleanup()
        else if (typeof ref === 'function') ref(null)
        else if (ref) ref.current = null
      })
    }
  }
}
