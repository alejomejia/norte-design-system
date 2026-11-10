# Pitfalls: motion

Exits under the lazy `LazyMotion`, and staggered entrances.
Each was hit once while building a component. Add a new one at the end of the file for its topic.

- **An exit that starts before Motion's lazy features load never runs,** and `AnimatePresence` keeps the element for
  good. Whatever removes itself through an exit (a dismissed alert) also leaves on a timer a little longer than its exit
  (Alert's `ALERT_EXIT_TIMEOUT`), and a play test dismisses it right after render, by keyboard.
- **Items that `rise` aren't visible until their turn:** `animate-rise` holds a delayed item at opacity 0, so
  `toBeVisible()` fails on a later one. Wait for it (`waitFor`), or assert something other than visibility.
