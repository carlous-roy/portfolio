import Reveal from '../components/Reveal'
import { Body, Label } from '../components/Primitives'
import { Briefcase, Code, GradCap, Layers } from '../icons'
import { ABOUT, NAME } from '../content/site'

const LINKS = [
  { id: 'experience', label: 'Experience', icon: <Briefcase /> },
  { id: 'projects', label: 'Projects', icon: <Layers /> },
  { id: 'skills', label: 'Skills', icon: <Code /> },
  { id: 'education', label: 'Education', icon: <GradCap /> },
]

export default function About() {
  return (
    <section id="about" className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
      <div className="max-w-[900px] mx-auto w-full">
        <Reveal>
          <Label>About</Label>
          <h2
            className="font-extrabold mb-10"
            style={{
              fontSize: 'clamp(22px, 3vw, 36px)',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
            }}
          >
            {NAME}
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          {ABOUT.map((paragraph, i) => (
            <Body key={paragraph} className={`text-su ${i > 0 ? 'mt-6' : ''}`}>
              {paragraph}
            </Body>
          ))}
        </Reveal>
        <Reveal delay={0.3}>
          <ul className="flex items-center gap-4 mt-12 flex-wrap list-none m-0 p-0">
            {LINKS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="pill-link flex items-center gap-2.5 px-5 py-3 rounded-full border border-edge text-su text-sm font-medium no-underline transition-transform hover:-translate-y-0.5"
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
