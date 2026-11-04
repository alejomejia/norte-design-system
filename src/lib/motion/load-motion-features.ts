/**
 * The `features` of a `LazyMotion`: loads Motion's `domAnimation` the first time a component animates, so `m`
 * components cost about 5 KB until then and an app that never animates never downloads the rest.
 * @example
 * <LazyMotion features={loadMotionFeatures} strict>…</LazyMotion>
 */
export function loadMotionFeatures() {
  return import('./motion-features').then((module) => module.default)
}
