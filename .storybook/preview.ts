import React from 'react';
import type { Preview } from '@storybook/react';
import '../app/styles/tokens.css';
import '../app/globals.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global light/dark theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || 'dark';

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }

    return React.createElement(
      'div',
      {
        'data-theme': theme,
        className: 'min-h-screen bg-background text-text-primary',
      },
      React.createElement(Story, null),
    );
  },
];