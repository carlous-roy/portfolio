import Reveal from '../components/Reveal'
import { BulletList, H2, Label, TONE_CLASS } from '../components/Primitives'
import { EXPERIENCE, EXP_ROLES } from '../content/experience'

const TITLE_WEIGHT = ['font-bold', 'font-semibold', 'font-medium']

export default function Experience() {
  return (
    <section
      id="experience"
      className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]"
    >
      <div className="max-w-[900px] mx-auto w-full">
        <Reveal>
          <Label>Experience</Label>
          <H2>
            {EXPERIENCE.employer} <span className="font-normal text-mu">→ {EXPERIENCE.client}</span>{' '}
            <span className="font-normal text-[0.45em] text-mu">({EXPERIENCE.note})</span>
          </H2>
          <p className="font-mono text-sm mt-3 mb-10 text-mu">{EXPERIENCE.period}</p>
        </Reveal>
        <Reveal delay={0.1}>
          {/* The path through the three titles, newest first. Decorative: the
              roles themselves follow as headings. */}
          <p className="hidden sm:flex items-center gap-3 flex-wrap mb-8 m-0" aria-hidden="true">
            {EXP_ROLES.map((role, i) => (
              <span key={role.title}>
                {i > 0 && <span className="text-mu"> ← </span>}
                <span className={`text-lg ${TITLE_WEIGHT[i]} ${TONE_CLASS[role.tone]}`}>
                  {role.title}
                </span>
              </span>
            ))}
          </p>
          <p className="flex sm:hidden flex-col gap-2 mb-8 m-0" aria-hidden="true">
            {EXP_ROLES.map((role, i) => (
              <span key={role.title} className="flex items-center gap-2">
                {i > 0 && <span className="text-[10px] text-mu">↑</span>}
                <span className={`text-base ${TITLE_WEIGHT[i]} ${TONE_CLASS[role.tone]}`}>
                  {role.title}
                </span>
              </span>
            ))}
          </p>
        </Reveal>
        {EXP_ROLES.map((role, i) => (
          <Reveal key={role.title} delay={0.15 + i * 0.05}>
            <div className={i < EXP_ROLES.length - 1 ? 'mb-8' : ''}>
              <div className="flex justify-between flex-wrap gap-2 mb-3">
                <h3 className={`text-base font-semibold m-0 ${TONE_CLASS[role.tone]}`}>
                  {role.title}
                </h3>
                <span className="font-mono text-xs text-mu">{role.period}</span>
              </div>
              <BulletList items={role.bullets} dot={role.dot} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
