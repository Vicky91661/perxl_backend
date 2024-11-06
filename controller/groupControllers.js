const Group =  require('../schema/groupSchema.js');
const User = require('../schema/userschema.js');
const jwt = require('jsonwebtoken');
const  JWT_SECRET  = process.env.JWT_SECRET;
const mongoose = require('mongoose');


const accessGroups = async (req, res) => {
  try {
    // Extract userId from the req
    const {userId} = req.body;

    // Find all groups where the user is a member
    const groups = await Group.find({
      isGroup: true,
      users: userId,
    })
      .populate('users', '-otp') // Populate users in the group, excluding otp
      .populate('latestMessage');

    // // All the groups related the a particalr person
    // console.log("The groups data is",groups);

    res.status(200).json({
      message:"ok",
      groups
    })


    // res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).send({ message: 'Error fetching groups' });
  }
};


const fetchAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.rootUserId } },
    })
      .populate('users')
      .populate('latestMessage')
      .populate('groupAdmin')
      .sort({ updatedAt: -1 });
    const finalChats = await user.populate(chats, {
      path: 'latestMessage.sender',
      select: 'name email profilePic',
    });
    res.status(200).json(finalChats);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

const creatGroup = async (req, res) => {
  
  const { GroupName, users, userId } = req.body;

  if (!GroupName || !users) {
    return res.status(400).json({ message: 'Please fill all the fields' });
  }

  console.log("The users are:", users);

  if (users.length < 2) {
    return res.status(400).json({
      message: 'A group should contain more than 2 users',
    });
  }
  const userIds = users.map((user) => user.userId);
  userIds.push(userId);

  try {
    const group = await Group.create({
      GroupName: GroupName,
      users: userIds,
      isGroup: true,
      groupAdmin: userId,
    });
    console.log("This group created is => ",group);


    const createdGroup = await Group.findOne({ _id: group._id })
      .populate('users', '-otp')
      .populate('groupAdmin', '-otp');

    res.status(200).json(createdGroup);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName)
    res.status(400).send('Provide Chat id and Chat name');
  try {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $set: { chatName },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
const addToGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const existing = await Group.findOne({ _id: chatId });
  if (!existing.users.includes(userId)) {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } else {
    res.status(409).send('user already exists');
  }
};
const removeFromGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const existing = await Chat.findOne({ _id: chatId });
  if (existing.users.includes(userId)) {
    Chat.findByIdAndUpdate(chatId, {
      $pull: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password')
      .then((e) => res.status(200).send(e))
      .catch((e) => res.status(404));
  } else {
    res.status(409).send('user doesnt exists');
  }
};

module.exports ={accessGroups,fetchAllChats,creatGroup,renameGroup,addToGroup,removeFromGroup}