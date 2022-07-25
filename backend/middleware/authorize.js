const jwt = require("jsonwebtoken")

const authorize = (roles) => [
        function(req, res, next){
            const token = req.header("x-auth-token");
            if (!token) return res.status(403).send("No token provided, Access denied!");
            try{
                const verified = jwt.verify(token, proces.env["JWT_PRIVATE_KEY"]);
                req.user = verified;
                next()
            }catch (e) {
                res.status(400).send("Invalid token");
            }
        },

        function(req, res, next) {            
            if (roles.length && !(roles === req.user.role)) {
                return res.status(403).send("You are not authorized to blog!")
            }
            next(); // User is authorized to blog
        }
    ];
