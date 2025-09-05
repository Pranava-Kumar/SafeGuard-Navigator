# SafeRoute Development Scripts Guide

## Overview

This guide explains all the development scripts available in SafeRoute to help you set up, run, and manage your development environment effectively.

## Available Scripts

### Core Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start the frontend development server |
| `build` | `npm run build` | Build the production-ready frontend |
| `start` | `npm run start` | Start the production frontend server |
| `lint` | `npm run lint` | Run code quality checks |

### Database Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `setup-db` | `npm run setup-db` | Set up the database with initial schema |
| `prisma:migrate` | `npm run prisma:migrate` | Run database migrations |
| `prisma:generate` | `npm run prisma:generate` | Generate Prisma client |
| `prisma:studio` | `npm run prisma:studio` | Start Prisma Studio for database browsing |

### Setup and Management Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `setup` | `npm run setup` | Run the interactive setup assistant |
| `quick-start` | `npm run quick-start` | Run the quick start guide |
| `check` | `npm run check` | Check the status of all services |
| `start:all` | `npm run start:all` | Start all development services |
| `stop:all` | `npm run stop:all` | Stop all development services |

## Detailed Script Descriptions

### Development Server Scripts

#### `npm run dev`
Starts the Next.js frontend development server with hot reloading:
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000`

#### `npm run build`
Builds the production-ready frontend:
```bash
npm run build
```
Output files are placed in the `.next` directory.

#### `npm run start`
Starts the production frontend server:
```bash
npm run start
```

#### `npm run lint`
Runs ESLint to check code quality:
```bash
npm run lint
```

### Database Management Scripts

#### `npm run setup-db`
Sets up the database with initial schema and data:
```bash
npm run setup-db
```
This script:
1. Creates the database if it doesn't exist
2. Runs Prisma migrations
3. Generates Prisma client
4. Sets up initial data

#### `npm run prisma:migrate`
Runs database migrations:
```bash
npm run prisma:migrate
```

#### `npm run prisma:generate`
Generates the Prisma client:
```bash
npm run prisma:generate
```

#### `npm run prisma:studio`
Starts Prisma Studio for database browsing:
```bash
npm run prisma:studio
```
Prisma Studio will be available at `http://localhost:5555`

### Setup and Management Scripts

#### `npm run setup`
Runs the interactive setup assistant:
```bash
npm run setup
```
This script:
1. Checks prerequisites
2. Sets up frontend dependencies
3. Sets up backend virtual environment
4. Installs dependencies
5. Configures environment variables

#### `npm run quick-start`
Runs the quick start guide:
```bash
npm run quick-start
```
This script:
1. Performs basic setup checks
2. Creates virtual environment
3. Installs dependencies
4. Sets up environment configuration

#### `npm run check`
Checks the status of all services:
```bash
npm run check
```
This script:
1. Checks frontend status
2. Checks backend API status
3. Checks OSRM service status
4. Checks database connection

#### `npm run start:all`
Starts all development services:
```bash
npm run start:all
```
This script:
1. Starts OSRM service
2. Starts backend server
3. Starts frontend development server

#### `npm run stop:all`
Stops all development services:
```bash
npm run stop:all
```
This script:
1. Gracefully stops frontend server
2. Gracefully stops backend server
3. Gracefully stops OSRM service

## Batch Script Files

In addition to npm scripts, there are several batch script files available in the project root:

### `setup-assistant.bat`
Interactive setup assistant that guides you through the initial setup process.

### `quick-start.bat`
Quick start guide that performs basic setup checks and configurations.

### `start-all.bat`
Starts all services (OSRM, backend, frontend) in separate windows.

### `stop-all.bat`
Gracefully stops all running services.

### `check-services.bat`
Checks the status of all services and provides detailed error reporting.

### `setup-osrm.bat`
Sets up and starts the OSRM service (must be run from backend directory).

## Usage Examples

### Setting Up a New Development Environment

1. Run the setup assistant:
   ```bash
   npm run setup
   ```

2. Check service statuses:
   ```bash
   npm run check
   ```

3. Start all services:
   ```bash
   npm run start:all
   ```

### Daily Development Workflow

1. Start all services:
   ```bash
   npm run start:all
   ```

2. Develop your features

3. Check for code quality issues:
   ```bash
   npm run lint
   ```

4. Stop all services when done:
   ```bash
   npm run stop:all
   ```

### Database Management

1. Set up database:
   ```bash
   npm run setup-db
   ```

2. Browse database:
   ```bash
   npm run prisma:studio
   ```

### Troubleshooting

1. Check service statuses:
   ```bash
   npm run check
   ```

2. If services are not running, start them:
   ```bash
   npm run start:all
   ```

3. If still having issues, stop and restart:
   ```bash
   npm run stop:all
   npm run start:all
   ```

## Best Practices

### Environment Management
- Always activate the virtual environment before working on backend code:
  ```bash
  cd backend
  .venv\Scripts\activate
  ```

### Dependency Management
- Install backend dependencies manually:
  ```bash
  pip install -e .
  ```

### Service Management
- Use `start:all` and `stop:all` for consistent service management
- Check service statuses regularly with `check`

### Code Quality
- Run linting before committing code:
  ```bash
  npm run lint
  ```

## Troubleshooting Common Issues

### Services Not Starting
1. Check if prerequisites are installed
2. Verify environment variables in `.env`
3. Check service statuses with `npm run check`

### Database Connection Issues
1. Verify `DATABASE_URL` in `.env`
2. Ensure database server is running
3. Test connection manually with database client

### OSRM Issues
1. Ensure `chennai.osm.pbf` is in `backend/` directory
2. Verify OSRM executables are in `OSRM/` directory
3. Allow time for initial OSRM processing (5-15 minutes)

## Additional Resources

- **Development Setup Guide**: `DEVELOPMENT_SETUP.md`
- **OSRM Setup Guide**: `OSRM_SETUP.md`
- **Troubleshooting Guide**: `TROUBLESHOOTING.md`
- **Backend README**: `backend/README.md`
- **Service Status Documentation**: `Documentation/SERVICE_STATUS.md`