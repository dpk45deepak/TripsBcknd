import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
  },
  tokens: {
    type: [{
      refreshToken: String
    }],
    default: []
  }
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function (next) {
  // skip here because password hashing is handled in the controller
  // if (this.isModified('password')) {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }
  next();
});

// Static method to find user by email and password
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');
  return user;
};

// collection name is 'users'
const User = mongoose.model('User', userSchema);

export default User;