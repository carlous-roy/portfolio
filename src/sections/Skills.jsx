import { useState } from 'react'
import PropTypes from 'prop-types'
import Reveal from '../components/Reveal'
import { H2, Label } from '../components/Primitives'
import { Chevron, SKILL_GLYPHS } from '../icons'
import { SKILLS, SKILL_TILES } from '../content/skills'

// One tile: a self-hosted brand icon, or the label when there is no icon or
// the image fails to load. Tiles are decorative; the card button names the
// category and the expanded list names every skill.
function SkillTile({ tile, dark }) {
  const [failed, setFailed] = useState(false)
  const src = tile.file
    ? `/skill-icons/${tile.file}.png`
    : tile.icon && `/skill-icons/${tile.icon}-${dark ? 'dark' : 'light'}.svg`
  const box = 'aspect-square rounded-xl flex items-center justify-center overflow-hidden bg-chip'
  if (src && !failed) {
    return (
      <span className={box}>
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={48}
          height={48}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }
  return (
    <span
      className={`${box} px-1.5 text-center leading-tight font-semibold text-su`}
      style={{ fontSize: 'clamp(9px, 1.1vw, 12px)' }}
    >
      {tile.label}
    </span>
  )
}
SkillTile.propTypes = {
  tile: PropTypes.shape({
    icon: PropTypes.string,
    file: PropTypes.string,
    label: PropTypes.string.isRequired,
  }).isRequired,
  dark: PropTypes.bool.isRequired,
}

// A skill category: six tiles, the category name and count, and the full list
// behind a click. Collapsed by default so the section reads as six things.
function SkillCard({ cat, items, dark, open, onToggle }) {
  const Glyph = SKILL_GLYPHS[cat]
  const tiles = SKILL_TILES[cat]
  const more = items.length - tiles.length
  const panelId = `skills-${cat.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className="rounded-2xl bg-surface border border-edge card-hover overflow-hidden">
      <h3 className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full p-5 sm:p-6 bg-transparent border-0 cursor-pointer text-left font-sans block text-tx"
        >
          <span className="grid grid-cols-3 gap-2.5 mb-5" aria-hidden="true">
            {tiles.map((t) => (
              <SkillTile key={t.label} tile={t} dark={dark} />
            ))}
          </span>
          <span className="flex items-center gap-3.5 min-h-[66px]">
            <span
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-accent-soft text-accent-text"
              aria-hidden="true"
            >
              <Glyph />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold tracking-tight">{cat}</span>
              <span className="block text-[12.5px] mt-0.5 text-mu">
                {more > 0
                  ? `+${more} more skill${more === 1 ? '' : 's'}`
                  : `${items.length} skills`}
              </span>
            </span>
            <span
              className="shrink-0 text-mu transition-transform duration-300"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }}
              aria-hidden="true"
            >
              <Chevron />
            </span>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <ul
            className="flex flex-wrap gap-2 px-5 sm:px-6 pb-6 pt-1 list-none m-0"
            aria-label={`${cat} skills`}
            aria-hidden={!open}
          >
            {items.map((t) => (
              <li
                key={t}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-chip text-su"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
SkillCard.propTypes = {
  cat: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  dark: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
}

export default function Skills({ dark }) {
  const [openSkill, setOpenSkill] = useState(null)
  return (
    <section id="skills" className="min-h-[80vh] flex items-center py-28 px-[clamp(24px,6vw,80px)]">
      <div className="max-w-[960px] mx-auto w-full">
        <Reveal>
          <Label>Skills</Label>
          <H2 className="mb-12">What I work with.</H2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {Object.entries(SKILLS).map(([cat, items], i) => (
            <Reveal key={cat} delay={i * 0.06}>
              <SkillCard
                cat={cat}
                items={items}
                dark={dark}
                open={openSkill === cat}
                onToggle={() => setOpenSkill(openSkill === cat ? null : cat)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
Skills.propTypes = { dark: PropTypes.bool.isRequired }
