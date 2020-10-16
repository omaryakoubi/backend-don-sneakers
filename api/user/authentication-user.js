const router = require("express").Router();
const user = require("../../models/users");
const bcrypt = require("bcrypt");

router.post("/user-register", async (req, res) => {
  try {
    let { email, password, passwordConfirmation, phoneNumber } = req.body;

    const emailRegistered = await user.findOne({ email });
    const phoneNumberRegistered = await user.findOne({ phoneNumber });
    console.log("before if block");

    if (
      password <= 6 &&
      password === passwordConfirmation &&
      !phoneNumberRegistered &&
      !emailRegistered
    ) {
      let newUser = new user({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        dateOfBirth,
        resetPasswordToken: "",
        resetPasswordExpires: 0,
      });

      await bcrypt.hash(newUser.password, 10, async (req, res) => {
        await newUser.save();
        console.log("omar here");
        res.status(201).send(newUser);
      });
    }

    console.log("outside of the if blocky");
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

module.exports = router;
