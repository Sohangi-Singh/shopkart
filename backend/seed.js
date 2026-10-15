const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/product.model");

dotenv.config();

// 8 simple sample products for demo
const products = [
  {
    name: "Wireless Headphones",
    description: "Over-ear wireless headphones with noise cancellation.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format&fit=crop",
    stock: 12,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80&auto=format&fit=crop",
    stock: 10,
  },
  {
    name: "Cotton T-Shirt",
    description: "Comfortable plain cotton t-shirt.",
    price: 499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format&fit=crop",
    stock: 50,
  },
  {
    name: "Denim Jeans",
    description: "Classic blue denim jeans.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80&auto=format&fit=crop",
    stock: 30,
  },
  {
    name: "Atomic Habits Book",
    description: "Bestselling self-help book by James Clear.",
    price: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80&auto=format&fit=crop",
    stock: 100,
  },
  {
    name: "Wings of Fire Book",
    description: "Autobiography of A.P.J. Abdul Kalam.",
    price: 350,
    category: "Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80&auto=format&fit=crop",
    stock: 80,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "350ml ceramic mug for home and office.",
    price: 299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80&auto=format&fit=crop",
    stock: 60,
  },
  {
    name: "Table Lamp",
    description: "Simple LED table lamp for study desk.",
    price: 899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&auto=format&fit=crop",
    stock: 20,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Product.deleteMany({}); // clear old data
    await Product.insertMany(products); // insert new data

    console.log("8 products added!");
    process.exit(0);
  } catch (err) {
    console.log("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
