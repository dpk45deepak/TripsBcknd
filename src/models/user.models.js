import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
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
    tokens: [
      {
        refreshToken: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Generate username automatically BEFORE validation
// (use 'validate' hook instead of 'save', so required passes)
userSchema.pre('validate', function (next) {
  if (!this.username) {
    this.username = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }
  next();
});

// ✅ Password hashing (only if password is modified)
// If you handle hashing in controller, keep it commented
// Uncomment below if you want model-level hashing
/*
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
*/

// ✅ Static method to verify credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
