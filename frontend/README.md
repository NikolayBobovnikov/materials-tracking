# React Relay Frontend

This is the frontend for the Materials Tracking Module.

## Type Safety Improvements

We have implemented several key measures to ensure type safety and prevent build issues:

1. **Enhanced Type Checking**
   - Run `npm run type-check-all` to do extra validation of the generated Relay types
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
- `npm run type-check-all` - Run enhanced type checking including generated files
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
