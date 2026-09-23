import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams(); // URL parameter /products/:id
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        <img src={product.image} alt={product.name} style={{ width: "300px" }} />
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Rs. {product.price}</p>
        <p>Category: {product.category}</p>
        <p>Stock: {product.stock}</p>
        <button>Add to Cart (UI only)</button>
      </div>
    </>
  );
}

export default ProductDetails;
