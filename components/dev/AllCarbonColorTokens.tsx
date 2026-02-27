import React from 'react';

type Token = {
  name: string;
  value: string;
  category: string;
};

const PALETTE_REGEX =
  /^--cds-(blue|cool-gray|cyan|gray|green|magenta|orange|purple|red|teal|warm-gray|yellow|black|white)-/;

function getCategoryForToken(name: string): string {
  if (PALETTE_REGEX.test(name)) return 'Palette';
  if (name.startsWith('--cds-background') || name.startsWith('--cds-layer-')) {
    return 'Background & layers';
  }
  if (name.startsWith('--cds-text-') || name.startsWith('--cds-icon-')) {
    return 'Text & icons';
  }
  if (
    name.startsWith('--cds-border-') ||
    name.startsWith('--cds-focus') ||
    name.startsWith('--cds-shadow')
  ) {
    return 'Borders & focus';
  }
  if (
    name.startsWith('--cds-interactive') ||
    name.startsWith('--cds-link-') ||
    name.startsWith('--cds-toggle-')
  ) {
    return 'Interactive & links';
  }
  if (name.startsWith('--cds-support-')) {
    return 'Support & status';
  }
  if (name.startsWith('--cds-ai-') || name.startsWith('--cds-chat-')) {
    return 'AI & chat';
  }
  if (name.startsWith('--cds-syntax-')) {
    return 'Syntax';
  }
  return 'Other';
}

function collectCarbonColorTokens(): Token[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [];
  }

  const style = getComputedStyle(document.documentElement);
  const names: string[] = [];

  for (let i = 0; i < style.length; i += 1) {
    const propName = style.item(i);
    if (!propName || !propName.startsWith('--cds-')) continue;

    const value = style.getPropertyValue(propName).trim();
    if (!value) continue;

    // Heuristic: only keep values that look like colors (hex / rgb[a] / hsl[a])
    if (/^#|^rgb|^hsl/i.test(value)) {
      names.push(propName);
    }
  }

  const uniqueNames = Array.from(new Set(names)).sort();

  return uniqueNames.map((name) => ({
    name,
    value: style.getPropertyValue(name).trim(),
    category: getCategoryForToken(name),
  }));
}

export function AllCarbonColorTokens() {
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [themeLabel, setThemeLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateFromTheme = () => {
      const next = collectCarbonColorTokens();
      setTokens(next);

      const dataTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setThemeLabel(dataTheme === 'light' ? 'g10 (light)' : 'g100 (dark)');
    };

    // Initial load
    updateFromTheme();

    // Watch for changes to the data-theme attribute (Storybook toolbar toggles)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateFromTheme();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  if (tokens.length === 0) {
    return (
      <div className="text-xs text-text-helper">
        Color tokens are resolved from computed styles in the browser. If you see this message
        persistently, ensure `tokens.css` and `carbon-tokens.css` are loaded in Storybook.
      </div>
    );
  }

  // Group tokens by category for easier scanning in Storybook
  const byCategory = tokens.reduce<Record<string, Token[]>>((acc, token) => {
    const key = token.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(token);
    return acc;
  }, {});

  const categoryOrder = [
    'Palette',
    'Background & layers',
    'Text & icons',
    'Borders & focus',
    'Interactive & links',
    'Support & status',
    'AI & chat',
    'Syntax',
    'Other',
  ];

  const orderedCategories = Object.keys(byCategory).sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-text-helper">
          All <code>--cds-*</code> tokens whose values resolve to colors (hex, rgb, or hsl) for the
          current Carbon theme.
        </p>
        {themeLabel && (
          <span className="rounded-full border border-border-subtle-01 bg-layer-01 px-2 py-0.5 text-[11px] text-text-helper">
            Theme: {themeLabel}
          </span>
        )}
      </div>

      {orderedCategories.map((category) => {
        const items = byCategory[category].slice().sort((a, b) => a.name.localeCompare(b.name));
        return (
          <section key={category} className="space-y-3">
            <h3 className="text-xs font-medium text-text-primary">{category}</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((token) => (
                <div
                  key={token.name}
                  className="flex items-center gap-3 rounded-md border border-border-subtle-01 bg-layer-01 p-2"
                >
                  <div
                    className="h-8 w-8 rounded border border-border-subtle-01"
                    style={{ backgroundColor: `var(${token.name})` }}
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="truncate text-xs font-mono text-text-primary">{token.name}</div>
                    <div className="truncate text-[11px] font-mono text-text-helper">
                      {token.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

