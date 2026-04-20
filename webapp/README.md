# Gamey WebApp

An interactive web application built with **TypeScript + Vite** for playing and visualizing the Gamey game.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

Install project dependencies:

```bash
npm install
```

## 📝 Available Scripts

In the project directory, you can run the following commands:

### `npm run dev`

Starts the application in development mode with **Vite**.

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will automatically reload when you make changes (HMR - Hot Module Replacement).

### `npm run build`

Builds the application for production in the `dist` folder.

```bash
npm run build
```

The build is minified and optimized for best performance.

## 🧪 Unit Tests

Unit tests are centralized in `src/__tests__/` using **Vitest** (configured in `vite.config.ts`).

The project includes 18 test files covering:
- Components: `CollapsibleDialog.test.tsx`, `Dialog.test.tsx`, `Game.test.tsx`, `GameBoard.test.tsx`, `GameSquare.test.tsx`, `Header.test.tsx`, `HelpDialog.test.tsx`, `Login.test.tsx`, `Ranking.test.tsx`, `Register.test.tsx`, `TurnTimer.test.tsx`, `GuestTests.test.tsx`, `Dashboard.test.tsx`
- Services: `gameService.test.ts`, `userService.test.ts`, `httpClient.test.ts`, `rankingService.test.ts`
- Configuration: `botsConfig.test.ts`

### Running tests

```bash
npm test
```

### Code coverage

To generate a coverage report:

```bash
npm run test:coverage
```

Generates reports in `text` and `lcov` formats (see `coverage/lcov-report/`).

## 🚀 Start all services

The project contains three services that can be started together:

```bash
npm run start:all
```

This launches:
- **Webapp**: Vite server on http://localhost:5173
- **Users Service**: Node.js microservice (see `../users/` for port and configuration)
- **Gamey Service**: Rust server on http://localhost:4000 (see `../gamey/` for details)

Required for integrated development or end-to-end testing in production.

## 🛠️ Development

### TypeScript

The project uses TypeScript for type safety. Make sure to:
- Use `.tsx` for React components
- Use `.ts` for regular TypeScript code

### Testing Library

Unit tests use **@testing-library/react** and **@testing-library/user-event**:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

## 🐳 Docker

The application can be deployed using Docker:

```bash
docker build -t gamey-webapp .
docker run -p 80:80 gamey-webapp
```

See the [Dockerfile](./Dockerfile) for details.

## 📱 Supported browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Related resources

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Cucumber.js](https://cucumber.io/docs/cucumber/)
```
