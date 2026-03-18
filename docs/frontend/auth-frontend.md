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

This is the client-side half of the full auth system. The backend still owns:

- password hashing
- user creation
- credential verification
- JWT issuance

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

That means the frontend does not need a second request to learn who just logged in. It receives everything needed to initialize auth state in one response.

The service is also where backend error messages are turned into thrown JavaScript `Error` objects, so pages do not need to parse raw HTTP responses.

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

In practice, auth context acts as the central contract between the API layer and the UI layer.

The rest of the frontend should not care how auth is stored internally. It should only care that:

- `user` exists or does not exist
- `token` exists or does not exist
- `login()` and `logout()` are available

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

Why this is acceptable for now:

- the project is still in the MVP phase
- JWT persistence in `localStorage` is simple to reason about
- the app does not yet need cookie-based session management

What to watch later:

- `localStorage` token storage is convenient, but stricter production setups may prefer secure cookies

## Login Page

The login page:

- manages form input for email and password
- calls `useAuth().login(...)`
- shows loading and error state
- redirects to `/products` after success

This is the first client page that actually consumes the backend auth API.

The page is intentionally thin:

- form state stays local to the page
- auth logic stays in context
- network logic stays in the service layer

That separation keeps the page maintainable.

## Register Page

The register page:

- manages form input for name, email, and password
- calls `useAuth().register(...)`
- shows loading and error state
- redirects to `/products` after success

This gives the frontend a complete account creation flow.

It also means the app can move directly from anonymous browsing into an authenticated storefront experience without an admin creating accounts manually.

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

This component solves one specific problem:

- UI route access control

It does not replace backend authorization. Protected frontend routes improve the user experience, but backend routes still must enforce their own auth and role checks.

## Store Header And Logout

The shared header lives in `StoreHeader.tsx`.

Its job is to provide storefront navigation and auth actions.

It currently shows:

- `Products`
- `Cart (count)`
- `Login`
- `Register`
- `Logout`

And when authenticated:

- the current user name
- `Orders`
- account-aware navigation state

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

As the app grows, this file becomes the central place to define:

- public routes
- customer-only routes
- admin-only routes later

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

That response shape is important because the auth context depends on it directly.

If the backend shape changes, the frontend auth layer must be updated to match.

## Next Step

After frontend auth, the next sensible steps are:

- improve the shared navbar/header across all pages
- connect auth state to future checkout flow
- build backend-protected admin features

## What Success Looks Like In Practice

Frontend auth is genuinely complete enough for this project stage when:

- refresh does not log the user out unexpectedly
- logout clears both in-memory state and persisted storage
- a logged-out user cannot open protected pages
- backend error messages can be shown cleanly on login/register failures
- the shared header clearly reflects whether the session is authenticated
