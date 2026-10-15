const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/product.model");

dotenv.config();

// 8 sample products with original, locally served SVG mockups from frontend/public/products.
const products = [
  {
    name: "Wireless Headphones",
    description: "Over-ear wireless headphones with noise cancellation.",
    price: 4999,
    category: "Electronics",
    image: "/products/wireless-headphones.svg",
    stock: 12,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "/products/mechanical-keyboard.svg",
    stock: 10,
  },
  {
    name: "Cotton T-Shirt",
    description: "Comfortable plain cotton t-shirt.",
    price: 499,
    category: "Fashion",
    image: "/products/cotton-tshirt.svg",
    stock: 50,
  },
  {
    name: "Denim Jeans",
    description: "Classic blue denim jeans.",
    price: 1299,
    category: "Fashion",
    image: "/products/denim-jeans.svg",
    stock: 30,
  },
  {
    name: "Atomic Habits Book",
    description: "Bestselling self-help book by James Clear.",
    price: 599,
    category: "Books",
    image: "/products/atomic-habits-book.svg",
    stock: 100,
  },
  {
    name: "Wings of Fire Book",
    description: "Autobiography of A.P.J. Abdul Kalam.",
    price: 350,
    category: "Books",
    image: "/products/wings-of-fire-book.svg",
    stock: 80,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "350ml ceramic mug for home and office.",
    price: 299,
    category: "Home",
    image: "/products/ceramic-mug.svg",
    stock: 60,
  },
  {
    name: "Table Lamp",
    description: "Simple LED table lamp for study desk.",
    price: 899,
    category: "Home",
    image: "/products/table-lamp.svg",
    stock: 20,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Product.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { name: product.name, category: product.category },
          update: { $set: product },
          upsert: true,
        },
      }))
    );

    console.log("8 sample products added or updated!");
    process.exit(0);
  } catch (err) {
    console.log("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
