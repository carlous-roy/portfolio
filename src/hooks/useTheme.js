import { useCallback, useEffect, useState } from 'react'

// Theme = 'dark' | 'light'. The OS preference is the default; a toggle pins the
// opposite of what is showing and remembers it in localStorage. The inline
// script in index.html applies the same rule before first paint, so the value
// read here at mount already matches the document.

export const THEME_KEY = 'theme'
const QUERY = '(prefers-color-scheme: dark)'
const BACKGROUND = { dark: '#08080c', light: '#f8f7f4' }

function systemTheme() {
  return window.matchMedia(QUERY).matches ? 'dark' : 'light'
}

function storedTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

function applyTheme(theme, pinned) {
  const root = document.documentElement
  root.dataset.theme = theme
  const scheme = document.querySelector('meta[name="color-scheme"]')
  if (scheme) scheme.content = pinned ? theme : 'light dark'
  const color = document.querySelector('meta[name="theme-color"]')
  if (color) color.content = BACKGROUND[theme]
}

export function useTheme() {
  const [pinned, setPinned] = useState(storedTheme)
  const [system, setSystem] = useState(systemTheme)
  const theme = pinned ?? system

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (e) => setSystem(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    applyTheme(theme, pinned !== null)
  }, [theme, pinned])

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setPinned(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Storage may be unavailable (private mode); the choice then lasts for the page.
    }
  }, [theme])

  return { theme, dark: theme === 'dark', toggle }
}
