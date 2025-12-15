# MijnDAVI Frontend Admin

© 2025 by MijnDAVI

## Overview

MijnDAVI Frontend Admin is a modern, production-ready Next.js 15 application that provides a comprehensive administrative interface for childcare center management. The application enables administrators and staff to manage documents, users, companies, and interact with a RAG-powered document querying system.

Built with React 19, the frontend features a responsive design, role-based access control, real-time document chat, and seamless integration with Keycloak for enterprise-grade authentication.

## Architecture

### Core Components

1. **Next.js 15 App Router**
   - Server and client components
   - Route groups for protected/public pages
   - Layout composition
   - Optimized rendering strategies

2. **Authentication & Authorization**
   - Keycloak integration via `@react-keycloak/web`
   - Protected route wrapper
   - Role-based UI rendering
   - Token management and refresh

3. **State Management**
   - React Context API for workspace management
   - Zustand for global state (when needed)
   - Local component state for UI interactions

4. **Document Management**
   - PDF viewer with snippet highlighting
   - Document upload and organization
   - Folder and role-based access
   - Real-time document chat interface

5. **Multi-Tenant Workspace System**
   - Company switching
   - Workspace context management
   - Isolated data per company

## Technology Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **React**: 19.0.0
- **Authentication**: Keycloak JS 26.2.0
- **Styling**: Tailwind CSS 4.1.11
- **PDF Processing**: react-pdf 10.0.1, pdfjs-dist 5.3.31
- **HTTP Client**: Axios 1.10.0
- **UI Components**: Lucide React 0.545.0
- **Notifications**: React Toastify 11.0.5
- **State Management**: Zustand 5.0.8
- **Fonts**: Montserrat (Google Fonts)

## Project Structure

```
DAVI_frontend_admin/
├── src/
│   ├── app/
│   │   ├── layout.js                    # Root layout with providers
│   │   ├── page.js                      # Landing page
│   │   ├── (protected)/                 # Protected route group
│   │   │   ├── layout.js                # Protected layout wrapper
│   │   │   ├── landing/
│   │   │   │   └── page.js              # Dashboard landing
│   │   │   ├── documentchat/            # RAG document chat
│   │   │   ├── documenten/              # Document management
│   │   │   ├── gebruikers/             # User management
│   │   │   ├── compagnies/             # Company management (super admin)
│   │   │   ├── rollen/                 # Role management
│   │   │   ├── mappen/                 # Folder management
│   │   │   ├── GGD/                    # GGD inspection features
│   │   │   ├── instellingen/           # Settings
│   │   │   └── ...
│   │   └── (public)/                    # Public route group
│   │       └── ...
│   ├── components/
│   │   ├── layout/
│   │   │   ├── mainLayout.js           # Main application layout
│   │   │   ├── Header.js               # Application header
│   │   │   ├── HeaderAdmin.js          # Admin header variant
│   │   │   ├── LeftSidebar.js          # Navigation sidebar
│   │   │   ├── RightSidebar.js         # Context sidebar
│   │   │   └── Footer.js               # Application footer
│   │   ├── KeycloakProviderWrapper.js  # Keycloak provider
│   │   ├── ProtectedRoute.js           # Route protection HOC
│   │   ├── ProtectedLayout.js          # Layout protection
│   │   ├── ThirdPartyScripts.js        # Cookiebot, Progressier
│   │   ├── PdfClientViewer.js          # PDF viewer component
│   │   ├── PdfSnippetList.js           # PDF snippet display
│   │   ├── WorkspaceSwitcher.js        # Company switcher
│   │   └── ...
│   ├── context/
│   │   └── WorkspaceContext.js         # Workspace state management
│   └── lib/
│       ├── keycloak.js                 # Keycloak configuration
│       └── ...
├── public/
│   ├── pdfs/                           # Static PDF documents
│   └── ...
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, pnpm, or bun
- Keycloak instance (for authentication)
- Backend API access

### Setup

1. **Clone and navigate to the project**
   ```bash
   cd DAVI_frontend_admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Keycloak Configuration
   NEXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-instance.com
   NEXT_PUBLIC_KEYCLOAK_REALM=your-realm
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id
   NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI=http://localhost:3000

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

### Document Management

- **Upload Documents**: Upload PDF files with automatic indexing
- **Organize by Folders**: Create and manage document folders
- **Role-Based Access**: Assign documents to specific roles
- **Private Documents**: Mark documents as private for restricted access
- **Document Search**: Search through document metadata
- **PDF Viewer**: View documents with highlighted snippets

### RAG Document Chat

- **Natural Language Queries**: Ask questions about your documents
- **Contextual Answers**: Receive answers with source document references
- **Snippet Highlighting**: View highlighted sections in original PDFs
- **Multiple Models**: Support for various LLM backends
- **Chat History**: Track conversation history

### User Management

- **User CRUD**: Create, read, update, and delete users
- **Bulk Import**: Import users via Excel/CSV files
- **Role Assignment**: Assign roles to users
- **Password Management**: Reset user passwords
- **Team Management**: Manage team members and admins

### Company Management (Super Admin)

- **Multi-Tenant**: Manage multiple companies
- **Company Admins**: Assign administrators to companies
- **Module Access**: Control feature access per company
- **Workspace Switching**: Switch between company workspaces

### Role & Permission Management

- **Custom Roles**: Create and configure custom roles
- **Role Assignment**: Assign roles to users and documents
- **Permission Control**: Fine-grained access control

### GGD Inspection Features

- **Compliance Checks**: Automated compliance checking
- **File Upload**: Upload inspection documents
- **Result Visualization**: View compliance check results
- **Export Capabilities**: Export reports and results

### Additional Features

- **3-Uurs Module**: Specialized 3-hour program management
- **BKR Module**: Background check management
- **VGC Module**: VGC-related features
- **Settings**: Application configuration

## Key Components

### Authentication Flow

1. User accesses protected route
2. `ProtectedRoute` component checks authentication
3. If not authenticated, redirects to Keycloak login
4. After login, Keycloak redirects back with token
5. Token stored in localStorage and used for API calls
6. User context loaded and workspace initialized

### Workspace Management

The `WorkspaceContext` provides:
- Current company/workspace selection
- Workspace switching functionality
- Company-specific data isolation
- Context propagation to child components

### Document Chat Flow

1. User submits question via chat interface
2. Request sent to backend `/ask/run` endpoint
3. Backend queries RAG service
4. Response includes answer and document snippets
5. Frontend displays answer with source references
6. User can view highlighted PDFs for each snippet

## Development

### Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Code Style

- Use functional components with hooks
- Prefer server components when possible
- Use TypeScript-style JSDoc comments
- Follow Next.js 15 best practices
- Implement proper error boundaries

### Component Guidelines

1. **Server vs Client Components**
   - Use server components by default
   - Mark client components with `'use client'`
   - Minimize client component usage

2. **State Management**
   - Use React hooks for local state
   - Use Context for shared state
   - Consider Zustand for complex global state

3. **Styling**
   - Use Tailwind CSS utility classes
   - Create reusable component styles
   - Maintain consistent design system

4. **API Integration**
   - Use Axios for HTTP requests
   - Implement proper error handling
   - Handle loading and error states

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak server URL | Yes |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm name | Yes |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client ID | Yes |
| `NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI` | OAuth redirect URI | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker

```bash
# Build image
docker build -t mijndavi-frontend .

# Run container
docker run -p 3000:3000 --env-file .env.local mijndavi-frontend
```

### Static Export

```bash
npm run build
# Output in .next directory
```

## Production Considerations

1. **Performance**
   - Enable Next.js Image Optimization
   - Implement code splitting
   - Use dynamic imports for heavy components
   - Optimize bundle size

2. **Security**
   - Validate all user inputs
   - Sanitize data before rendering
   - Use HTTPS in production
   - Implement CSP headers
   - Secure cookie settings

3. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times
   - Track user analytics
   - Log critical errors

4. **Accessibility**
   - Follow WCAG guidelines
   - Test with screen readers
   - Ensure keyboard navigation
   - Maintain color contrast ratios

## Third-Party Integrations

### Cookiebot

Cookie consent management integrated via `ThirdPartyScripts` component. Handles:
- Cookie consent dialogs
- Consent state management
- GDPR compliance

### Progressier

PWA functionality and app installation prompts.

## Troubleshooting

### Common Issues

1. **Keycloak Authentication Fails**
   - Verify environment variables
   - Check Keycloak server accessibility
   - Ensure redirect URI matches configuration
   - Check browser console for errors

2. **API Connection Errors**
   - Verify `NEXT_PUBLIC_API_URL`
   - Check CORS configuration on backend
   - Ensure backend is running
   - Review network tab in DevTools

3. **PDF Viewer Not Loading**
   - Check PDF file accessibility
   - Verify CORS headers for PDF files
   - Check browser console for errors
   - Ensure pdfjs-dist is properly installed

4. **Build Errors**
   - Clear `.next` directory
   - Delete `node_modules` and reinstall
   - Check for TypeScript/ESLint errors
   - Verify all environment variables are set

5. **Hydration Errors**
   - Check for server/client mismatch
   - Ensure `suppressHydrationWarning` where needed
   - Review component rendering logic
   - Check for date/time formatting issues

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025 by MijnDAVI. All rights reserved.

---

## Quick Reference

### Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Key URLs (Development)
- Application: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`

### Project Links
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
