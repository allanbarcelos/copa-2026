export default function ThemeToggle({ theme, isAuto, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={isAuto ? 'Auto (click to override)' : 'Click to toggle theme'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
      {isAuto && <span className="theme-auto-dot" />}
    </button>
  )
}
