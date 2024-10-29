const jwt =  require('jsonwebtoken');
const {User} = require('../schema/userschema')

const Auth = async (req, res, next) => {
  try {
    console.log("the authorization header data is ",req.headers.authorization);

    // let token = req.headers.authorization.split(' ')[0]; //when using browser this line
    let token = req.headers.authorization.split(' ')[1]; //when using postman this line
    
    const verifiedUser = jwt.verify(token, process.env.SECRET);
    const rootUser = await User
        .findOne({ _id: verifiedUser.id })
        .select('-password');
    if(rootUser){
        req.userId = rootUser._id;
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