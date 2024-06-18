const mongoose=require("mongoose");


const Userschema= new mongoose.Schema({
    username :{type: String, required: true, unique: true},
    email :{type : String, required : true, unique: true},
    password: {type: String, required: true},
    isAdmin:{type: Boolean, default:false},
    token: { type: String },
},
{timestamps: true}
);

module.exports = mongoose.model("users", Userschema);