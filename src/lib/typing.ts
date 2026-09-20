import { useEffect, useRef } from "react"

/* How fast a person types, which is not how fast a machine can.
 *
 * A fixed interval reads as a teleprinter; what makes it look like somebody at
 * a keyboard is that no two keystrokes are the same length, that a space is a
 * moment to think, and that punctuation is a longer one.
 *
 * Shared rather than copied, because every prototype that fills a field in
 * should do it at the same speed — a second one picking its own numbers is a
 * second answer to a question already settled. See README, "Fields that fill
 * themselves in". */

export const TYPING = {
  /** The base gap between keystrokes. */
  char: 58,
  /** Added at random on top, so the rhythm never repeats. */
  jitter: 40,
  /** Extra after a space: the gap between words. */
  word: 52,
  /** Extra after a colon or a comma, where a person pauses. */
  punctuation: 110,
}

/** How long a field sits finished before the next one starts. */
export const BEAT = 460

export const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

const keystroke = (previous: string) =>
  TYPING.char +
  Math.random() * TYPING.jitter +
  (previous === " " ? TYPING.word : 0) +
  (/[:,.]/.test(previous) ? TYPING.punctuation : 0)

/** A sequence that stops if what it is typing into goes away mid-run, and that
 *  can be called off — a field somebody has started typing in themselves is
 *  theirs, and a script that goes on filling it is fighting them for it. */
export function useScript() {
  const alive = useRef(true)
  const stopped = useRef(false)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const running = () => alive.current && !stopped.current

  /** `pace` scales the rhythm without changing its shape — the jitter, the
   *  pause after a space and the longer one after a comma are all still
   *  there, just closer together. A sentence somebody would have typed in
   *  twelve seconds is twelve seconds nobody on a stage has, and a field that
   *  fills itself is a stage affordance already. Anything short types at the
   *  rate a person types. */
  const type = async (text: string, set: (value: string) => void, pace = 1) => {
    for (let i = 1; i <= text.length; i += 1) {
      if (!running()) return false
      set(text.slice(0, i))
      await sleep(keystroke(text[i - 1]) * pace)
    }
    return running()
  }

  const wait = async (ms = BEAT) => {
    await sleep(ms)
    return running()
  }

  /** Hands the field back. Anything still queued stops on its next keystroke. */
  const stop = () => {
    stopped.current = true
  }

  return { type, wait, stop }
}
