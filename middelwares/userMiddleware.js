const jwt =  require('jsonwebtoken');
const User = require('../schema/userschema')

const Auth = async (req, res, next) => {
  try {
    // console.log("Inside the user middle ware");
    let token = req.headers.authorization.split(' ')[1]; //when using postman this line
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);

    const rootUser = await User
        .findOne({ phoneNumber: verifiedUser.phoneNumber })
        .select('-otp');

    if(rootUser){

        req.body = Object.assign({}, req.body, { userId: rootUser._id });

        next();
    }else{
        res.status(411).json({ error: 'Invalid User' });
    }
   
  } catch (error) {
    // console.log(error);
    res.status(411).json({ error: 'Invalid User' });
  }
};

module.exports = Auth;