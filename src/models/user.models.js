import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
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
    location: {
      type: String,
      default: '',
    },
    budget: {
      type: String,
      default: '0',
    },
    history: [
      {
        id: String,
        type: String,
      },
    ],
    favoriteCategories: {
      type: {
        destinationType: { type: [String], default: [] },
        climatePreference: { type: [String], default: [] },
        activities: { type: [String], default: [] },
        duration: { type: String, default: "Weekend" },
        budget: { type: String, default: "Under 50k" },
      }
    },
    tokens: [
      {
        refreshToken: { type: String },
      },
    ],
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePic: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    website: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      default: '',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    newslettersEnabled: {
      type: Boolean,
      default: true,
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    bio: {
      type: String,
      default: 'Travel enthusiast!',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'dbAdmin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Generate username automatically if not provided
userSchema.pre('validate', function (next) {
  if (!this.username) {
    this.username =
      'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }
  next();
});

// Password hashing (only for local users)
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Static method to verify credentials for local users
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email, provider: 'local' });
  if (!user) throw new Error('Invalid credentials');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
