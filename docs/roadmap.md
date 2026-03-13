# NestCraft MVP Roadmap

---

## Phase 1: Foundation

**Goal:** Make the stack stable and ready for real features.

### Build
- Frontend routing
- Backend route structure
- Prisma setup
- PostgreSQL connection
- Environment config
- Shared project conventions

### Why First
- Every later feature depends on this
- Reduces rework

> You are basically here already.

---

## Phase 2: Product Catalog

**Goal:** Show real home-item products from the database.

### Build
- Prisma models for `Category` and `Product`
- First migration
- Seed sample data
- Backend endpoints:
  - `GET /api/products`
  - `GET /api/products/:id`
- Frontend:
  - Home page with featured products
  - Products page
  - Product detail page

### Why Second
- Products are the center of any ecommerce app
- Almost every other feature depends on product data

### What You Learn
- Prisma models
- API design
- Fetching and rendering real data

---

## Phase 3: Search, Filter, Sort

**Goal:** Help users browse products efficiently.

### Build
- Filter by category
- Sort by price or newest
- Search by product name
- Backend query params
- Frontend filter UI

### Example
```
/api/products?category=decor&sort=price_asc&search=lamp
```

### Why Here
- Extends the catalog naturally
- Easier after basic listing already works

### What You Learn
- Query parameters
- Dynamic database queries
- UI state tied to URL or filters

---

## Phase 4: Cart

**Goal:** Let users collect products before checkout.

### Build
- Add to cart
- Remove from cart
- Change quantity
- Cart summary
- Subtotal calculation

### Recommended Start
- Local cart in frontend state or `localStorage`

### Why Not Backend Cart First
- Faster to build
- Easier to debug
- Enough for MVP learning

### What You Learn
- State management
- Shared app data
- Pricing calculations

---

## Phase 5: Authentication

**Goal:** Support customer accounts and admin protection.

### Build
- Register
- Login
- Logout
- Password hashing
- Auth token handling
- Protected routes

### Later Use
- Order history
- Saved user data
- Admin product management

### Why After Cart
- You can build storefront behavior first without auth complexity
- Then add identity and access control

### What You Learn
- Auth flow
- Secure backend practices
- Route protection

---

## Phase 6: Checkout Skeleton

**Goal:** Convert a cart into an order.

### Build
- Checkout page
- Shipping info form
- Order summary
- Create order endpoint
- Order and order item records
- Fake payment status or cash-on-delivery placeholder

### Why Before Real Payment
- You need the order flow working first
- Payment integration is easier after the order model exists

### What You Learn
- Multi-step flow
- Transactional thinking
- Order data modeling

---

## Phase 7: Admin Product Management

**Goal:** Manage the store inventory from your app.

### Build
- Admin login guard
- Create product
- Edit product
- Delete product
- Upload image strategy *(later)*

### Why Here
- Once catalog and auth exist, admin flows become natural
- Easier than building admin before product data structure is stable

### What You Learn
- Protected CRUD
- Form handling
- Validation

---

## Phase 8: Order History and Basic Account Area

**Goal:** Let users see what they bought.

### Build
- User profile page
- Order history list
- Order detail view

### Why
- Completes the customer side of the app
- Uses auth and order data you already built

---

## Phase 9: Polish

**Goal:** Make the MVP feel complete.

### Build
- Loading states
- Error states
- Empty states
- Responsive polish
- Form validation improvements
- Reusable UI cleanup
- SEO basics for product pages

### Why Last
- Polish matters most after the main flows exist

---

## Recommended Build Order Inside Each Phase

For each feature, follow this sequence:

1. Define the database/data shape
2. Build backend endpoint
3. Test endpoint
4. Build frontend UI
5. Connect UI to endpoint
6. Handle loading / error / empty states

> This should be your default workflow.

---

## Best Immediate Next Step

**Start Phase 2 now.** Build this exact slice:

- [ ] Prisma model: `Category`
- [ ] Prisma model: `Product`
- [ ] Run migration
- [ ] Seed sample NestCraft home-item products
- [ ] Create `GET /api/products`
- [ ] Create products page in frontend
- [ ] Render product cards from API

> This is the right next milestone because it gives you your first real ecommerce feature.

---

## Simple MVP Feature List

### ✅ Include in MVP
- Home page
- Products page
- Product detail page
- Category filter
- Search
- Cart
- Auth
- Checkout skeleton
- Admin product CRUD
- Order history

### ❌ Do Not Add Yet
- Stripe
- Coupons
- Reviews
- Wishlist
- Analytics
- Inventory syncing
- Email system

> These are phase-2 features after the MVP works.