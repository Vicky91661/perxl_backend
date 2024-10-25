const jwt = require('jsonwebtoken');
const {z} = require("zod")
const bcrypt = require('bcrypt');

const {User} = require("../schema/userschema");
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
    const otp =req.body.otp
    const phoneNumber =req.body.phoneNumber
    console.log("the otp received is ",otp," for the number => ",phoneNumber)

    try {
        // Validate the input using Zod
        verifyOTP.parse({phoneNumber,otp})

        // Check if the user exists
        const userExist = await User.findOne({phoneNumber});
        console.log("User exist ");
        if(userExist){
            const result = await bcrypt.compare(otp.toString(),userExist.otp)
            if(result){
                // make the user verified and save it
                userExist.verified = true;
                await userExist.save(); 
                
                res.status(200).json({
                    message: "successfully login",
                    firstName:userExist.firstName,
                    lastName:userExist.lastName,
                    verified:userExist.verified,
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
            message: ["Error while sign in"]
        });
    }


    var token = jwt.sign({ phoneNumber }, JWT_SECRET);
}

const Signin = async (req,res)=>{
    console.log("requested body is",req.body)
   
    const phoneNumber =req.body.phoneNumber
    
    try {
        userSignin.parse({phoneNumber})
        const userExist = await User.findOne({phoneNumber});
        const otp = generateOTP();
        if(userExist){
            if(result){
                    
                    res.status(200).json({
                        message: "successfully login",
                        firstName:userExist.firstName,
                        lastName:userExist.lastName,
                        token
                    })  
            }else{
                res.status(411).json({
                    message: ["Password is incorrect"]
                })
            }
            

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

    const phoneNumber =req.body.phoneNumber
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
    const { phoneNumber, firstName, lastName, profilePic } = req.body;

    try {
        // Validate the input with Zod
        updateUserSchema.parse({ phoneNumber, firstName, lastName, profilePic });

        // Find the user by phone number
        const user = await User.findOne({ phoneNumber });
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
module.exports = {Signin,Signup,VerifyOTP,updateData}