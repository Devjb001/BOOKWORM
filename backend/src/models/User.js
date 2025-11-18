import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({

    username: {
        type : String,
        require: true,
        unique : true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    password: {
        type : String,
        require : true,
        minLength : 6
    },
    profileImage: {
        type: String,
        default: ""
    }
},{ timestamps : true });


userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema)
export default User;
