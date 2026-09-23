import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");
      // Build query string: ?search=..&category=..
      let url = "/products?";
      if (search) url += `search=${search}&`;
      if (category) url += `category=${category}`;
      const res = await api.get(url);
      setProducts(res.data.products);
    } catch (err) {
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }

  // Load once on page open
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Products</h2>
        <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
        <button onClick={fetchProducts}>Search</button>

        {loading && <p>Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}

        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;
