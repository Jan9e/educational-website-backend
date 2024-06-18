const router=require("express").Router();
const User= require("../models/users");
const CryptoJS = require("crypto-js");
const jwt =require("jsonwebtoken");

router.post("/register", async(req, res)=>{
    const newuser= new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
    });


    try{
        const saveduser= await newuser.save();
        res.status(200).json(saveduser);
        // res.status(200).json("success");
    }
    catch(err){
        res.status(500).json(err);
    }
});

//LOGIN

router.post("/login", async(req, res)=>{
    try{
        const user= await User.findOne({username: req.body.username});
        if (!user) {
            return res.status(401).json("Wrong credentials!");
          }
        
        const hashedpassword= CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);

        const originalpassword =hashedpassword.toString(CryptoJS.enc.Utf8);
        const inputpassword=req.body.password;
        if(originalpassword !==inputpassword) return res.status(401).json("wrong password !");

        const token = jwt.sign(
            {
            id:user._id,
            isAdmin:user.isAdmin
            },
        'process.env.JWT_SEC',
        {expiresIn:86400}
        );


        const {password, ...others}=user._doc;
        
        res.status(200).json({...others, token});
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports= router;