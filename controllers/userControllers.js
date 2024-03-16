const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

var { firebase_db } = require("../firebase/firebase-service");
const { JWT_SECRET } = require("../config/keys.js");

exports.test = async (req, res) => {
  try {
    let docId, user;
    const users = await firebase_db
      .collection("users")
      .where("email", "==", "sarthaktest10@gmail.com")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          docId = doc.id;
          console.log("docId: " + docId);
          user = doc.data();
        });
      });

    return res.status(200).json({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "fail",
    });
  }
};

exports.signup = async (req, res) => {
  const { email, firstName, lastName, password, latitude, longitude } =
    req.body;
  let docId, user;
  const users = await firebase_db
    .collection("users")
    .where("email", "==", email)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        docId = doc.id;
        console.log("docId: " + docId);
        user = doc.data();
      });
    });

  if (user) {
    console.log("user already exists");
    return res.status(409).json({
      hasError: true,
      data: [],
      message: "User already exists",
    });
  }

  try {
    const saltRounds = 10;
    const saltHash = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, saltHash);
    const userData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: passwordHash,
      status: "unverified",
    };

    await firebase_db.collection("users").doc().set(userData);

    delete userData.password;

    console.log("jwtsecret>>>", JWT_SECRET);
    const token = await jwt.sign(
      {
        email,
        userId: docId,
      },
      JWT_SECRET,
      { expiresIn: 60 * 60 * 24 }
    );

    return res.status(200).json({
      hasError: false,
      token: token,
      data: {
        userData,
      },
      message: "user registered sucesfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      hasError: true,
      data: {},
      message: "Internal Server error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user, docId;
    const users = await firebase_db
      .collection("users")
      .where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          docId = doc.id;
          user = doc.data();
        });
      });

    if (user) {
      try {
        console.log("pass> ", await bcrypt.compare(password, user.password));
        //match password sent by user with password hash from Db
        if (await bcrypt.compare(password, user.password)) {
          const token = await jwt.sign(
            {
              email,
              userId: docId,
            },
            JWT_SECRET,
            { expiresIn: 60 * 60 * 24 }
          );
          console.log("token>>", token);

          return res.status(200).json({
            hasError: false,
            data: {
              email: email,
              token: token,
            },
            message: "Logged in sucessfully",
          });
        } else {
          return res.status(401).json({
            hasError: true,
            message: "Invalid Credentials.",
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(401).json({
          data: {},
          hasError: true,
          email: email,
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(404).json({
        data: {},
        hasError: true,
        email: email,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      data: {},
      hasError: true,
      email: email,
      message: error.message,
    });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const authorizedUser = req.user;

    let doc;
    doc = await firebase_db.collection("users").doc(authorizedUser?.id);

    return res.status(200).json({
      hasError: false,
      data: {
        authorizedUser,
      },
      message: "User data fetched sucessfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      hasError: true,
      data: {},
      message: "Internal Server error",
    });
  }
};
