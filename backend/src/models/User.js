import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'ENGINEER', 'OPERATOR', 'VIEWER'],
    default: 'VIEWER'
  },
  preferences: {
    dashboardLayout: {
      type: mongoose.Schema.Types.Mixed
    },
    notificationSettings: {
      emailAlerts: { type: Boolean, default: true },
      criticalOnly: { type: Boolean, default: false }
    }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

export default User;
