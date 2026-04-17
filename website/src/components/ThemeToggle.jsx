import { Sun, Moon } from './icons';

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className={`theme-toggle-icon ${isLight ? 'is-active' : 'is-hidden'}`}>
        <Moon size={16} />
      </span>
      <span className={`theme-toggle-icon ${isLight ? 'is-hidden' : 'is-active'}`}>
        <Sun size={16} />
      </span>
    </button>
  );
}
