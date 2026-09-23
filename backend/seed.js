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
    image: "https://via.placeholder.com/300?text=Headphones",
    stock: 12,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "https://via.placeholder.com/300?text=Keyboard",
    stock: 10,
  },
  {
    name: "Cotton T-Shirt",
    description: "Comfortable plain cotton t-shirt.",
    price: 499,
    category: "Fashion",
    image: "https://via.placeholder.com/300?text=TShirt",
    stock: 50,
  },
  {
    name: "Denim Jeans",
    description: "Classic blue denim jeans.",
    price: 1299,
    category: "Fashion",
    image: "https://via.placeholder.com/300?text=Jeans",
    stock: 30,
  },
  {
    name: "Atomic Habits Book",
    description: "Bestselling self-help book by James Clear.",
    price: 599,
    category: "Books",
    image: "https://via.placeholder.com/300?text=Book",
    stock: 100,
  },
  {
    name: "Wings of Fire Book",
    description: "Autobiography of A.P.J. Abdul Kalam.",
    price: 350,
    category: "Books",
    image: "https://via.placeholder.com/300?text=Wings+of+Fire",
    stock: 80,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "350ml ceramic mug for home and office.",
    price: 299,
    category: "Home",
    image: "https://via.placeholder.com/300?text=Mug",
    stock: 60,
  },
  {
    name: "Table Lamp",
    description: "Simple LED table lamp for study desk.",
    price: 899,
    category: "Home",
    image: "https://via.placeholder.com/300?text=Lamp",
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
