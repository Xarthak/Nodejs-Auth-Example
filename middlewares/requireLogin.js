const { firebase_db } = require("../firebase/firebase-service");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

exports.checkIfUserAutenticated = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json({
        hasError: true,
        data: {},
        message: "Authorization header not found.",
      });
    }

    let decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("decodedToken>>", decodedToken);

    let doc;
    if (decodedToken) {
      const { email, userId } = decodedToken;
      doc = await firebase_db.collection("users").doc(userId).get();
    }

    if (!doc.data()) {
      return res.status(404).json({
        hasError: true,
        data: {},
        message: "User not found in Db.",
      });
    } else {
      req.user = doc.data();
      req.user.id = doc.id;
      return next();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      hasError: true,
      data: {},
      message: "Internal Server error",
    });
  }
};
