import Reveal from '../components/Reveal'
import { Body, H2, Label } from '../components/Primitives'
import { EDU } from '../content/education'

export default function Education() {
  return (
    <section
      id="education"
      className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]"
    >
      <div className="max-w-[900px] mx-auto w-full">
        <Reveal>
          <Label>Education</Label>
          <H2 className="mb-14">Where I studied.</H2>
        </Reveal>
        <div className="flex flex-col gap-7">
          {EDU.map((e, i) => (
            <Reveal key={e.school} delay={i * 0.12}>
              <article className="p-6 sm:p-9 rounded-[24px] bg-surface border border-edge card-hover">
                <div className="flex justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-xl font-bold m-0">{e.school}</h3>
                  <span className="font-mono text-xs text-mu">{e.period}</span>
                </div>
                <Body className="text-su !leading-normal">{e.deg}</Body>
                <p className="text-sm text-mu mt-1">{e.loc}</p>
                {e.courses && (
                  <p className="text-sm text-mu mt-4">
                    <span className="font-semibold text-su">Relevant coursework:</span> {e.courses}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
