import { useTheme } from '../context/ThemeContext'

type ThemeToggleProps = {
  showLabel?: boolean
  className?: string
}

function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'
  const label = `Switch to ${nextTheme} mode`

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      {showLabel ? <span className="editorial-theme-toggle-label">{theme} mode</span> : null}
      <button
        type="button"
        onClick={toggleTheme}
        className="editorial-theme-toggle"
        aria-label={label}
        title={label}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  )
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.75v2.5" />
      <path d="M12 18.75v2.5" />
      <path d="M21.25 12h-2.5" />
      <path d="M5.25 12h-2.5" />
      <path d="m18.54 5.46-1.77 1.77" />
      <path d="m7.23 16.77-1.77 1.77" />
      <path d="m18.54 18.54-1.77-1.77" />
      <path d="m7.23 7.23-1.77-1.77" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.15 14.38A8.38 8.38 0 1 1 9.62 3.85 6.9 6.9 0 0 0 20.15 14.38Z" />
    </svg>
  )
}

export default ThemeToggle
