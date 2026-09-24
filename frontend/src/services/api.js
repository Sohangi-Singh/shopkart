import axios from "axios";

// One place for backend URL. withCredentials sends HttpOnly cookie.
const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
});

export default api;
