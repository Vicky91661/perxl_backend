const  Message = require('../schema/messageSchema.js');
const Task = require('../schema/taskSchema.js');
const path = require('path'); 
const {uploadAnyFileOnCloudinary,
  uploadPDFOnCloudinary,
  uploadVideoOnCloudinary,
  uploadImageOnCloudinary}=require("./../utils/cloudinary.js")
const sendMessage = async (req, res) => {
  console.log("Inside the send message",req.body);
  const { taskId, message } = req.body;
  try {
    let msg = await Message.create({ sender: req.body.userId, message, taskId });

    msg = await (
      await msg.populate('sender', 'firstName lastName profilePic phoneNumber')
    ).populate({
      path: 'taskId',
      select: '_id',
      model: 'Task'
    });

    await Group.findByIdAndUpdate(taskId, {
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
  const {taskId} = req.query;
  try {
    let messages = await Message.find({ taskId })
      .populate({
        path: 'sender',
        model: 'User',
        select: '_id firstName lastName profilePic phoneNumber',
      })
      .populate({
        path: 'taskId',
        model: 'Task',
        select:"_id"
      }).sort({ createdAt: -1 });

    res.status(200).json({messages});
  } catch (error) {
    res.sendStatus(500).json({ error: error });
    console.log(error);
  }
};
const sendFileMessage = async (req, res) => {
  console.log("Inside the SendFileMessage function, The request is", req.file);
  try {
      const filePath = req.file.path;
      const fileType = path.extname(req.file.filename).split('.')[1].toLowerCase();
      console.log("The file type is ", fileType);
      let uploadResult;

      if (fileType === 'jpg'|| fileType === 'png' || fileType === 'jpeg'||fileType === 'gif' || fileType === 'tiff') {
          uploadResult = await uploadImageOnCloudinary(filePath);
      } else if (fileType === 'mp4'||fileType === 'mov'||fileType === 'wmv'||fileType === 'avi'||fileType === 'mkv') {
          uploadResult = await uploadVideoOnCloudinary(filePath);
      } else {
          uploadResult = await uploadPDFOnCloudinary(filePath);
      }

      if (uploadResult) {
          fs.unlinkSync(filePath); // Remove temp file after upload
          res.status(200).json({ url: uploadResult.url });
      } else {
          fs.unlinkSync(filePath); // Remove temp file after upload
          res.status(500).json({ error: 'File upload to Cloudinary failed' });

        }

      
  } catch (error) {
      res.status(500).json({ error: 'File upload failed' });
      console.log("Error in sendFileMessage:", error);
  }
};


// const sendFileMessage = async(req,res)=>{
//   console.log("Inside the SendFileMessage function, The request is",req);
//   try {
//     const filePath = req.file.path;
//     const fileType = req.file.mimetype.split('/')[0];
//     let uploadResult;
//     console.log("The file path and file type is ",filePath," ",fileType);

//     if (fileType === 'image') {
//       uploadResult = await uploadImageOnCloudinary(filePath);
//     } else if (fileType === 'video') {
//       uploadResult = await uploadVideoOnCloudinary(filePath);
//     } else {
//       uploadResult = await uploadPDFOnCloudinary(filePath);
//     }
//     console.log("The response of the uploaded file is ",uploadResult);
//     res.status(200).json({ url: uploadResult.url });
//   } catch (error) {
//     res.status(500).json({ error: 'File upload failed' });
//   }
// }

module.exports = {sendMessage,getMessages,sendFileMessage}