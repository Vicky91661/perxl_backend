const express = require("express");
const userRoutre = require("./userRoute")


const router = express.Router();

router.use("/user",userRoutre)

module.exports = router;