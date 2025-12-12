# Woodland Conservation Area Website

A modern, responsive website for the Woodland Conservation Area featuring interactive maps, weather widgets, photo galleries, and educational content about the conservation site.

## Features

- Interactive trail map with geolocation
- Real-time weather widget
- Photo gallery with community uploads
- Ecology education section
- Natural burial information
- Shop for conservation products
- Dark mode support
- Text-to-speech accessibility features

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **Open-Meteo API** - Weather data
- **Azure Cognitive Services** - Text-to-speech
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Cypress** - Testing framework

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Then fill in your actual API keys:
   ```
   VITE_AZURE_SPEECH_KEY=your_azure_speech_key
   VITE_AZURE_REGION=your_azure_region
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run cypress:open` - Open Cypress Test Runner
- `npm run cypress:run` - Run Cypress tests headlessly

## Project Structure

```
src/
├── components/     # React components
├── assets/         # Images and static assets
├── data/           # JSON data files
└── utils/          # Utility functions
cypress/
├── component/      # Component tests
├── e2e/            # End-to-end tests
├── fixtures/       # Test fixtures
└── support/        # Cypress support files
```

## Testing

The project uses Cypress for both component and end-to-end testing.

### Running Tests

- **Open Cypress Test Runner**: `npm run cypress:open`
- **Run tests headlessly**: `npm run cypress:run`

### Test Structure

- **Component Tests**: Located in `cypress/component/` - Test individual React components in isolation
- **E2E Tests**: Located in `cypress/e2e/` - Test full user workflows and page interactions

### Test Coverage

- Homepage component and page
- Ecology component and page
- Footer component
- Sitemap/Map page

## Deployment

The project is configured for deployment on both Azure Static Web Apps and Netlify. The build output is in the `dist` folder after running `npm run build`.

### Azure Static Web Apps Deployment

The project includes a GitHub Actions workflow (`.github/workflows/azure-static-web-apps-purple-field-0f81f6c10.yml`) that automatically builds and deploys to Azure Static Web Apps when changes are pushed to the `main` branch.

**Configuration:**
- Build command: `npm run build`
- Output location: `dist`
- SPA routing: Configured via `staticwebapp.config.json`

**Hosted on Azure:** https://purple-field-0f81f6c10.3.azurestaticapps.net

### Netlify Deployment

The project is also configured for Netlify deployment via `netlify.toml`.

**Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing: Configured via `public/_redirects` file
- Node version: 20

**To deploy on Netlify:**
1. Connect your GitHub repository to Netlify
2. Set the following environment variables in Netlify dashboard:
   - `VITE_AZURE_SPEECH_KEY` - Your Azure Speech Services key
   - `VITE_AZURE_REGION` - Your Azure Speech Services region (e.g., `westus3`)
3. Netlify will automatically detect the `netlify.toml` configuration and deploy

## Environment Variables

### Required API Keys

**Azure Speech Services** (for text-to-speech features)
- Get your keys from: https://portal.azure.com
- Required variables: `VITE_AZURE_SPEECH_KEY`, `VITE_AZURE_REGION`

### Local Development
- Copy `.env.example` to `.env` and fill in your actual API keys
- Never commit `.env` to version control (it's in `.gitignore`)

### Production Deployment
- **DO NOT** push your `.env` file to GitHub (security risk!)
- Instead, configure environment variables in your hosting platform:
  - **Netlify**: Dashboard → Site settings → Environment variables
  - **Azure**: Configuration → Application settings

## Sources

**Ecology Section:**
Natural History of the French Village Conservation Woodland. A Report to the French Village Conservation Woodland Committee by David Patriquin, Jess Lewis, Livy Fraser, Liam Holwell, Rohan Kariyawansa. Nov. 2021

## License

Private project - All rights reserved
