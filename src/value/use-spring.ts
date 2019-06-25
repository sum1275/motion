import { useRef, useMemo } from "react"
import { spring, SpringProps, ColdSubscription } from "popmotion"
import { MotionValue } from "../value"
import { isMotionValue } from "./utils/is-motion-value"
import { useMotionValue } from "./use-motion-value"

/**
 * Creates a `MotionValue` that, when `set`, will spring to its new state.
 *
 * @remarks
 *
 * ```jsx
 * const x = useSpring(0, { stiffness: 300 })
 * const y = useSpring(x, { damping: 10 })
 * ```
 */
export function useSpring(
    source: MotionValue | number,
    config: SpringProps = {}
) {
    const activeSpringAnimation = useRef<ColdSubscription | null>(null)
    const value = useMotionValue(isMotionValue(source) ? source.get() : source)

    useMemo(() => {
        return value.attach((v, set) => {
            if (activeSpringAnimation.current) {
                activeSpringAnimation.current.stop()
            }

            activeSpringAnimation.current = spring({
                from: value.get(),
                to: v,
                velocity: value.getVelocity(),
                ...config,
            }).start(set)

            return value.get()
        })
    }, Object.values(config))

    // If the source is a `MotionValue`, bind via onChange
    useMemo(
        () => {
            if (isMotionValue(source)) {
                return source.onChange(v => value.set(parseFloat(v)))
            }
        },
        [source]
    )

    return value
}
