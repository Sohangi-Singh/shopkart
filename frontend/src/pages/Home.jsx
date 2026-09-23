import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Protected page: fetch /customers/me, if fails go to login
    api
      .get("/customers/me")
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Welcome, {user.fullName}!</h2>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
      </div>
    </>
  );
}

export default Home;
