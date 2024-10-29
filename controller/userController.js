const jwt = require('jsonwebtoken');
const {z} = require("zod")
const bcrypt = require('bcrypt');

const User = require("../schema/userschema");
const  JWT_SECRET  = process.env.JWT_SECRET;
const {saltRounds} = require("../config/config");
const { generateOTP } = require('../utils/otp');

const userSignin =z.object({
    phoneNumber:z.number().int() // Make sure it's an integer
    .gte(1000000000,{ message: "Phone number is less then 10 digit" }) // Greater than or equal to the smallest 5 digit int
    .lte(9999999999,{ message: "Phone number is more then 10 digit" }),
})

const userSignup =z.object({
    phoneNumber:z.number().int() // Make sure it's an integer
    .gte(1000000000,{ message: "Phone number is less then 10 digit" }) // Greater than or equal to the smallest 5 digit int
    .lte(9999999999,{ message: "Phone number is more then 10 digit" }),
    firstName:z.string().min(1,{message:"First name should not be empty"}).max(20, { message: "firstName must be 20 or less 20 long" }),
    lastName:z.string().min(1,{message:"Last name should not be empty"}).max(20, { message: "lastName must be 20 or less 20 long" })
})

const verifyOTP = z.object({
    
    otp :z.number().int() // Make sure it's an integer
    .gte(100000,{ message: "Invalid OTP" }) // Greater than or equal to the smallest 5 digit int
    .lte(999999,{ message: "Invalid OTP" }),

    phoneNumber:z.number().int() // Make sure it's an integer
    .gte(1000000000,{ message: "Phone number is less then 10 digit" }) // Greater than or equal to the smallest 10 digit int
    .lte(9999999999,{ message: "Phone number is more then 10 digit" }),
})

const updateUserSchema = z.object({
    phoneNumber: z.number().int()
        .gte(1000000000, { message: "Phone number is less than 10 digits" })
        .lte(9999999999, { message: "Phone number is more than 10 digits" }),
    firstName: z.string().min(1, { message: "First name should not be empty" }).max(20, { message: "First name must be 20 characters or less" }).optional(),
    lastName: z.string().min(1, { message: "Last name should not be empty" }).max(20, { message: "Last name must be 20 characters or less" }).optional(),
    profilePic: z.string().url().optional(),
});

const VerifyOTP = async(req,res)=>{
    const otp =Number(req.body.otp);
    const phoneNumber =Number(req.body.phoneNumber);
    console.log("the otp received is ",otp," for the number => ",phoneNumber)

    try {
        // Validate the input using Zod
        verifyOTP.parse({phoneNumber,otp})

        // Check if the user exists
        const userExist = await User.findOne({phoneNumber});
        console.log("User exist ");
        if(userExist){
            const result = await bcrypt.compare(otp.toString(),userExist.otp)
            console.log("the reult after verification is ",result);
            if(result){
                // make the user verified and save it
                userExist.verified = true;
                await userExist.save(); 
                var token = jwt.sign({ phoneNumber }, JWT_SECRET);
                console.log("the tooekn is ",token)
                res.status(200).json({
                    message: "successfully",
                    firstName:userExist.firstName,
                    lastName:userExist.lastName,
                    phoneNumber:req.body.phoneNumber,
                    token
                })  
            }else{
                res.status(411).json({
                    message: ["Invalid OTP"]
                })
            }
        }else{
            res.status(411).json({
                message: ["Phone Number is not registered with us."]
            })
        }


    } catch (error) {
        console.log("error is ",error.message)
        if(error.name==="ZodError"){
            return res.status(411).json({
                message: error.errors.map(err => err.message),
            });
        }
        return res.status(411).json({
            message: ["Error while otp verification"]
        });
    }


    
}

const Signin = async (req,res)=>{
    console.log("requested body is",req.body)
   
    const phoneNumber =Number(req.body.phoneNumber)
    console.log("phone number is",phoneNumber)
    try {
        userSignin.parse({phoneNumber})
        const userExist = await User.findOne({phoneNumber});
        const otp = generateOTP();
        console.log("the otp is ,",otp)
        if(userExist){
            const hashedOTP = await bcrypt.hash(otp, saltRounds);
            userExist.otp = hashedOTP;
            // send the otp to the user

            await userExist.save();
            res.status(200).json({
                message: "successfully send the OTP",
                firstName:userExist.firstName,
                lastName:userExist.lastName,
            })   

        }else{
            res.status(411).json({
                message: ["User does not exist"]
            })
        }
    } catch (error) {
        console.log("error is ",error.message)
        if(error.name==="ZodError"){
            return res.status(411).json({
                message: error.errors.map(err => err.message),
            });
        }
        return res.status(411).json({
            message: ["Error while sign in"]
        });
    }

}

const Signup = async (req,res)=>{

    const phoneNumber =Number(req.body.phoneNumber);
    const firstName =req.body.firstName
    const lastName =req.body.lastName

    console.log("Phone Number is",phoneNumber," first name is ",firstName," last name is ",lastName)
    try {
        userSignup.parse({ phoneNumber, firstName, lastName });
        
        const userExist = await User.findOne({phoneNumber});
        console.log("user already exist",userExist);

        if(userExist){
            
            return res.status(411).json({
                message: ["user already taken"]
            })

        }else{
            const otp = generateOTP();
            console.log("OTP is => ",otp);
            const hashedOTP = await bcrypt.hash(otp, saltRounds);
            console.log("hased password is ",hashedOTP);
            const user = await User.create({
                phoneNumber,
                otp:hashedOTP,
                firstName,
                lastName,
                verified:false
            })
            if(user){
                return res.status(200).json({
                    message:["sucessfull"]   
                })
                
            }else{
                return res.status(411).json({
                    message: ["Signed up failed"]
                })
            }
        
        }
    } catch (error) {

        console.log("error is ",error.message)
        if(error.name==="ZodError"){
            return res.status(411).json({
                message: error.errors.map(err => err.message),
            });
        }
        return res.status(411).json({
            message: ["Error while sign up"]
        });
    } 
    
}

const updateData = async (req,res)=>{
    const {userId, firstName, lastName, profilePic } = req.body;

    try {
        // Validate the input with Zod
        updateUserSchema.parse({ phoneNumber, firstName, lastName, profilePic });

        // Find the user by phone number
        const user = await User.findOne({ _id:userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (profilePic) user.profilePic = profilePic;

        // Save the updated user
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            firstName: user.firstName,
            lastName: user.lastName,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: error.errors.map(err => err.message),
            });
        }
        return res.status(500).json({ message: "Error updating profile" });
    }
}


const fetchAllUsers = async (req, res) => {
    try {
        // Fetch all users and select only the fields you need
        const users = await User.find({}, {
            _id: 1,            // MongoDB's _id field, will be mapped to userId
            firstName: 1,
            lastName: 1,
            phoneNumber: 1,
            profilePic: 1
        });

        // Format the response to use "userId" instead of "_id"
        const formattedUsers = users.map(user => ({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            profilePic: user.profilePic
        }));

        res.status(200).json({
            message: "Users fetched successfully",
            users: formattedUsers
        });
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        return res.status(500).json({
            message: ["Error while fetching all users"]
        });
    }
}

module.exports = {Signin,Signup,VerifyOTP,updateData,fetchAllUsers}