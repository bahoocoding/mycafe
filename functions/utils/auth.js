const jwt = require("jsonwebtoken");
const config =require("../config");
module.exports={
  getToken: function(user) {
    return jwt.sign(JSON.stringify(user), config.JWT_SECRET);
  },
  isAuth: function(req, res, next) {
    const token=req.headers.authorization;
    if (token) {
      const onlyToken=token.slice(7, token.length);
      jwt.verify(onlyToken, config.JWT_SECRET, (err, decode)=>{
        if (err) {
          return res.status(401).send({msg: "Invalid Token"});
        }
        req.user=decode;
        next();
        return;
      });
    } else {
      return res.status(401).send({msg: "Token is not supplied."});
    }
  },
  isAdmin: function(req, res, next) {
    if (req.user && req.user.isAdmin) {
      return next();
    }
    return res.status(401).send({msg: "Admin token is not valid"});
  },
};
