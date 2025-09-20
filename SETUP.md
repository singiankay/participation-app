# Participation App Setup Guide

This guide will help you set up the participation app with Vercel, Neon PostgreSQL, Prisma, and Terraform.

## Architecture Overview

- **Frontend**: Next.js on Vercel
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Prisma
- **Infrastructure**: Terraform
- **CI/CD**: GitHub Actions
- **Local Development**: Docker Compose

## Prerequisites

1. **Node.js 20+**
2. **Docker** and **Docker Compose**
3. **Terraform**
4. **Git**
5. **Neon account** at [neon.tech](https://neon.tech)
6. **Vercel account** at [vercel.com](https://vercel.com)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Get your API key from the dashboard
4. Copy `infrastructure/terraform.tfvars.example` to `infrastructure/terraform.tfvars`
5. Fill in your Neon API key:

```bash
cp infrastructure/terraform.tfvars.example infrastructure/terraform.tfvars
```

Edit `infrastructure/terraform.tfvars`:

```
neon_api_key = "your_neon_api_key_here"
environment  = "production"
```

### 3. Provision Infrastructure with Terraform

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

This will create:

- Neon project
- PostgreSQL database
- Database user
- Connection string (saved as Terraform output)

### 4. Set up Environment Variables

Create `.env.local` for local development:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/participation_app"
```

For production, you'll get the connection string from Terraform output and set it in Vercel.

### 5. Local Development Setup

```bash
# Start local database
docker-compose up -d postgres

# Run development setup script
npm run db:setup

# Start development server
npm run dev
```

### 6. Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Get from Terraform output
   - `DIRECT_URL`: Same as DATABASE_URL for Neon
3. Deploy!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:setup` - Complete development setup
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database
- `npm run db:reset` - Reset database

## Infrastructure Management

### Terraform Commands

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure (be careful!)
terraform destroy
```

### Adding New Infrastructure

1. Edit `infrastructure/main.tf`
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) handles:

1. **Testing**: Runs on every PR

   - Installs dependencies
   - Runs linting
   - Type checking
   - Builds application
   - Runs tests with test database

2. **Deployment**: Runs on main branch
   - Builds application
   - Deploys to Vercel

### Required GitHub Secrets

Set these in your GitHub repository settings:

- `VERCEL_TOKEN`: Your Vercel API token
- `ORG_ID`: Your Vercel organization ID
- `PROJECT_ID`: Your Vercel project ID

## Database Schema

The app uses a simple `Participant` model:

```prisma
model Participant {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  phone       String?
  department  String?
  role        String?
  status      Status   @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Troubleshooting

### Database Connection Issues

1. Check if Docker is running: `docker info`
2. Check database status: `docker-compose ps`
3. Check logs: `docker-compose logs postgres`

### Terraform Issues

1. Check credentials: `aws sts get-caller-identity`
2. Verify API key: Check Neon dashboard
3. Check Terraform state: `terraform show`

### Vercel Deployment Issues

1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check GitHub Actions workflow logs

## Next Steps

1. Set up authentication (NextAuth.js)
2. Add API routes for CRUD operations
3. Implement frontend components
4. Add testing framework
5. Set up monitoring and logging
