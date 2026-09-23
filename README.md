# ShopKart - MERN Labs 01 to 04

Simple in-class style project for viva.

## Folders
- backend/ : Express + MongoDB (auth, products, wishlist)
- frontend/ : React + React Router (login, home, products, wishlist)

## Backend setup
```
cd backend
npm install
cp .env.example .env
# edit MONGO_URI if using Atlas, else local mongodb://127.0.0.1:27017/shopkart works
npm run dev
```
Backend runs on http://localhost:5000

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
