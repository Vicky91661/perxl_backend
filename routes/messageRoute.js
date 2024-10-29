const express= require("express") ;
const router = express.Router();

const  { sendMessage, getMessages }= require("../controller/messageControllers.js");
const  Auth = require("../middelwares/userMiddleware.js");

router.post("/", Auth, sendMessage);
router.get("/:chatId", Auth, getMessages);


module.exports = router;