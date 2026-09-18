/* A face for a student who has not given us a photograph.
 *
 * Two letters in a coloured disc is what a product shows when it has nothing,
 * and on a list of eight people it reads as eight labels rather than eight
 * students — which is the opposite of what the row is trying to say. So the
 * fallback is drawn instead: a small portrait built out of four choices, taken
 * from the username so the same person is always the same face.
 *
 * Illustrated rather than photographic, and on purpose. A prototype that ships
 * strangers' photographs is putting real people on a screen they never agreed
 * to be on, and a keynote that reaches for a photo service is one dropped
 * network away from eight broken images. */

const SKIN = ["#f0c3a0", "#e0a77c", "#c88a5e", "#a06840", "#6f4629"]
const HAIR = ["#2f2a26", "#5a3b26", "#8a5a2b", "#c9903f", "#7b7b84", "#3b2f4a"]
const SHIRT = ["#3e4784", "#0b7a6b", "#b54708", "#9f1ab1", "#026aa2", "#175cd3", "#087443"]
const GROUND = ["#f1f3f4", "#ebf5ff", "#eafcf7", "#fff6e4", "#f5f4ed"]

/** Same name, same face, every time — a hash rather than a random number, so a
 *  student does not change appearance when the list re-sorts. */
function pick<T>(from: T[], seed: string, salt: number): T {
  let hash = salt * 2654435761
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return from[hash % from.length]
}

export function StudentAvatar({
  seed,
  size = 44,
  className,
}: {
  /** The username, so the face is a property of the person. */
  seed: string
  size?: number
  className?: string
}) {
  const skin = pick(SKIN, seed, 1)
  const hair = pick(HAIR, seed, 2)
  const shirt = pick(SHIRT, seed, 3)
  const ground = pick(GROUND, seed, 4)
  /* Four heads, so a row of eight is not a row of one drawing repeated. */
  const cut = pick([0, 1, 2, 3], seed, 5)

  return (
    <svg
      viewBox="0 0 44 44"
      style={{ width: size, height: size }}
      role="img"
      aria-hidden="true"
      className={className}
    >
      <circle cx="22" cy="22" r="22" fill={ground} />
      {/* Shoulders, cut off by the disc as a portrait is. */}
      <path d="M6 44a16 16 0 0 1 32 0z" fill={shirt} />
      <rect x="18.5" y="24" width="7" height="7" rx="3.5" fill={skin} />
      <ellipse cx="22" cy="18.5" rx="8.5" ry="9.5" fill={skin} />
      {/* Ears, on the two cuts short enough to show them. */}
      {cut > 1 && (
        <>
          <circle cx="13.2" cy="19.5" r="1.9" fill={skin} />
          <circle cx="30.8" cy="19.5" r="1.9" fill={skin} />
        </>
      )}
      {cut === 0 && <path d="M13.5 18a8.5 9.5 0 0 1 17 0c0 3-2 1.5-8.5 1.5S13.5 21 13.5 18z" fill={hair} />}
      {cut === 1 && (
        <path
          d="M13.5 19a8.5 9.5 0 0 1 17 0c0 6 1.5 9 1.5 9h-4c1-2 1-5 1-7 0-2-3-2.5-8-2.5s-8 .5-8 2.5c0 2 0 5 1 7h-4s1.5-3 1.5-9z"
          fill={hair}
        />
      )}
      {cut === 2 && <path d="M13.6 17.5a8.5 9.5 0 0 1 16.8 0c0 1.5-1.4-.5-8.4-.5s-8.4 2-8.4.5z" fill={hair} />}
      {cut === 3 && (
        <path d="M13.5 19.5a8.5 9.5 0 0 1 17 0c0 2-1.5.5-2.5-2-1.5 1.5-9.5 2-12 0-.5 2-2.5 4-2.5 2z" fill={hair} />
      )}
      <circle cx="18.8" cy="19" r="1.05" fill="#151b26" opacity="0.75" />
      <circle cx="25.2" cy="19" r="1.05" fill="#151b26" opacity="0.75" />
      <path
        d="M19.6 22.4a3.2 3.2 0 0 0 4.8 0"
        fill="none"
        stroke="#151b26"
        strokeOpacity="0.45"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}
