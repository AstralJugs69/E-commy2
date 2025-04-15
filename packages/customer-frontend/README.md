# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## PWA Configuration

This project is configured as a Progressive Web App (PWA) using `vite-plugin-pwa`. Follow these steps to ensure the PWA functionality works correctly:

### Required Icon Files

The following icon files must be placed in the `public/images/icons/` directory:

- `icon-192x192.png` - A 192x192 pixel PNG icon for Android devices
- `icon-512x512.png` - A 512x512 pixel PNG icon for larger devices and high-resolution displays

These files are referenced in the PWA manifest configuration in `vite.config.ts` and are necessary for proper PWA functionality.

### Configuration Files

1. **vite.config.ts**: Contains the PWA plugin configuration with manifest details:
   - App name: "Hybrid Store"
   - Theme color: #14B8A6
   - Icons configuration
   - Workbox configuration for asset caching

2. **index.html**: Contains required meta tags:
   - `<meta name="theme-color" content="#14B8A6" />`
   - `<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />`

### Testing PWA Functionality

1. Build the app for production: `npm run build`
2. Preview the build: `npm run preview`
3. Use Chrome's Lighthouse tool to verify PWA compliance
4. Test installation on both desktop and mobile devices

### Customizing the PWA

To customize the PWA configuration:
1. Modify the manifest settings in `vite.config.ts`
2. Update the theme-color in both `vite.config.ts` and `index.html`
3. Replace the icon files with your own branded versions
