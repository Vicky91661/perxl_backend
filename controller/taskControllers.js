const { json } = require('express');
const Group =  require('../schema/groupSchema.js');
const Task = require('../schema/taskSchema.js');

const accessTaskDetails = async (req, res) => {
  try {
    // Extract userId from the req
    const {taskId} = req.query;
    console.log("Inside the accessTaskDetails and task id is",taskId);

    // Find all groups where the user is a member
    const task = await Task.findOne({
      _id: taskId,
    }) // Populate creater in the task, excluding otp
    console.log("The task data is",task);
    res.status(200).json(task)

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

  const { taskId, userId ,taskName,priority,status,startDate,dueDate} = req.body;
  console.log("The data inside the Updated Task i got from the frontend is =>",req.body)
  if (!taskId )
    res.status(400).send('Provide Chat id');
  try {
    const task=await Task.findOne({_id:taskId});
    console.log("The data inside the UPDATE TASK",task);
    if (!task) {
        return res.status(404).json({ message: "task not found" });
    }
    if(task.createrId.toString()!==userId.toString()){
        return res.status(404).json({ message: "You are not creater of this task"});
    }
    if(startDate>dueDate){
        return res.status(404).json({ message: "Start date should be less than or equal to due date"});        
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
    const {userId, taskId } = req.body;
    
    try {
        const existing = await Task.findOne({ _id: taskId });
        console.log("INSIDE THE DELETE TASK FUNCTIONALITY , where user id is=>",userId," and createrid is ",existing.createrId);
        if (!existing) {
            return res.status(400).json({
                message: "Task not found"
            });
        }
         // Check if the user is the creator of the task
        if(existing.createrId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "You do not have permission to delete this task"
            });
        }
        
        const responseDelete = await Task.deleteOne({ _id: taskId });
        if (responseDelete.deletedCount === 0) {
            return res.status(400).json({
                message: "Task not deleted"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).send({ error: "Server error" });
    }
};


module.exports ={accessTaskDetails,
    fetchAllTasks,
    creatTask,
    updateTask,
    deleteTask}