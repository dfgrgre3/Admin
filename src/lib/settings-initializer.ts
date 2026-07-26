export async function initializeSettings(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const theme = window.localStorage.getItem("tolo-theme");
  if (theme === "light" || theme === "dark" || theme === "system") {
    document.documentElement.dataset.theme = theme;
  }
}
