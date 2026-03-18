# Frontend API Integration

This note documents the frontend-side API lecture completed so far for `NestCraft`.

## Goal

Connect the React client to the Express backend in a clean way.

The first frontend-backend connection used the health endpoint:

```http
GET /api/health
```

This was the first handshake to prove that:

- the frontend is running
- the backend is running
- Vite can proxy API requests
- the browser can display backend data

## Files Involved

- [vite.config.ts](c:/Users/user/NestCraft/client/vite.config.ts)
- [App.tsx](c:/Users/user/NestCraft/client/src/App.tsx)
- [health.ts](c:/Users/user/NestCraft/client/src/services/health.ts)

## Why Use A Service File

The frontend should not scatter `fetch()` calls across many pages.

Instead, API requests should live in `client/src/services`.

Why:

- keeps components focused on UI
- centralizes backend URLs and request logic
- makes later auth headers and error handling easier

## Why Use A Vite Proxy

During development:

- frontend runs on one port
- backend runs on another port

Using a Vite proxy means the frontend can request:

```text
/api/health
```

instead of hardcoding:

```text
http://localhost:5000/api/health
```

Benefits:

- cleaner frontend code
- easier local development
- fewer hardcoded URLs

## Health Check Flow

The first connection flow works like this:

1. React component loads
2. component calls a service function
3. service sends `fetch('/api/health')`
4. Vite proxy forwards the request to the backend
5. backend returns JSON
6. frontend renders the status

This was a good first integration step because it isolates connection issues before adding product pages.

## Next Product Integration

The next frontend API task should be:

```http
GET /api/products
```

Recommended steps:

1. create a products service file
2. call `/api/products`
3. store the response in component state
4. render product cards
5. show loading and error states

## Recommended Frontend Pattern

For each backend endpoint:

1. create a service function
2. call it from a page or container component
3. track `loading`, `success`, and `error`
4. render UI from real API data

This should be the default frontend workflow for the project.
