const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; 

    if(!authHeader){
        return res.status(401).json({
            message: "Token no proporcionado"
        });
    }

    const token = authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Token inválido"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Token inválido"
        });
    }
}

module.exports = verifyToken;