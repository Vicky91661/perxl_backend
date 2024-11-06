const express = require('express');
const Auth   = require('../middelwares/userMiddleware.js');
const router = express.Router();

const {
    accessTaskDetails,
    fetchAllTasks,
    creatTask,
    updateTask,
    deleteTask,
} = require('../controller/taskControllers.js');



router.get('/fetchtask', Auth, accessTaskDetails);
router.get('/fetchalltasks',Auth,fetchAllTasks);
router.post('/createtask', Auth, creatTask);
router.patch('/update', Auth, updateTask);
router.delete('/deletetask', Auth, deleteTask);

module.exports = router;