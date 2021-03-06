const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("../../models/admin");
require("dotenv").config();

//# SAVE THE USER INFORMATION AND HASHING THE PASSWORD #
router.post("/register", async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation,
    } = req.body;
    const emailRegistered = await admin.findOne({ email });

    if (emailRegistered) {
      res.send("your email already exist");
    }

    if (password !== passwordConfirmation) {
      res.send(
        "your password and your password confirmation are not equal try again"
      );
    } else {
      const newAdmin = new admin({
        firstName,
        lastName,
        email,
        password,
        role:'admin',
        resetPasswordToken: "",
        resetPasswordExpires: 0,
      });

      bcrypt.hash(newAdmin.password, 10, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          newAdmin.password = hash;
          await newAdmin.save();
        }
      });
      res.status(201).send("new admin created");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// # LOGIN COMPARING THE EMAL AND PASSWORD JWT AUTH TOKEN METHOD #
router.post("/login", async (req, res) => {
  try {
    const { _id, email, password } = req.body;
    const adminInfo = await admin.findOne({ email });
    if (adminInfo) {
      bcrypt.compare(password, adminInfo.password, (err, result) => {
        if (err) {
          res.send("Auth failed");
        }

        if (result) {
          const token = jwt.sign({ email, _id }, process.env.JWT_KEY);
          res.json(token);
        }
      });
    } else {
      res.send("admin by this email doesent exist");
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

module.exports = router;
