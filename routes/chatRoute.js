import express from 'express';
import { Auth } from '../middelwares/userMiddleware.js';
const router = express.Router();

import {
  accessChats,
  fetchAllChats,
  creatGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from '../controller/chatControllers.js';
router.post('/', Auth, accessChats);
router.get('/', Auth, fetchAllChats);
router.post('/group', Auth, creatGroup);
router.patch('/group/rename', Auth, renameGroup);
router.patch('/groupAdd', Auth, addToGroup);
router.patch('/groupRemove', Auth, removeFromGroup);
router.delete('/removeuser', Auth);

module.exports = router;