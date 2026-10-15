import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

const CATS = ["", "Electronics", "Fashion", "Books", "Home"];

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts(cat = category) {
    try {
      setLoading(true);
      setError("");
      let url = "/products?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (cat) url += `category=${encodeURIComponent(cat)}`;
      const res = await api.get(url);
      setProducts(res.data.products);
    } catch {
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickCat(c) {
    setCategory(c);
    fetchProducts(c);
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="page-title">Product catalog</h2>
        <p className="page-sub">Search, filter by shelf, and add to cart or wishlist.</p>

        <div className="toolbar">
          <input placeholder="🔍 Search products..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchProducts()} />
          <select value={category} onChange={(e) => pickCat(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
          </select>
          <button onClick={() => fetchProducts()}>Search</button>
        </div>

        <div className="pills">
          {CATS.map((c) => (
            <button key={c || "all"} className={`pill ${category === c ? "active" : ""}`} onClick={() => pickCat(c)}>
              {c || "All"}
            </button>
          ))}
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <div className="empty">No products found. Try a different search.</div>
        )}

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
