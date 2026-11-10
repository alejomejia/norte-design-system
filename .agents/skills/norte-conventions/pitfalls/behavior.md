# Pitfalls: behavior and measuring

Base UI and React: measured sizes, anchored highlights, roots that count their children, first runs.
Each was hit once while building a component. Add a new one at the end of the file for its topic.

- **First story run after adding a Base UI import** fails while Vite re-optimizes: run it again.
- **A root that counts or slices its children** sees a fragment as one child: use `flattenChildren` from
  `@/lib/utils`.
- **ResizeObserver's first report waits for a rendered frame,** which test runs can hold back for over a second:
  measure once on mount too (`useOverflows` does).
- **An anchored highlight slides to the top as it hides:** with no anchor, `anchor(…, 0)` falls back to 0 and a
  transitioned `top` goes there while it fades. Hold it while hidden with `[transition-delay:999s,999s,0s,0s]` (top and
  height first in the transition list) and `delay-0` while a row is highlighted (Menu, Select, Command menu).
- **A moved box changes a measured height:** a `translate` on the box Base UI measures counts toward its scroll
  height, so the panel overshoots and snaps. Move an inner box that sits inside the padding.
- **A readout sized to `w-max` beside a point spills out of its chart** when its text is long (a plan step's name).
  Open it on the side with more room and cap it there (`max-w-(--room)`), so it wraps. `clientWidth` rounds, so a
  room worked out from two measured widths can be a fraction too big: leave it a pixel short (Bar chart's readout).
