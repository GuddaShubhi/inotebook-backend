const jwt = require('jsonwebtoken');
const jwtSecretKey = "kurofwiu98347uriuy";

const fetchUser = (req, res, next) => {
    const token = req.header("token");
    if(!token) {
        return res.status(401).json("Token missing");
    }

    try {
        const data = jwt.verify(token, jwtSecretKey);
        console.log("data after jwt verify : ", data)
        req.user = data.id;
        next();   
    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
}

module.exports = fetchUser