const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

// Checks cookie, verifies JWT, attaches customer to req.user
async function protect(req, res, next) {
  try {
    // 1. Read token from HttpOnly cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find customer (without password)
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // 4. Attach to request and continue
    req.user = customer;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
}

module.exports = protect;
