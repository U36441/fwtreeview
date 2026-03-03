import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  dark: 'from-gray-800 via-gray-900 to-black',
  light: 'from-gray-100 via-gray-200 to-gray-300',
  blue: 'from-blue-500 via-purple-500 to-purple-600',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>('blue');

  const themeClass = themes[theme as keyof typeof themes] || themes.dark;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
