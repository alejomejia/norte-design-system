# Review checklist

Run before finishing a change, with `pnpm check`, and fix what they print. Each command should print nothing
(font-size lines excepted in the off-grid check).

```sh
# Raw inline CSS: use classes, and toCSSVars for runtime values
rg -n 'style=\{\{' src .storybook

# Class strings built with template literals: use cn()
rg -n 'className=\{`' src

# Imports that go up more than one folder: use the @/ alias
rg -n "from '(\.\./){2,}" src .storybook scripts

# Off-grid spacing classes (odd from 5 up, decimals other than 0.25 and 0.5)
rg -n --pcre2 '(?<![\w-])-?(p[xytrblse]?|m[xytrblse]?|gap(-[xy])?|space-[xy]|inset(-[xy])?|top|right|bottom|left|w|h|size|min-w|min-h|max-w|max-h|basis|translate-[xy])-(?!(1|3|0\.25|0\.5)(?![\w./]))(\d*[13579]|\d+\.\d+)(?![\w./])' src -g '*.tsx' -g '*.ts'

# px in CSS outside comments and hairlines: write rem
rg -n '\b\d+(\.\d+)?px\b' src .storybook -g '*.css' | rg -v '/\*|\b1px'

# rem in CSS without its px comment
rg -n --pcre2 '\d(\.\d+)?rem\b(?!.*/\*.*px.*\*/)' src .storybook -g '*.css'

# Primitives in components (roles first): review each hit
rg -n --pcre2 '(bg|text|border|ring|outline|fill|stroke)-(neutral|blue|green|amber|red)-\d+' src/components

# Deep imports past a barrel
rg -n "from '@/lib/(utils|hooks|motion)/" src

# The full Motion component in a component: use `m` under LazyMotion
rg -n "from 'motion/react'" src/components | rg -w 'motion'
```
