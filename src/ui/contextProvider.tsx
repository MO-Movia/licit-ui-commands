// contextProvider.js
import React, { createContext } from 'react';

const ThemeContext = createContext('light');
const ThemeConsumer = ThemeContext.Consumer;

const ThemeProvider = ({ children, theme }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTheme, setCurrentTheme] = React.useState(theme);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeConsumer, ThemeContext };