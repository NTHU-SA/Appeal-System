export const THEME_STORAGE_KEY = "theme";

// Runs before first paint. Only an explicit light/dark choice is applied;
// otherwise data-theme stays unset and the CSS follows the system setting.
const script = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export function ThemeScript() {
  return <script data-cfasync="false" dangerouslySetInnerHTML={{ __html: script }} />;
}
