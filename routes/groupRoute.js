const express = require('express');
const Auth   = require('../middelwares/userMiddleware.js');
const router = express.Router();

const {
    accessGroups,
    fetchAllChats,
    creatGroup,
    renameGroup,
    addToGroup,
    removeFromGroup,
} = require('../controller/groupControllers.js');



router.get('/fetchgroups', Auth, accessGroups);
router.get('/', Auth, fetchAllChats);
router.post('/creategroup', Auth, creatGroup);
router.patch('/group/rename', Auth, renameGroup);
router.patch('/groupAdd', Auth, addToGroup);
router.patch('/groupRemove', Auth, removeFromGroup);
router.delete('/removeuser', Auth);

module.exports = router;