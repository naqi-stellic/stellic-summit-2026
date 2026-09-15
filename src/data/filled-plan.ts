import { TERM_OPTIONS, acceptDraft, generateDraft, generateTermDraft, planOptions } from "@/data/draft"
import { INITIAL_YEARS, findTerm, termCredits, type Year } from "@/data/plan"

/* The second prototype opens on a plan that has already been planned out: four
 * years of courses, a few elective seats still to be filled, and a spring whose
 * classes have all been chosen.
 *
 * It is generated rather than typed out — the same run the plan generator makes
 * and the same run Generate Term makes, taken at import — so the two prototypes
 * cannot drift apart on requirements, credits or graduation. Nothing here is a
 * second opinion about what a plan looks like. */

/** The whole degree placed at the steady pace, elective seats and all. */
const PLANNED: Year[] = acceptDraft(generateDraft(INITIAL_YEARS, planOptions(5)[0]).years)

const REGISTERING = "spring-2028"

/* Spring 2028 is the term the demo works in: its schedule is out, so its seats
 * are filled with real courses and every one of them has a section. The terms
 * behind it keep their seats — that is the work still to do. */
const spring = findTerm(PLANNED, REGISTERING)

export const FILLED_YEARS: Year[] = spring
  ? acceptDraft(
      generateTermDraft(
        PLANNED,
        REGISTERING,
        termCredits(spring),
        [],
        TERM_OPTIONS[0].id,
        true
      ).years
    )
  : PLANNED
