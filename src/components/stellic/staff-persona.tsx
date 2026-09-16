import { Icon } from "@/components/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Face } from "@/components/stellic/staff-chrome"
import { PERSONAS, type Persona, type PersonaKey } from "@/data/staff-home"

/* The prototype's own control, hung on the account circle because that is where
 * "who am I signed in as" already lives.
 *
 * It is the only way to see what this page actually is. Staff Home read as one
 * person is a dashboard; read as seven it is a permission model, and the seven
 * are the argument — a curriculum admin who cannot publish, a study abroad
 * coordinator with exactly one workflow, a faculty advisor with nothing but
 * notes. The caption says it is not a real feature, because it is not. */

export function PersonaMenu({
  persona,
  onSelect,
}: {
  persona: Persona
  onSelect: (key: PersonaKey) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Signed in as ${persona.name}. Change who is looking`}
        className="cursor-pointer rounded-full transition-shadow hover:shadow-[0_0_0_3px_var(--color-primary-0)]"
      >
        <Face initials={persona.initials} color={persona.color} size={40} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[242px]">
        <DropdownMenuLabel className="text-overline text-gray-60 uppercase">
          View as · prototype only
        </DropdownMenuLabel>
        {PERSONAS.map((other) => (
          <DropdownMenuItem key={other.key} onSelect={() => onSelect(other.key)} className="gap-2.5">
            <Face initials={other.initials} color={other.color} size={24} />
            <span className="min-w-0 flex-1">
              <span className="font-medium">{other.name}</span>{" "}
              <span className="text-label-md text-gray-80">· {other.role}</span>
            </span>
            {other.key === persona.key && (
              <Icon name="check" size={14} className="shrink-0 text-primary-50" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
