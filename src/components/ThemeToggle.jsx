import './ThemeToggle.css'

const STAR_PATH = "M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
const CIRCLE   = <circle cx="50" cy="50" r="50" />

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <label className="tt-switch">
      <input
        type="checkbox"
        className="tt-input"
        checked={isDark}
        onChange={onToggle}
        aria-label="Toggle theme"
      />
      <div className="tt-slider tt-round">
        <div className="tt-sun-moon">
          <svg className="tt-moon-dot" id="tt-moon-dot-1" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-moon-dot" id="tt-moon-dot-2" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-moon-dot" id="tt-moon-dot-3" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-light-ray" id="tt-light-ray-1" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-light-ray" id="tt-light-ray-2" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-light-ray" id="tt-light-ray-3" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-cloud tt-cloud-dark" id="tt-cloud-1" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-cloud tt-cloud-dark" id="tt-cloud-2" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-cloud tt-cloud-dark" id="tt-cloud-3" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-cloud tt-cloud-light" id="tt-cloud-4" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-cloud tt-cloud-light" id="tt-cloud-5" viewBox="0 0 100 100">{CIRCLE}</svg>
          <svg className="tt-cloud tt-cloud-light" id="tt-cloud-6" viewBox="0 0 100 100">{CIRCLE}</svg>
        </div>
        <div className="tt-stars">
          <svg className="tt-star" id="tt-star-1" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
          <svg className="tt-star" id="tt-star-2" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
          <svg className="tt-star" id="tt-star-3" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
          <svg className="tt-star" id="tt-star-4" viewBox="0 0 20 20"><path d={STAR_PATH} /></svg>
        </div>
      </div>
    </label>
  )
}
