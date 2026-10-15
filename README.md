# ShopKart - MERN Labs 01 to 06

Professional e-commerce demo: auth, catalog, wishlist, cart, Razorpay Test Mode checkout + orders.

## Folders
- backend/ : Express + MongoDB (auth, products, wishlist, cart, orders)
- frontend/ : React + React Router (login, home, products, wishlist, cart, orders)

## Backend setup
```
cd backend
npm install
cp .env.example .env
# edit MONGO_URI if using Atlas, else local mongodb://127.0.0.1:27017/shopkart works
# add Razorpay Test Mode keys to RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
npm run dev
```
Backend runs on http://localhost:5001 (port 5000 is used by macOS AirPlay, so we use 5001)

## Add sample products (for demo)
```
cd backend
npm run seed
```
This adds 8 products (Electronics, Fashion, Books, Home).

## Frontend setup
```
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

Flow: `/register` → `/login` → `/home` → `/products` → `/cart` → `/checkout` → Razorpay Test Checkout → `/orders`

## APIs
- POST /customers/register
- POST /customers/login
- GET /customers/me (protected)
- POST /customers/logout (protected)
- POST /products
- GET /products?search=&category=
- GET /products/:id
- POST /wishlist/:productId (protected)
- GET /wishlist (protected)
- DELETE /wishlist/:productId (protected)
- POST /cart/:productId {quantity?} (protected, Lab 05)
- GET /cart (protected, Lab 05 - items + total via .reduce())
- PUT /cart/:productId {quantity} (protected, Lab 05)
- DELETE /cart/:productId (protected, Lab 05)
- DELETE /cart (protected, Lab 05 - clear)
- POST /orders/create-payment-order (protected, validates cart, stock and server prices)
- POST /orders/verify-payment (protected, verifies Razorpay signature and clears cart)
- GET /orders (protected, current user's orders)
- GET /orders/:id (protected, current user's order)

Razorpay Test Mode credentials are backend-only. Never put `RAZORPAY_KEY_SECRET` in the frontend or commit real credentials.
