# E-Commy Customer Frontend

The customer-facing storefront for the E-Commy platform built with React, TypeScript, and Vite.

## Environment Setup

Create a `.env` file in the packages/customer-frontend directory with the following variables:

```
# API configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

The customer frontend can run as a containerized service with:

```bash
# Build the container
docker build -t ecommy-customer-frontend .

# Run the container
docker run -p 3010:80 -e VITE_API_BASE_URL=http://localhost:10000/api ecommy-customer-frontend
```

For a complete deployment with backend and admin frontend, use:

```bash
# From the project root
docker-compose up -d
```

## Image Handling

The application now uses Cloudinary for image storage:

1. All product images are served directly from Cloudinary
2. Image URLs in the UI are managed by the `getImageUrl()` utility
3. The utility automatically handles both relative paths and absolute Cloudinary URLs

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
