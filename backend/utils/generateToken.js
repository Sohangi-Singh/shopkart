const jwt = require("jsonwebtoken");

// Create a JWT containing the customer id
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

module.exports = generateToken;
