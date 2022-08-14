const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
    "590485346971-bv6gporni9dorpvluhukg9gs4d5rqsrl.apps.googleusercontent.com"
);
module.exports = async (req, res, next) => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: req.body.token,
            audience:
                "590485346971-bv6gporni9dorpvluhukg9gs4d5rqsrl.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        req.user = {
            "id": payload.sub,
            "email": payload.email,
            "username": payload.given_name,
            "fullName": payload.name,
            "image_URL": payload.picture,
            "email_verified": payload.email_verified,
        };
        next();
    }catch (error) {
        console.error(error)
    }
    
};
