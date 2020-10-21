const router = require("express").Router();
const nodeMailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const admin = require("../../models/admin");
require("dotenv").config;

// # SEND EMAIL TO THE ADMIN EMAIL #
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (email === "") throw new Error("Email required !");
    const adminInfo = await admin.findOne({ email });
    if (adminInfo === null) {
      console.error("email not found in the db");
      throw new Error("email not found in the db");
    }
    console.log(adminInfo)
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000;
    await admin.findOneAndUpdate({email},{resetPasswordToken, resetPasswordExpires})
    const omar = await admin.findOne({ email });
    console.log(omar.resetPasswordExpires)
    console.log(process.env.EMAIL_ADDRESS)
    console.log(process.env.EMAIL_PASSWORD)
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('first',resetPasswordToken)
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Don-Sneaker is helping you to reset your password!",
      text: `To set your new password please
             click here : https://localhost:4200/${adminInfo.resetPasswordToken}`,
    };
    console.log('after',resetPasswordToken)
    await transporter.sendMail(mailOptions);
    return res.status(200).json("recovery email sent");
  } catch (error) {
    console.error(error);
    return res.status(403).json(error);
  }
});

// # RESET THE PASSWORD OF THE ADMIN #
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { confirmedPassword } = req.body
    const adminInfo = await admin.findOne({
      resetPasswordToken: req.params.token,
    });
    if (!adminInfo) throw new Error("invalid token");
    if (adminInfo.resetPasswordExpires < Date.now()) {
      adminInfo.resetPasswordToken = "";
      adminInfo.resetPasswordExpires = 0;
      await admin.save();
      throw new Error("token expired");
    }
    adminInfo.resetPasswordToken = "";
    adminInfo.resetPasswordExpires = 0;
    adminInfo.password = await bcrypt.hash(
      confirmedPassword,
      await bcrypt.genSalt(10)
    );
    await admin.save();
    return res.send("new password setted");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router