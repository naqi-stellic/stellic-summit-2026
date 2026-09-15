import { TERM_OPTIONS, acceptDraft, generateDraft, generateTermDraft, planOptions } from "@/data/draft"
import {
  INITIAL_YEARS,
  SETTLED_WEEK,
  findTerm,
  scheduleTerm,
  termCredits,
  type Year,
} from "@/data/plan"

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
 * are filled with real courses. The terms behind it keep their seats — that is
 * the work still to do. */
const spring = findTerm(PLANNED, REGISTERING)

const CONCRETE: Year[] = spring
  ? acceptDraft(
      generateTermDraft(
        PLANNED,
        REGISTERING,
        termCredits(spring),
        [],
        TERM_OPTIONS[0].id,
        /* No week from the generator. Its three options each lean on one part
           of the day on purpose — that is how they tell themselves apart — and
           a term the student settled themselves should read as neither. */
        false
      ).years
    )
  : PLANNED

/* The classes were picked one at a time, so the week they make is the spread
 * one: mornings and afternoons over four days, with nothing piled into a
 * single stretch. */
export const FILLED_YEARS: Year[] = CONCRETE.map((year) => ({
  ...year,
  terms: year.terms.map((term) =>
    term.id === REGISTERING ? scheduleTerm(term, SETTLED_WEEK) : term
  ),
}))
