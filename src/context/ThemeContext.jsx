import React, { createContext, useContext, useEffect } from "react";

/**
 * Nocturnal Scholar is a dark-only design system, so there is no theme to
 * switch. This provider exists purely to keep `<html>` pinned to the dark
 * class (a safety net for any residual `dark:` utility) and to expose a
 * stable, read-only context for anything that still asks for the theme.
 */

const ThemeContext = createContext({ theme: "dark" });

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = "kkmb_theme_mode";

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    try {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      // Clear the legacy toggle preference so an old "light" value can never
      // resurface if a theme switcher is reintroduced later.
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      /* storage unavailable - nothing to clean up */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};
