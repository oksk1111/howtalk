# Talk-Wiz AI Messenger

AI-powered real-time messenger application with intelligent conversation assistance and persona-based chat features.

## 🚀 Features

- **Real-time Messaging**: Instant chat with WebSocket integration
- **AI Persona System**: Context-aware AI assistance with different personalities
- **Friend Management**: Add and manage friends with real-time status
- **Group Chats**: Create and manage group conversations
- **Modern UI**: Beautiful, responsive design with dark/light mode support
- **Type-safe**: Full TypeScript implementation with strict type checking

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript with strict checking
- **Vite** - Fast build tool with HMR
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library built on Radix UI
- **Lucide React** - Beautiful SVG icons

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Secure data access policies
- **Authentication** - Email/password and OAuth providers

### Development Tools
- **ESLint** - Code linting and quality checks
- **React Query** - Server state management
- **React Router** - Client-side routing
- **React Hook Form** - Form state management

## 📁 Project Structure

```
talk-wiz/
├── .cursor/rules/              # Cursor AI development rules
│   ├── project-structure.mdc   # Project architecture guide
│   ├── typescript-conventions.mdc # TypeScript coding standards
│   ├── react-components.mdc    # React component guidelines
│   ├── supabase-integration.mdc # Backend integration patterns
│   └── ui-styling.mdc          # UI/UX design system
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components (47 components)
│   │   └── MessengerApp.tsx   # Main messenger interface
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.tsx        # Authentication management
│   │   ├── use-mobile.tsx     # Mobile device detection
│   │   └── use-toast.ts       # Toast notifications
│   ├── integrations/          # External service integrations
│   │   └── supabase/          # Supabase client and types
│   ├── lib/                   # Utility libraries
│   ├── pages/                 # Page components
│   └── main.tsx              # Application entry point
├── supabase/                  # Database schema and migrations
└── public/                    # Static assets
```

## 🗄️ Database Schema

The application uses 5 main tables for the messaging system:

1. **profiles** - User profile information
2. **chat_rooms** - Chat rooms (individual/group)
3. **chat_participants** - Chat room membership
4. **messages** - Messages with AI persona support
5. **friendships** - Friend relationship management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/oksk1111/talk-wiz.git
   cd talk-wiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Supabase configuration is pre-configured in the client
   - No additional environment variables required for development

4. **Start development server**
   ```bash
npm run dev
```

5. **Open in browser**
   - Navigate to `http://localhost:8080`
   - The app will hot-reload as you make changes

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎨 UI Components

This project uses shadcn/ui components for a consistent, accessible design system:

- **47 UI Components** - Buttons, inputs, dialogs, and more
- **Accessibility First** - Built on Radix UI primitives
- **Customizable** - Full control over styling with Tailwind CSS
- **Dark Mode** - Automatic theme switching support

## 🔧 Development Guidelines

This project includes comprehensive Cursor Rules for consistent development:

- **TypeScript Conventions** - Naming, imports, type safety
- **React Component Patterns** - Structure, hooks, state management
- **Supabase Integration** - Database operations, authentication
- **UI Styling** - Design system, responsive design, accessibility

## 🤖 AI Features

- **Conversation Assistance** - AI-powered message suggestions
- **Persona System** - Different AI personalities for various contexts
- **Smart Responses** - Context-aware reply recommendations
- **Natural Language** - Human-like conversation flow

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Responsive Layout** - Adapts to all screen sizes
- **Touch Friendly** - Gesture-based interactions
- **PWA Ready** - Progressive Web App capabilities

## 🔐 Security

- **Row Level Security** - Database-level access control
- **Authentication** - Secure user management with Supabase Auth
- **Type Safety** - Prevents runtime errors with TypeScript
- **Input Validation** - Client and server-side validation

## 🚀 Deployment

The app can be deployed to any static hosting service:

- **Vercel** - Recommended for React apps
- **Netlify** - Simple deployment with git integration
- **GitHub Pages** - Free hosting for public repositories
- **Supabase Hosting** - Integrated with the backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Supabase** - Backend infrastructure
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library

---

**Built with ❤️ by the Talk-Wiz team**