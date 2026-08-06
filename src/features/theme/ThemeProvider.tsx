import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_PUBLIC_THEME, THEMES, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils";

type ThemeContextValue = {
  theme: ThemeId;
};

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_PUBLIC_THEME });

/** Read the active theme from any component inside a ThemeProvider. */
export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  theme?: ThemeId;
  children: ReactNode;
  className?: string;
  /** Render as a plain wrapper without full-height background. */
  bare?: boolean;
};

/**
 * Scopes a set of design tokens to a subtree via `data-theme`.
 *
 * Tokens live in src/styles.css; this component only decides which block
 * applies. Nesting is supported — a section can opt into a different theme
 * without affecting the rest of the app.
 */
export function ThemeProvider({
  theme = DEFAULT_PUBLIC_THEME,
  children,
  className,
  bare = false,
}: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        data-theme={theme}
        style={{ colorScheme: THEMES[theme].colorScheme }}
        className={cn(
          !bare && "min-h-screen bg-background text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
