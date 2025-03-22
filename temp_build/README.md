# Frontend Application

This is a React application using Relay and TypeScript for enhanced type safety and consistent builds.

## Development Setup

### Prerequisites

- Node.js v18.15.0 (use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node.js versions)
- npm v9.x
- Docker (for local Docker builds)

### Installation

```bash
# Install dependencies
npm ci
```

### Development Server

```bash
# Start the development server
npm start
```

The application will be available at http://localhost:3000.

## Build & Testing

### Standard Build

```bash
# Build the application
npm run build
```

This runs through the following steps:
1. Fix import paths in test files
2. TypeScript type check
3. ESLint check
4. Relay compiler
5. Production build

### Testing

```bash
# Run tests
npm test

# Run tests once
npm test -- --watchAll=false
```

### Type Checking

```bash
# Basic type checking
npm run type-check
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Docker Builds

To ensure consistent builds across environments, you can use Docker:

### Prerequisites

- Docker installed and running
- Docker daemon available

### Building with Docker

For Windows:
```bash
npm run docker-build-win
```

For macOS/Linux:
```bash
npm run docker-build
```

These scripts will:
1. Build the Docker image using the Dockerfile
2. Run tests in the container (optional)
3. Serve the built application (optional)

### Running the Docker Container

```bash
# Build and run the container
docker build -t frontend-build .
docker run -p 8080:80 frontend-build
```

The application will be available at http://localhost:8080.

## Deployment

```bash
# Deploy the application
npm run deploy
```

## Important Type Safety Features

This project includes several features to ensure type safety:

1. ResponseType utility for Relay types
2. Runtime data validators
3. TypeScript strict mode
4. Type tests for GraphQL queries and mutations
5. Automatic import path fixing
6. Docker-based consistent builds

For a complete list of type safety improvements, see [TYPE-SAFETY-IMPROVEMENTS.md](./docs/TYPE-SAFETY-IMPROVEMENTS.md).

## Project Structure

```
.
├── docs/                  # Documentation
├── public/                # Static files
├── scripts/               # Build and utility scripts
├── src/
│   ├── __generated__/     # Relay generated types
│   ├── components/        # React components
│   ├── utils/             # Utility functions
│   └── ...
├── Dockerfile             # Docker configuration
├── nginx.conf             # Nginx configuration for production
├── tsconfig.json          # TypeScript configuration
└── ...
```

# React Relay Frontend

This is the frontend for the Materials Tracking Module.

## Type Safety Improvements

We have implemented several key measures to ensure type safety and prevent build issues:

1. **Enhanced Type Checking**
   - See `docs/TYPE-SAFETY.md` for complete type safety guidelines

2. **CI/CD Pipeline**
   - GitHub Actions workflow in `.github/workflows/ci.yml` 
   - Tests against multiple Node.js versions to catch version-specific issues
   - Ensures consistent builds across environments

3. **Build Consistency**
   - Use `npm run deploy` script for production builds
   - Ensures clean installation of dependencies from package-lock.json
   - Validates types, linting, and compilation

4. **Common issues fixed:**
   - Added proper typing for GraphQL queries using `MyQuery['response']` pattern
   - Fixed import paths for generated files using webpack's `preferRelative` option
   - Applied strict typing to prevent `any` usage

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run type-check` - Run TypeScript type checker
- `npm run lint` - Run ESLint
- `npm run relay` - Run the Relay compiler
- `npm run deploy` - Perform a clean production build

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
