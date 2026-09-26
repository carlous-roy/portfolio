import PropTypes from 'prop-types'
import Reveal from '../components/Reveal'
import { BulletList, H2, Label } from '../components/Primitives'
import { External, Github } from '../icons'
import { PROJECTS, ROLE_FILTERS } from '../content/projects'

const BADGE = {
  Live: 'badge-ok',
  Demo: 'badge-ok',
  'Case Study': 'badge-warn',
}

const LINK_LABEL = {
  Live: 'Open the site',
  Demo: 'Open the browser demo',
  'Case Study': 'Read the case study',
}

export default function Projects({ role, setRole }) {
  const matches = (p) => role === 'all' || p.roles.includes(role)
  const ordered =
    role === 'all'
      ? PROJECTS.map((p) => [p, false])
      : [
          ...PROJECTS.filter(matches).map((p) => [p, false]),
          ...PROJECTS.filter((p) => !matches(p)).map((p) => [p, true]),
        ]

  return (
    <section
      id="projects"
      className="min-h-screen flex items-center py-28 px-[clamp(24px,6vw,80px)]"
    >
      <div className="max-w-[1000px] mx-auto w-full">
        <Reveal>
          <Label>Projects</Label>
          <H2 className="mb-6">Things I&rsquo;ve built.</H2>
        </Reveal>
        <Reveal>
          <div
            className="flex flex-wrap gap-2 mb-10"
            role="group"
            aria-label="Filter projects by role"
          >
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRole(f.id)}
                aria-pressed={role === f.id}
                className={`px-4 py-2.5 rounded-full text-[13px] font-medium border-0 cursor-pointer transition-colors ${
                  role === f.id ? 'text-white bg-accent' : 'text-su bg-chip'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="flex flex-col gap-7">
          {ordered.map(([p, dim], i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <article
                className="p-6 md:p-9 rounded-[24px] bg-surface border border-edge card-hover"
                style={{ opacity: dim ? 0.5 : 1, transition: 'opacity .35s ease' }}
                aria-labelledby={`project-${p.name}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-4">
                  <div>
                    <h3
                      id={`project-${p.name}`}
                      className="text-[20px] md:text-[24px] font-bold tracking-tight m-0"
                    >
                      {p.name}
                      <span
                        className={`ml-3 text-[11px] font-semibold px-3 py-1 rounded-full align-middle ${BADGE[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </h3>
                    <p className="text-[14px] md:text-[15px] mt-1 text-mu">{p.sub}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} code on GitHub`}
                        className="text-su flex items-center gap-1.5 text-sm no-underline hover:text-accent-text transition-colors py-2"
                      >
                        <Github size={18} /> Code
                      </a>
                    )}
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name}: ${LINK_LABEL[p.status]}`}
                        className="text-accent-text flex items-center gap-1.5 text-sm no-underline py-2"
                      >
                        <External /> {p.status}
                      </a>
                    )}
                  </div>
                </div>
                <ul
                  className="flex flex-wrap gap-2 mb-5 list-none m-0 p-0"
                  aria-label="Technologies"
                >
                  {p.tech.map((t) => (
                    <li
                      key={t}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-chip text-su"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <BulletList items={p.bullets} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

Projects.propTypes = {
  role: PropTypes.string.isRequired,
  setRole: PropTypes.func.isRequired,
}
