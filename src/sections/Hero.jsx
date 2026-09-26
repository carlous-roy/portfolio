import PropTypes from 'prop-types'
import Reveal from '../components/Reveal'
import GreetingCycle from '../components/GreetingCycle'
import HeroPhoto from '../components/HeroPhoto'
import { ArrowRight, Download, Sparkle } from '../icons'
import { HEADLINE, HERO_EDUCATION, NAME, RESUME_PATH, SHORT_NAME, TAGLINE } from '../content/site'

export default function Hero({ onOpenChat }) {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center pt-24 pb-16 px-[clamp(16px,4vw,80px)]"
    >
      <div className="max-w-[1200px] w-full mx-auto">
        <div className="flex items-center md:justify-center gap-6 md:gap-16">
          <div className="flex-1 min-w-0">
            <Reveal>
              <p
                className="relative text-su"
                style={{ fontSize: 'clamp(26px, 4.5vw, 52px)', fontWeight: 300, lineHeight: 1.3 }}
              >
                <GreetingCycle />
                <span className="text-mu">, I&rsquo;m</span>
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1
                className="font-black leading-[0.95] mb-5"
                style={{ fontSize: 'clamp(52px, 10vw, 108px)', letterSpacing: '-0.04em' }}
              >
                {SHORT_NAME.toUpperCase()}
                <span className="visually-hidden">, {NAME}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p
                className="mb-1 text-su"
                style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 400 }}
              >
                {HEADLINE}
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <p className="mb-5 text-mu" style={{ fontSize: 'clamp(14px, 1.5vw, 17px)' }}>
                {TAGLINE}
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <a
                href={RESUME_PATH}
                download
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-edge text-tx text-sm font-medium no-underline whitespace-nowrap transition-transform hover:-translate-y-0.5 mb-8 resume-pop backdrop-blur-md"
                style={{ animationDelay: '1s' }}
              >
                <Download /> Resume (PDF)
              </a>
            </Reveal>
            <Reveal delay={0.3}>
              <div
                className="mb-8 max-w-[560px] leading-[1.8] text-su"
                style={{ fontSize: 'clamp(15px, 1.8vw, 20px)' }}
              >
                {HERO_EDUCATION.map((e) => (
                  <p key={e.degree}>
                    {e.degree}
                    <span className="text-mu font-light">, {e.where}</span>
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.35} className="flex-shrink-0">
            <HeroPhoto />
          </Reveal>
        </div>

        <Reveal delay={0.4}>
          <button
            type="button"
            onClick={onOpenChat}
            className="chat-bar chat-bar-glow flex items-center gap-3 px-5 py-4 rounded-2xl border w-full max-w-[560px] mt-2 text-left cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <span className="text-accent-text" aria-hidden="true">
              <Sparkle />
            </span>
            <span className="flex-1 text-[15px] text-mu">
              Ask Roy&rsquo;s AI anything
              <span className="blinking-cursor" aria-hidden="true" />
            </span>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white bg-button"
              aria-hidden="true"
            >
              <ArrowRight />
            </span>
          </button>
        </Reveal>
      </div>
    </section>
  )
}

Hero.propTypes = { onOpenChat: PropTypes.func.isRequired }
