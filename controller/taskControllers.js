const { json } = require('express');
const Group =  require('../schema/groupSchema.js');
const Task = require('../schema/taskSchema.js');

const accessTaskDetails = async (req, res) => {
  try {
    // Extract userId from the req
    const {taskId} = req.body;

    // Find all groups where the user is a member
    const task = await Task.find({
      _id: taskId,
    })
    .populate('createrId', '-otp') // Populate creater in the task, excluding otp
  
    console.log("The task data is",task);

    res.status(200).json({
      message:"ok",
      task
    })

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).send({ message: 'Error fetching task' });
  }
};


const fetchAllTasks = async (req, res) => {
  try {
    const { groupId} = req.query;
    const tasks = await Task.find({
      groupId: groupId  ,
    })
      .populate('createrId','firstName lastName profilePic')
      .sort({ updatedAt: -1 });
    console.log("All the task related to the group",tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({error});
  }
};

const creatTask = async (req, res) => {
  
  const { taskName, priority, startDate, dueDate, groupId, userId } = req.body;
// taskName priority status startDate CreatedDate dueDate groupId createrId
  if (!taskName) {
    return res.status(400).json({ message: 'Please fill the name task' });
  }

  console.log("The task details:", taskName, priority, startDate, dueDate, groupId, userId );

  try {
    const task = await Task.create({
        taskName: taskName,
        priority: priority,
        startDate: new Date(startDate).getTime(),
        dueDate:new Date(dueDate).getTime(),
        groupId:groupId,
        createrId: userId,
    });
    console.log("This group created is => ",task);


    const createdTask = await Task.findOne({ _id: task._id })
      .populate('createrId', '-otp')

    res.status(200).json(createdTask);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const updateTask = async (req, res) => {
  const { taskId, userId } = req.body;
  if (!chatId )
    res.status(400).send('Provide Chat id');
  try {
    const task=Task.find({_id:taskId});
    if (!task) {
        return res.status(404).json({ message: "task not found" });
    }
    if(task.createrId!=userId){
        return res.status(404).json({ message: "You are not creater of this task"});
    }
    if(startDate & startDate<task.CreatedDate){
        return res.status(404).json({ message: "Start date should be more than the creation date"});
    }
    if(dueDate){
        if(dueDate<task.CreatedDate){
            return res.status(404).json({ message: "Start date should be more than the creation date"});
        }
        if(dueDate<task.startDate){
            return res.status(404).json({ message: "Start date should be more than the start date"});
        }
    }

    // taskName priority status startDate CreatedDate dueDate 
    // Update fields if provided
    if (taskName) task.taskName = taskName;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (startDate) task.startDate = startDate;
    if (dueDate) task.dueDate = dueDate;

    // Save the updated user
    await task.save();
    const updatedTask =task.populate('createrId', '-otp')
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const deleteTask = async (req, res) => {
    const { userId, taskId } = req.body;
    try {
        const existing = await Task.findOne({ _id: taskId });
        if(!existing){
            res.status(400).json({
                message:"task not found"
            })
        }
        
        const responseDelete = await Task.delete({_id:taskId})
        if(responseDelete){
            res.status(400).json({
                message:"Task not Deleted"
            })
        }else{
            res.status(200).json({
                message:"task Deleted"
            })
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports ={accessTaskDetails,
    fetchAllTasks,
    creatTask,
    updateTask,
    deleteTask}