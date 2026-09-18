import { cn } from "cn"

/* The UI Kit's spinner: an arc a little longer than a half-circle, round
 * capped, turning. Figma 19241:2055.
 *
 * It carries no label. A spinner beside the words "Finding students" is the
 * same sentence twice, and the thing it is standing in for — the list — says
 * what it is the moment it arrives. */

export function Spinner({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
      className={cn("animate-spin text-gray-60", className)}
    >
      <path
        d="M5.4 24A14 14 0 1 1 30.6 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
