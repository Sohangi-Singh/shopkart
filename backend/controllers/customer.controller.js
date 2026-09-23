const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// POST /customers/register
async function register(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. All fields required
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Password length check
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // 3. Email must be unique
    const exists = await Customer.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // 4. Hash password with bcrypt (never store plain password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save customer
    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // 6. Return without password
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /customers/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // 1. Find customer by email
    const customer = await Customer.findOne({ email });

    // 2. Generic message (do not reveal if email or password was wrong)
    if (!customer) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 4. Generate JWT and store in HttpOnly cookie
    const token = generateToken(customer._id);
    res.cookie("token", token, {
      httpOnly: true, // JS cannot read it (protects from XSS)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /customers/me (protected)
function me(req, res) {
  // req.user is set by auth middleware (without password)
  res.json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone,
  });
}

// POST /customers/logout (protected)
function logout(req, res) {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
}

module.exports = { register, login, me, logout };
