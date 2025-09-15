# HowTalk AI Messenger

**🌍 Language / 언어**: [English](README.md) | [한국어](README-ko.md)

AI-powered real-time messenger application with intelligent conversation assistance, persona-based chat features, and integrated payment system.

## 🚀 Features

### 💬 Messaging System
- **Real-time Messaging**: Instant chat with WebSocket integration
- **AI Persona System**: Context-aware AI assistance with different personalities
- **Friend Management**: Add and manage friends with real-time status
- **Group Chats**: Create and manage group conversations

### 💳 Payment Integration
- **토스페이먼츠 연동**: Secure payment processing with TossPayments
- **단건결제**: One-time payment for credits and services
- **정기결제/구독**: Subscription-based billing with automatic renewal
- **결제 내역 관리**: Complete payment history and transaction tracking
- **환불 시스템**: Automated refund processing

### 🔐 Authentication & Security
- **Supabase Auth**: Email/password and OAuth (Google) authentication
- **프로필 관리**: User profile with payment information
- **Row Level Security**: Database-level access control
- **Type Safety**: Full TypeScript implementation with strict type checking

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Mode**: Automatic theme switching support
- **shadcn/ui Components**: Modern component library built on Radix UI
- **Accessibility**: WCAG compliant interface components

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

### Payment System
- **토스페이먼츠** - Korean payment gateway integration
- **TossPayments SDK v2** - Latest payment widget and API
- **Payment MCP** - Model Context Protocol for payment operations
- **Billing System** - Subscription and one-time payment support

### Development Tools
- **ESLint** - Code linting and quality checks
- **React Query** - Server state management
- **React Router** - Client-side routing
- **React Hook Form** - Form state management

## 📁 Project Structure

```
howtalk/
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components (47 components)
│   │   ├── auth/              # Authentication components
│   │   │   └── AuthPage.tsx   # Login/signup interface
│   │   ├── payment/           # Payment system components
│   │   │   ├── ProductCard.tsx    # Product display and purchase
│   │   │   ├── PaymentHistory.tsx # Payment transaction history
│   │   │   └── PaymentSection.tsx # Main payment management
│   │   └── HowTalkMessenger.tsx   # Main messenger interface
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.tsx        # Authentication with payment info
│   │   ├── usePayments.tsx    # Payment operations
│   │   ├── useTossPayments.tsx # TossPayments integration
│   │   ├── use-mobile.tsx     # Mobile device detection
│   │   └── use-toast.ts       # Toast notifications
│   ├── integrations/          # External service integrations
│   │   └── supabase/          # Supabase client and types
│   ├── lib/                   # Utility libraries
│   ├── pages/                 # Page components
│   │   ├── PaymentSuccess.tsx # Payment success handling
│   │   └── PaymentFail.tsx    # Payment failure handling
│   └── main.tsx              # Application entry point
├── supabase/                  # Database schema and migrations
└── public/                    # Static assets
```

## 🗄️ Database Schema

The application uses 11 main tables for the messaging and payment system:

### Messaging System
1. **profiles** - User profile information with payment data
2. **chat_rooms** - Chat rooms (individual/group)
3. **chat_participants** - Chat room membership
4. **messages** - Messages with AI persona support
5. **friendships** - Friend relationship management

### Payment System
6. **products** - Available products and services
7. **subscription_plans** - Subscription billing plans
8. **payments** - Payment transactions (one-time/subscription)
9. **subscriptions** - Active subscription management
10. **customer_payment_info** - Customer billing information
11. **refunds** - Refund transaction records

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/howtalk.git
   cd howtalk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Supabase configuration is pre-configured in the client
   - TossPayments test keys are included for development
   - Create `.env` file for production deployment:
   ```bash
   VITE_TOSS_CLIENT_KEY=your_toss_client_key
   TOSS_SECRET_KEY=your_toss_secret_key
   ```

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

**Built with ❤️ by the HowTalk team**