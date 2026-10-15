# ShopKart

ShopKart is a full-stack shopping app built with React, Express, and MongoDB. Customers can browse a product catalog, save products to a wishlist, manage a cart, pay through Razorpay Test Mode, and review past orders.

## What it does

- Customer registration and login using hashed passwords and JWTs stored in an HttpOnly cookie.
- Product browsing with search and category filters, product details, stock information, and wishlist actions.
- A persistent, user-specific cart with quantity controls and a shared React Context API state used by the cart, product cards, and navbar.
- Checkout with shipping form validation and an order summary.
- Server-side cart, stock, and current-price validation before creating a pending order.
- Razorpay Standard Checkout in Test Mode. The backend verifies the payment signature before marking the order placed or clearing the cart.
- Order history and per-order details, protected by user ownership checks.
- Eight original product mockups bundled under `frontend/public/products` and referenced by the sample seed data.

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios |
| Shared cart state | React Context API |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JWT, HttpOnly cookies, bcrypt |
| Payments | Razorpay Standard Checkout, Test Mode |

## Getting started

### Requirements

- Node.js and npm
- A MongoDB database, local or MongoDB Atlas
- Razorpay Test Mode API keys for checkout

### 1. Configure the backend

From the project root, create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Set these values in `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Use your own Razorpay **Test Mode** key pair. Keep the key secret in the backend `.env`; never put it in frontend code or commit it.

### 2. Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3. Start the whole app

Run from the project root:

```bash
npm run dev
```

This starts both services. Open the frontend at [http://localhost:5173](http://localhost:5173); the Express API runs at [http://localhost:5001](http://localhost:5001). Press **Ctrl+C** to stop both.

To run one service by itself, use `npm run dev:backend` or `npm run dev:frontend` from the root.

### 4. Add or refresh the sample products

```bash
npm --prefix backend run seed
```

The seed adds or updates the eight sample products and their image paths. It does not delete other products. The SVG files are served by the frontend from `/products/`.

## Shop flow

```text
Register / Login
      ↓
Browse products → Wishlist
      ↓
Cart → Checkout and shipping details
      ↓
Backend validates latest prices and stock
      ↓
Pending ShopKart order → Razorpay Test Checkout
      ↓
Backend verifies payment signature
      ↓
Order marked PLACED → Cart cleared
      ↓
Order confirmation → My Orders
```

The browser never decides the payable amount or payment status. The backend builds an order snapshot from current database product data, creates the Razorpay order, verifies the signature, then clears that customer's cart.

## Frontend routes

| Route | Page |
| --- | --- |
| `/register` | Create a customer account |
| `/login` | Sign in |
| `/home` | ShopKart home and account summary |
| `/products` | Browse, search, and filter products |
| `/products/:id` | Product details and shopping actions |
| `/wishlist` | Saved products |
| `/cart` | Cart contents and quantities |
| `/checkout` | Shipping details and Razorpay payment |
| `/order-success/:id` | Payment confirmation and order summary |
| `/orders` | Order history |
| `/orders/:id` | Order details |

## API overview

The backend base URL is `http://localhost:5001`. Protected endpoints use the login cookie.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/customers/register` | Public | Register with `fullName`, `email`, `password`, and `phone` |
| `POST` | `/customers/login` | Public | Log in and set the auth cookie |
| `GET` | `/customers/me` | Protected | Get the signed-in customer |
| `POST` | `/customers/logout` | Protected | Clear the auth cookie |
| `GET` | `/products?search=&category=` | Public | Browse and filter products |
| `GET` | `/products/:id` | Public | Get a product |
| `POST` | `/products` | Public | Create a product |
| `GET` | `/wishlist` | Protected | Get the current customer's wishlist |
| `POST` | `/wishlist/:productId` | Protected | Add a product to the wishlist |
| `DELETE` | `/wishlist/:productId` | Protected | Remove a product from the wishlist |
| `GET` | `/cart` | Protected | Get cart items and calculated totals |
| `POST` | `/cart/:productId` | Protected | Add a product; optional body `{ "quantity": 1 }` |
| `PATCH` | `/cart/:productId` | Protected | Set a product quantity |
| `DELETE` | `/cart/:productId` | Protected | Remove one product from the cart |
| `DELETE` | `/cart` | Protected | Clear the cart |
| `POST` | `/orders/create-payment-order` | Protected | Validate address/cart/stock/prices and create pending ShopKart and Razorpay orders |
| `POST` | `/orders/verify-payment` | Protected | Verify Razorpay signature, place order, and clear the cart |
| `GET` | `/orders` | Protected | List the current customer's orders, newest first |
| `GET` | `/orders/:id` | Protected | Get an owned order |

## Project layout

```text
backend/
  controllers/       Request handling and business rules
  middlewares/       JWT authentication
  models/            Customer, Product, and Order schemas
  routes/            Express API routes
  seed.js            Upserts eight demo products
frontend/
  public/products/   Local SVG product mockups
  src/components/    Shared UI components
  src/context/       Shared cart state (React Context API)
  src/pages/         App pages
  src/services/      Axios API client
scripts/dev.js       Starts and stops both dev services
```

## Payment and image notes

- Only Razorpay Test Mode keys (`rzp_test_…`) are accepted by the backend.
- The Razorpay key secret stays in `backend/.env`; only the public key ID is sent to Checkout.
- The cart stays intact until the backend accepts a valid payment signature.
- Order items retain name, price, image, and quantity snapshots, so order history is not tied to future product edits.
- Sample product images are bundled SVG mockups and do not require an image-hosting service.
- Root and backend `.env` files are ignored by Git. Never commit real credentials.
