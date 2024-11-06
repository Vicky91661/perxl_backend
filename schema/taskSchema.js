const mongoose = require('mongoose');
const taskSchema = mongoose.Schema(
  {
    taskName: { 
      type: String, 
      required: true
    },
    priority:{
        type:String,
        enum:["Low","Normal","Medium","High","Critical"],
        default:"Low",
        required: true
    },
    status:{
        type:String,
        enum:["Todo","Working","completed"],
        default:"Todo",
        required: true
    },
    startDate:{
        type:Number,
        required: true
    },
    CreatedDate:{
        type:Number,
        default:Date.now(),
        required: true
    },
    dueDate:{
        type:Number,
        required: true
    },
    groupId:
    {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    },
    createrId:{
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

