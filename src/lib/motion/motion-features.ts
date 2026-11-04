// Motion's `domAnimation` features (animations, variants, exit animations, hover, tap and focus), in a module of its
// own so `loadMotionFeatures` can load it on demand instead of with the component that needs it.
import { domAnimation } from 'motion/react'

export default domAnimation
