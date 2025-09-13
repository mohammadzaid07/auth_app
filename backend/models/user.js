import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  graphicalPassword: [{ type: String }],
  colorPassword: [{ type: String }],
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

export default User;
