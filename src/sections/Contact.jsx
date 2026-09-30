import Reveal from '../components/Reveal'
import { Body, H2, Label } from '../components/Primitives'
import { LinkedIn, Mail } from '../icons'
import { CONTACT } from '../content/site'

const FIELD =
  'w-full px-5 py-4 rounded-2xl border border-edge bg-surface text-tx text-[16px] font-sans'
const LABEL = 'block text-sm font-medium text-su mb-1.5'

export default function Contact() {
  return (
    <section
      id="contact"
      className="min-h-[90vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]"
    >
      <div className="max-w-[640px] mx-auto w-full text-center">
        <Reveal>
          <Label>Contact</Label>
          <H2 className="mb-4">Let&rsquo;s connect.</H2>
          <Body className="text-su mb-3">
            Got a question, opportunity, or just want to say hello? Drop a message.
          </Body>
          <p className="text-sm text-mu mb-12">{CONTACT.location} &middot; open to relocation</p>
        </Reveal>
        <Reveal delay={0.15}>
          {/* Plain HTML post to Formspree; the site has no backend for mail. */}
          <form
            action={CONTACT.formEndpoint}
            method="POST"
            className="flex flex-col gap-5 text-left"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className={LABEL}>
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={LABEL}>
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  className={FIELD}
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className={LABEL}>
                Subject <span className="text-mu font-normal">(optional)</span>
              </label>
              <input id="contact-subject" name="subject" type="text" className={FIELD} />
            </div>
            <div>
              <label htmlFor="contact-message" className={LABEL}>
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                className={`${FIELD} resize-y min-h-[140px]`}
              />
            </div>
            {/* Honeypot: hidden from people, filled by naive bots, dropped by Formspree. */}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="honeypot"
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-full border-0 text-white text-[16px] font-semibold font-sans cursor-pointer self-center transition-transform hover:-translate-y-0.5 bg-button"
              style={{ boxShadow: '0 4px 24px rgba(220,38,38,0.2)' }}
            >
              Send message
            </button>
          </form>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="flex items-center justify-center gap-3 mt-10 mb-5">
            <div className="h-px flex-1 max-w-[60px] bg-line" aria-hidden="true" />
            <span className="text-sm text-mu">or reach out directly</span>
            <div className="h-px flex-1 max-w-[60px] bg-line" aria-hidden="true" />
          </div>
          <ul className="flex items-center justify-center gap-4 flex-wrap list-none m-0 p-0">
            <li>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-link flex items-center gap-2.5 px-5 py-3 rounded-full border border-edge text-su text-sm font-medium no-underline transition-transform hover:-translate-y-0.5 hover:text-accent-text"
              >
                <LinkedIn size={18} /> LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="pill-link flex items-center gap-2.5 px-5 py-3 rounded-full border border-edge text-su text-sm font-medium no-underline transition-transform hover:-translate-y-0.5 hover:text-accent-text"
              >
                <Mail size={18} /> Email
              </a>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
