const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
require("dotenv").config();

// # MIDDLEWARES # 
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(helmet());

// #API MIDDLEWARES#
const add_product = require('./routes/add-product')
app.use("/app/admin", add_product)

const delete_product = require('./routes/delete-product');
app.use("/app/admin/", delete_product)

// #DATABASE CONNECTION#
const DB_URL = process.env.MONGODB_URL;

mongoose.connect(DB_URL, {useNewUrlParser: true, useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

// # SERVER PORT#
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`)});
