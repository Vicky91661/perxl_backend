const express = require("express");

const userRouter = require("./userRoute")
const chatRouter  = require("./chatRoute")
const messageRouter = require('./messageRoute')

const router = express.Router();

router.use("/user",userRouter)
app.use('/chat', chatRouter);
app.use('/message', messageRouter);

module.exports = router;