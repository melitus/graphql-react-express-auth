import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate';


const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true},
  password: { type: String, required: true },
  role: { Type: String, enum: ['Client', 'Manager', 'Admin'], default: 'Client'},
  confirmed: Boolean,
  active: { type: Boolean, default: false 
  },
  dob: { Type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Saves the user's password hashed (.pre hook helps hash the password before saving it to db)
UserSchema.pre('save', async function(next) {
    try {
      console.log('entered');
      if (this.method !== 'local') {
        next();
      }
  
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      // Generate a password hash (salt + hash)
      const passwordHash = await bcrypt.hash(this.local.password, salt);
      // Re-assign hashed version over original, plain text password
      this.local.password = passwordHash;
      console.log('exited');
      next();
    } catch(error) {
      next(error);
    }
  });

// Create method to compare password input to password saved in database
  UserSchema.methods.isValidPassword = async function(newPassword) {
    try {
      return await bcrypt.compare(newPassword, this.local.password);
    } catch(error) {
      throw new Error(error);
    }
  }
  

UserSchema.plugin(mongoosePaginate);

// create the model for users and expose it to our app
const User = mongoose.model('User', UserSchema);

