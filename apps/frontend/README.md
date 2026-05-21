# NileoPedia Medical Frontend

This is the frontend application for NileoPedia-medical, an AI-powered medical knowledge platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Layout components (Navbar, Sidebar, etc.)
│   │   ├── ui/             # Basic UI components (Button, Input, etc.)
│   │   ├── query/          # Query-related components
│   │   └── validator/      # Validator-related components
│   ├── context/            # React context providers
│   ├── data/               # Mock data and constants
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── public/         # Public-facing pages
│   │   ├── validator/      # Validator dashboard pages
│   │   └── *.tsx           # Other pages
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── index.css           # Global CSS
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **Markdown**: React Markdown with GFM
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **TypeScript**: 5.9.3

## 🧩 Available Scripts

- `pnpm dev` - Start development server at http://localhost:5173
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint (if configured)
- `pnpm test` - Run tests (if configured)

## 🔧 Environment Variables

Create a `.env` file in the frontend directory based on `.env.example` if needed:

```env
VITE_API_URL=http://localhost:3000/api
# Add other frontend-specific environment variables here
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the NileoPedia-medical monorepo. See the root [LICENSE](../LICENSE) file for details.