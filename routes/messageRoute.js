import express from "express";
const router = express.Router();

import { sendMessage, getMessages } from "../controller/messageControllers.js";
import { Auth } from "../middelwares/userMiddleware.js";

router.post("/", Auth, sendMessage);
router.get("/:chatId", Auth, getMessages);

export default router;