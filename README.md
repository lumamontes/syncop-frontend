# Syncop API Frontend

A modern financial management web application built with React, TypeScript, and Modern.js. This frontend application provides a comprehensive interface for managing personal finances, including accounts, transactions, budgets, goals, and financial reporting.

## 🚀 Features

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Protected routes with auth guards
  - Session management

- **Account Management**
  - Create and manage multiple accounts
  - Support for different account types (checking, savings, credit, etc.)
  - Track account balances and available funds
  - Multi-currency support

- **Transaction Tracking**
  - Record income and expenses
  - Categorize transactions
  - Filter and search transactions
  - Transaction history and details

- **Budget Management**
  - Create monthly or custom period budgets
  - Budget items with category allocation
  - Track budget progress and spending
  - Budget summaries and analytics

- **Financial Goals**
  - Set and track financial goals
  - Goal contributions tracking
  - Progress visualization
  - Goal types: Emergency Fund, Savings, Debt Payoff, etc.

- **Recurring Transactions**
  - Schedule recurring income and expenses
  - Automatic transaction reminders
  - Manage subscription and bill tracking

- **Categories**
  - Custom category creation
  - System and user-defined categories
  - Category-based filtering and reporting

- **Financial Dashboard**
  - Real-time financial overview
  - Income vs. expense summaries
  - Account balance aggregation
  - Transaction statistics
  - Financial reports and analytics

- **Data Management**
  - Import transactions from CSV (Nubank format supported)
  - Data export capabilities
  - Bulk operations

## 🛠️ Tech Stack

### Core Framework
- **[Modern.js](https://modernjs.dev/)** (v2.68.19) - Full-stack React framework
- **[React](https://react.dev/)** (v18.3.1) - UI library
- **[TypeScript](https://www.typescriptlang.org/)** (v5.7.3) - Type safety

### UI & Styling
- **[Ant Design](https://ant.design/)** (v5.28.0) - Component library
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4.14) - Utility-first CSS
- **[@ant-design/icons](https://github.com/ant-design/ant-design-icons)** - Icon library

### State Management & Data Fetching
- **[TanStack React Query](https://tanstack.com/query)** (v5.90.7) - Server state management
- **[Zustand](https://zustand-demo.pmnd.rs/)** (v5.0.8) - Client state management

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** (v7.66.0) - Form handling
- **[react-hook-form-persist](https://github.com/kien-ht/react-hook-form-persist)** - Form persistence

### HTTP Client
- **[Axios](https://axios-http.com/)** (v1.13.2) - HTTP requests

### Utilities
- **[dayjs](https://day.js.org/)** (v1.11.19) - Date manipulation

### Development Tools
- **[Biome](https://biomejs.dev/)** (v1.9.4) - Linting and formatting
- **[Rspack](https://rspack.dev/)** - Fast bundler (via Modern.js)
- **[lint-staged](https://github.com/okonet/lint-staged)** - Pre-commit hooks
- **[simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)** - Git hooks management

### Package Manager
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

## 📋 Prerequisites

- **Node.js** >= 16.18.1
- **pnpm** >= 8.0.0 (recommended) or npm/yarn
- **Backend API** running on `http://localhost:8081` (see [backend.md](./backend.md) for backend setup)

## 🏗️ Project Structure

The project follows **Feature-Sliced Design (FSD)** architecture:

```
frontend/
├── api/
│   └── lambda/              # BFF (Backend for Frontend) API routes
│       ├── accounts/
│       ├── auth/
│       ├── budgets/
│       ├── categories/
│       ├── dashboard.ts
│       ├── goals/
│       ├── recurring-transactions/
│       └── transactions/
├── src/
│   ├── app/                  # App-level configuration
│   │   └── providers/        # React context providers
│   ├── features/             # Feature modules (FSD)
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── recurring-transactions/
│   │   ├── seed/
│   │   └── transactions/
│   ├── routes/               # Page routes
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── signup/
│   └── shared/               # Shared utilities and components
│       ├── api/              # API client configuration
│       └── ui/               # Reusable UI components
├── dist/                     # Build output
├── modern.config.ts          # Modern.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

### Feature Module Structure

Each feature module typically contains:
- `*.api.ts` - API client functions
- `*.types.ts` - TypeScript type definitions
- `*.component.tsx` or `*.form.tsx` - React components
- `index.ts` - Public exports

## 🚀 Getting Started

### Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the backend API** (see [backend.md](./backend.md) for details):
   ```bash
   # Ensure the backend is running on http://localhost:8081
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000` (or the port shown in the terminal)

## 📜 Available Scripts

### Development
```bash
pnpm dev          # Start development server with hot reload
```

### Build
```bash
pnpm build        # Build for production
pnpm start        # Start production server
pnpm serve        # Preview production build locally
```

### Code Quality
```bash
pnpm lint         # Run Biome linter and formatter
```

### Utilities
```bash
pnpm reset        # Remove all node_modules directories
pnpm new           # Add new features or entries (Modern.js CLI)
pnpm upgrade       # Upgrade Modern.js dependencies
```

## 🔧 Configuration

### Backend API URL

The backend API URL is configured in the BFF routes (`api/lambda/*.ts` files). By default, it's set to:

```typescript
const BACKEND_URL = 'http://localhost:8081/api';
```

To change the backend URL, update the `BACKEND_URL` constant in each BFF route file, or consider using environment variables.

### TypeScript Path Aliases

Path aliases are configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@shared/*` → `./shared/*`
- `@api/*` → `./api/lambda/*`

### Modern.js Configuration

The Modern.js configuration is in `modern.config.ts`. Key features:
- **Rspack bundler** for fast builds
- **Tailwind CSS plugin** for styling
- **BFF plugin** for API routes
- **Router** enabled for client-side routing

## 🏛️ Architecture

### BFF (Backend for Frontend) Pattern

The application uses Modern.js BFF plugin to create API routes that act as a proxy between the frontend and backend:

- Frontend components call `/api/*` endpoints
- BFF routes in `api/lambda/` forward requests to the backend API
- Authentication tokens are automatically forwarded
- Response formatting and error handling are centralized

### State Management

- **Server State**: Managed by TanStack React Query
  - Automatic caching and refetching
  - Optimistic updates
  - Error handling and retries

- **Client State**: Managed by Zustand
  - Authentication state (`auth.store.ts`)
  - User session data
  - UI state

### Authentication Flow

1. User logs in via `/login` page
2. JWT token is stored in `localStorage` as `authToken`
3. Axios interceptor adds token to all API requests
4. Protected routes check authentication via `AuthGuard` component
5. On 401 errors, user is redirected to login

### Routing

- **Public Routes**: `/`, `/login`, `/signup`
- **Protected Routes**: `/dashboard`, `/profile`, `/settings`
- Route protection is handled by `AuthGuard` component

## 🎨 UI Components

The application uses **Ant Design** components with **Tailwind CSS** for styling:

- Forms: `Form`, `Input`, `Select`, `DatePicker`
- Data Display: `Table`, `Card`, `Statistic`, `List`
- Feedback: `Message`, `Modal`, `Popconfirm`
- Navigation: `Tabs`, `Menu`, `Breadcrumb`
- Layout: `Row`, `Col`, `Space`

## 🔒 Security

- JWT tokens stored in `localStorage` (consider httpOnly cookies for production)
- Automatic token injection via Axios interceptors
- Protected routes with authentication guards
- API error handling with automatic logout on 401

## 🧪 Development Workflow

1. **Create a new feature**:
   ```bash
   pnpm new
   ```

2. **Run linter before committing**:
   ```bash
   pnpm lint
   ```

3. **Pre-commit hooks** automatically run lint-staged to check code quality

4. **Feature development**:
   - Create feature module in `src/features/`
   - Add API client in `src/features/[feature]/[feature].api.ts`
   - Create BFF route in `api/lambda/[feature]/`
   - Add page route in `src/routes/[page]/page.tsx`

## 📦 Building for Production

1. **Build the application**:
   ```bash
   pnpm build
   ```

2. **Preview the build**:
   ```bash
   pnpm serve
   ```

3. **Deploy**:
   The `dist/` directory contains the production build ready for deployment to any static hosting service (Vercel, Netlify, AWS S3, etc.)

## 🔗 Backend Integration

This frontend connects to a Kotlin Spring Boot backend API. For backend setup and API documentation, see [backend.md](./backend.md).

**Backend Requirements**:
- Running on `http://localhost:8081`
- JWT authentication enabled
- CORS configured to allow frontend origin

## 📝 Code Style

- **Linter**: Biome (configured in `biome.json`)
- **TypeScript**: Strict mode enabled
- **Formatting**: Automatic formatting on save (if configured in IDE)
- **Git Hooks**: Pre-commit hooks run lint-staged

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, Modern.js will automatically use the next available port.

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8081`
- Check CORS configuration in backend
- Verify JWT token is being sent in requests (check browser DevTools Network tab)

### Build Errors
- Clear `dist/` directory: `rm -rf dist`
- Clear node_modules: `pnpm reset && pnpm install`
- Check TypeScript errors: `pnpm build`

## 📚 Additional Resources

- [Modern.js Documentation](https://modernjs.dev/)
- [React Documentation](https://react.dev/)
- [Ant Design Documentation](https://ant.design/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` to ensure code quality
4. Commit your changes (pre-commit hooks will run automatically)
5. Push and create a pull request

## 📄 License

[Add your license information here]

---

**Built with ❤️ using Modern.js and React**
