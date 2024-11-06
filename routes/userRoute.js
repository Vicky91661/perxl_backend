const express = require("express");
const router = express.Router();

const {Signin ,Signup,VerifyOTP, updateData,fetchAllUsers,getUserDetails}  = require("../controller/userController");
const Auth = require("../middelwares/userMiddleware");

// /api/v1/user => user route


// POST: /api/v1/user/signin
router.post("/signin",Signin)

// POST:/api/v1/user/signup
router.post("/signup",Signup)

// POST:/api/v1/user/verifyotp
router.post("/verifyotp",VerifyOTP)

// POST:/api/v1/user/update
router.post("/update",Auth,updateData)

// GET:/api/v1/user/allusers
router.get("/allusers",Auth,fetchAllUsers)

// GET:/api/v1/user/getuser
router.get("/getuser",Auth,getUserDetails)

module.exports = router;