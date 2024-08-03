const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyUser(req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token) {
        return res.status(401).json("Token Not Found");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json("Invalid Token");
    }
}

module.exports = verifyUser;