# Participation App

A full-stack participation tracking application project built with Next.js, featuring secure API authentication, comprehensive testing, and automated CI/CD deployment.

## Live Demo

**[View Live Demo](https://participation-app.vercel.app/)**

## Features

- **Modern Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL
- **Secure API**: API key authentication with same-origin protection
- **Comprehensive Testing**: Unit tests (Jest) and E2E tests (Playwright)
- **Automated Deployment**: GitHub Actions + Terraform + Vercel
- **Rate Limiting**: IP-based rate limiting
- **CORS Support**: Configurable cross-origin resource sharing
- **Database Management**: Automated migrations and seeding

### User Interface Features

- **Interactive Data Table**: Sort, filter, and pagination for participant data
- **Data Visualization**: Pie chart showing participation distribution using Recharts
- **Real-time Feedback**: Toast notifications for user actions and API responses
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Form Validation**: Client-side validation with immediate feedback
- **CRUD Operations**: Create, read, update, and delete participants seamlessly

## Architecture

```
Frontend (Next.js) ←→ API Routes ←→ Database (Neon PostgreSQL)
     ↓                    ↓              ↓
   Vercel            GitHub Actions    Terraform
```

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Neon PostgreSQL (serverless)
- **Infrastructure**: Terraform
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Testing**: Jest (unit), Playwright (E2E)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- [Neon account](https://neon.tech)
- [Vercel account](https://vercel.com)

### Local Development

```bash
# Start local database
docker-compose up -d postgres

# Set up database
npm run db:setup

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Generate API Keys

```bash
# Generate API keys for authentication
npm run auth:generate-keys
```

Copy the generated keys to your `.env.local`:

```bash
# .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/participation_app"
API_KEYS="your-generated-keys-here"
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:setup         # Complete development setup
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
npm run db:reset         # Reset database

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Authentication
npm run auth:generate-keys # Generate API keys
```

## API Authentication

The API uses secure authentication with the following features:

### Same-Origin Protection

- **Frontend requests**: No authentication required (same origin)
- **External requests**: Require `X-API-Key` header
- **Development**: Authentication disabled for easier testing

### API Usage

```bash
# Frontend (automatic - no API key needed)
fetch('/api/participants')

# External API (requires API key)
curl -H "X-API-Key: your-api-key" \
     https://your-app.vercel.app/api/participants
```

### Security Features

- **Rate Limiting**: IP-based request limiting
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses

### Error Handling & User Feedback

The API returns consistent JSON error responses with appropriate HTTP status codes:

```json
{
  "error": "Error message",
  "details": ["Detailed validation errors"]
}
```

**Common Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

**Frontend Integration:**

- **Toast Notifications**: User-friendly error messages via `react-hot-toast`
- **Validation Errors**: Detailed field-specific error messages
- **Success Feedback**: Confirmation messages for successful operations

## User Interface

### Data Table Features

- **Sorting**: Click column headers to sort by name or participation percentage
- **Filtering**: Search and filter participants by name or participation range
- **Pagination**: Navigate through large datasets with page controls
- **Responsive Design**: Table adapts to different screen sizes

### Data Visualization

- **Pie Chart**: Interactive pie chart showing participation distribution
- **Real-time Updates**: Chart updates automatically when data changes
- **Color Coding**: Visual representation of participation percentages
- **Interactive Elements**: Hover effects and click interactions
- **Progress Bar**: Visual indicator showing total participation progress toward 100%

### User Experience

- **Toast Notifications**:
  - Success messages for completed actions
  - Error messages for failed operations
  - Validation feedback for form inputs
- **Form Validation**: Real-time validation with immediate feedback
- **Loading States**: Visual indicators during API operations
- **Progress Tracking**: Visual progress bar showing total participation toward 100% limit

## Testing

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test tests/unit/validation.test.ts
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui
```

## Deployment

### Quick Setup

1. **Create Vercel Project**: Import from GitHub repository
2. **Add GitHub Secrets**:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `NEON_API_KEY`: Your Neon database API key
   - `API_KEYS`: Generate with `npm run auth:generate-keys`
3. **Deploy**: Push to main branch

### Automated CI/CD Pipeline

The GitHub Actions workflow handles:

1. **Testing**: Unit and E2E tests on every PR
2. **Infrastructure**: Terraform provisioning
3. **Deployment**: Automatic Vercel deployment
4. **Environment**: Secure environment variable management

### Testing Requirements

**Deployment is blocked if tests fail:**

- **Unit Tests**: Must pass (Jest)
- **E2E Tests**: Must pass (Playwright)
- **Skip Tests**: Use `[skip-tests]` in commit message or workflow dispatch

### Required GitHub Secrets

Set these in your GitHub repository settings:

- `NEON_API_KEY`: Your Neon database API key
- `VERCEL_TOKEN`: Your Vercel API token
- `API_KEYS`: Comma-separated API keys for authentication

## Infrastructure

### Automated Infrastructure Management

The infrastructure is automatically managed through GitHub Actions:

- **Terraform**: Automatically provisions and manages infrastructure
- **Neon PostgreSQL**: Serverless database created and configured
- **Vercel**: Frontend and API hosting with environment variables
- **Environment Variables**: Automatically synced from GitHub Secrets

### Infrastructure Components

- **Neon PostgreSQL**: Serverless database
- **Vercel**: Frontend and API hosting
- **GitHub Actions**: CI/CD pipeline with Terraform integration
- **Environment Variables**: Secure configuration management

## Project Structure

```
participation-app/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── components/        # React components
│   │   └── context/           # React context
│   ├── lib/                   # Utility functions
│   ├── middleware/            # Custom middleware
│   └── dto/                   # Data transfer objects
├── tests/
│   ├── unit/                  # Unit tests (Jest)
│   └── e2e/                   # E2E tests (Playwright)
├── infrastructure/            # Terraform configuration
├── .github/workflows/         # GitHub Actions
└── docs/                      # Documentation
```

## Future Improvements

- **Stateful Terraform**: Implement Terraform state management with remote backend (S3, Azure Storage, or GCS)
- **Infrastructure Monitoring**: Add CloudWatch, DataDog, or similar monitoring solutions
- **Multi-environment**: Separate staging and production environments with proper isolation
- **Enhanced Authentication**: Implement JWT tokens with refresh mechanism
- **Code Documentation**: Comprehensive JSDoc and API documentation
- **Design Patterns**: Implement repository, factory, and observer patterns
- **Caching Strategy**: Redis for session management and data caching
- **Responsive Design**: Support for mobile and improvements to breakpoints and layout

## Documentation

- [API Documentation](./docs/API.md) - Complete API reference with examples

## Configuration

### Environment Variables

```bash
# Local Development (.env.local)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/participation_app"
API_KEYS="your-generated-keys-here"

# Production (Vercel)
DATABASE_URL="postgresql://user:pass@host:5432/db"
DIRECT_URL="postgresql://user:pass@host:5432/db"
API_KEYS="your-production-keys-here"
```

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Vercel](https://vercel.com/) - Deployment platform
- [Terraform](https://terraform.io/) - Infrastructure as Code
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation
- [Jest](https://jestjs.io/) - Unit testing framework
- [Playwright](https://playwright.dev/) - End-to-end testing
