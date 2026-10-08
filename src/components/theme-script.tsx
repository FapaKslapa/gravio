const THEME_INIT = `
try {
  var theme = localStorage.getItem('theme');
  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var active = theme || system;
  var root = document.documentElement;
  root.classList.add(active);
  root.classList.remove(active === 'dark' ? 'light' : 'dark');
  root.style.colorScheme = active;
  root.dataset.accent = localStorage.getItem('theme-accent') || 'blue';
} catch (e) {}
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
