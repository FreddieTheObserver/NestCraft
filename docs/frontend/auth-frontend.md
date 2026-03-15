# Frontend Authentication

This note documents the frontend authentication implementation for `NestCraft`.

The frontend auth layer is responsible for:

- calling backend auth APIs
- storing the logged-in user
- storing the JWT token
- persisting auth across refreshes
- protecting client routes
- exposing login, register, and logout actions to the UI

## Goal

Support the first account experience on the client side.

The frontend auth flow includes:

1. register page
2. login page
3. auth context
4. route protection
5. logout in the shared header

## Files Involved

- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts)
- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
- [LoginPage.tsx](c:/Users/user/NestCraft/client/src/pages/LoginPage.tsx)
- [RegisterPage.tsx](c:/Users/user/NestCraft/client/src/pages/RegisterPage.tsx)
- [ProtectedRoute.tsx](c:/Users/user/NestCraft/client/src/components/ProtectedRoute.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)
- [main.tsx](c:/Users/user/NestCraft/client/src/main.tsx)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)

## Auth Service

The auth service lives in `services/auth.ts`.

Its job is to send requests to the backend:

- `POST /api/auth/register`
- `POST /api/auth/login`

Why this service exists:

- keeps `fetch()` logic out of page components
- keeps auth request types centralized
- makes the rest of the client code cleaner

The service returns:

- `user`
- `token`

## Auth Context

The auth context lives in `AuthContext.tsx`.

It stores:

- `user`
- `token`
- `isAuthenticated`
- `login()`
- `register()`
- `logout()`

Why context is used:

- auth state must be shared across many pages and components
- login and logout affect the whole app
- route protection depends on shared auth state

## localStorage Persistence

Auth is persisted using `localStorage`.

Stored keys:

- `auth_user`
- `auth_token`

How it works:

1. when the app loads, the context checks local storage
2. if data exists, auth state is restored
3. on login or register, the user and token are saved
4. on logout, both are removed

This allows the session to survive a page refresh.

## Login Page

The login page:

- manages form input for email and password
- calls `useAuth().login(...)`
- shows loading and error state
- redirects to `/products` after success

This is the first client page that actually consumes the backend auth API.

## Register Page

The register page:

- manages form input for name, email, and password
- calls `useAuth().register(...)`
- shows loading and error state
- redirects to `/products` after success

This gives the frontend a complete account creation flow.

## Protected Route

The protected route component checks:

- whether the user is authenticated

If not authenticated:

- redirect to `/login`

This is useful for pages such as:

- `/cart`
- future account pages
- future checkout pages
- future admin pages

## Store Header And Logout

The shared header lives in `StoreHeader.tsx`.

Its job is to provide storefront navigation and auth actions.

It currently shows:

- `Products`
- `Cart (count)`
- `Login`
- `Register`
- `Logout`

When a user is signed in:

- their name appears in the header
- the `Logout` button is shown

When logout is clicked:

1. `logout()` is called from auth context
2. auth state is cleared
3. local storage auth keys are removed
4. the user is redirected to `/login`

## Provider Wiring

The app is wrapped with `AuthProvider` in [main.tsx](c:/Users/user/NestCraft/client/src/main.tsx).

This allows any page or component to use:

- `useAuth()`

Without this provider, auth hooks would fail.

## Route Wiring

Frontend auth routes are defined in [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx).

Important routes:

- `/login`
- `/register`

Protected route usage is also defined there.

## What Success Looks Like

Frontend auth is considered working when:

- user can register
- user can log in
- auth state persists after refresh
- protected routes redirect unauthenticated users
- logout clears auth state
- header changes based on auth state

## Relationship To Backend Auth

The frontend auth flow depends on the backend endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

The frontend expects the backend to return:

```json
{
  "user": {
    "id": 1,
    "name": "Jane",
    "email": "jane@example.com",
    "role": "customer"
  },
  "token": "..."
}
```

## Next Step

After frontend auth, the next sensible steps are:

- improve the shared navbar/header across all pages
- connect auth state to future checkout flow
- build backend-protected admin features
