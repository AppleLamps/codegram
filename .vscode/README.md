# VS Code Configuration for Tailwind CSS v4

This directory contains VS Code workspace settings to properly support Tailwind CSS v4 syntax and eliminate CSS diagnostic errors.

## Files Created

### `settings.json`
- Disables default CSS validation to prevent conflicts with Tailwind directives
- Configures Tailwind CSS IntelliSense extension
- Sets up file associations for better CSS support
- Enables quick suggestions for CSS strings

### `css_custom_data.json`
- Defines custom CSS at-rules for Tailwind CSS v4
- Includes support for:
  - `@import` - Import Tailwind modules
  - `@tailwind` - Insert Tailwind styles
  - `@apply` - Apply utility classes
  - `@layer` - Define style layers
  - `@custom-variant` - Create custom variants (v4 feature)
  - `@theme` - Define theme values inline (v4 feature)
  - `@config` - Configure Tailwind in CSS (v4 feature)
  - `@plugin` - Load plugins in CSS (v4 feature)

### `extensions.json`
- Recommends essential VS Code extensions:
  - Tailwind CSS IntelliSense
  - TypeScript support
  - Prettier code formatter
  - JSON language support

## What This Fixes

The configuration resolves these CSS diagnostic errors:
- "Unknown at rule @custom-variant"
- "Unknown at rule @theme"
- "Unknown at rule @apply"

## Tailwind CSS v4 Features

This project uses Tailwind CSS v4, which introduces:
- CSS-first configuration
- Inline theme definitions with `@theme`
- Custom variants with `@custom-variant`
- Improved PostCSS integration

## Installation

To get the full benefits:
1. Install the recommended extensions when prompted by VS Code
2. Reload VS Code window if needed
3. The CSS errors should disappear automatically

## Troubleshooting

If you still see CSS errors:
1. Ensure the Tailwind CSS IntelliSense extension is installed
2. Reload the VS Code window (Ctrl+Shift+P → "Developer: Reload Window")
3. Check that `tailwind.config.js` exists in the project root