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

3. Create a `.env` file in the root directory with the following variables:
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

## Project Structure

```
src/
├── components/     # React components
├── assets/         # Images and static assets
├── data/           # JSON data files
└── utils/          # Utility functions
```

## Deployment

The project is configured for deployment on Azure Static Web Apps. The build output is in the `dist` folder after running `npm run build`.

### Azure Static Web Apps Deployment

The project includes a GitHub Actions workflow (`.github/workflows/azure-static-web-apps-purple-field-0f81f6c10.yml`) that automatically builds and deploys to Azure Static Web Apps when changes are pushed to the `main` branch.

**Configuration:**
- Build command: `npm run build`
- Output location: `dist`
- SPA routing: Configured via `staticwebapp.config.json`

### Hosted on Azure
https://purple-field-0f81f6c10.3.azurestaticapps.net

## License

Private project - All rights reserved
