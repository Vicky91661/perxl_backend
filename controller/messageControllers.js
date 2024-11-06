const  Message = require('../schema/messageSchema.js');
const User = require('../schema/userschema.js');
const Group = require('../schema/groupSchema.js');
const  JWT_SECRET  = process.env.JWT_SECRET;

const sendMessage = async (req, res) => {
  console.log("Inside the send message");
  const { groupId, message } = req.body;
  try {
    let msg = await Message.create({ sender: req.body.userId, message, groupId });

    msg = await (
      await msg.populate('sender', 'firstName lastName profilePic phoneNumber')
    ).populate({
      path: 'groupId',
      select: '_id',
      model: 'Group'
    });

    await Group.findByIdAndUpdate(groupId, {
      latestMessage: msg,
    });

    res.status(200).send(msg);
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: error });
  }
};
const getMessages = async (req, res) => {
  console.log("Inside the fetch message");
  const { groupId} = req.query;
  try {
    let messages = await Message.find({ groupId })
      .populate({
        path: 'sender',
        model: 'User',
        select: '_id firstName lastName profilePic phoneNumber',
      })
      .populate({
        path: 'groupId',
        model: 'Group',
        select:"_id"
      }).sort({ createdAt: -1 });

    res.status(200).json({messages});
  } catch (error) {
    res.sendStatus(500).json({ error: error });
    console.log(error);
  }
};


module.exports = {sendMessage,getMessages}