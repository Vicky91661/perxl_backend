const express= require("express") ;
const router = express.Router();

const  { sendMessage, getMessages,sendFileMessage }= require("../controller/messageControllers.js");
const  Auth = require("../middelwares/userMiddleware.js");
const { upload } = require("../middelwares/multerMiddleware.js");

router.post("/sendmessage", Auth, sendMessage);
router.get("/fetchMessages", Auth, getMessages);
router.post("/sendfilemessage",Auth,upload.single('file'),sendFileMessage);


module.exports = router;