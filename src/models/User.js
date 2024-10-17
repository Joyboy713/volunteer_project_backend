import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true},
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  address: {
    streetAddress: { type: String, required: true },
    streetAddress2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  volunteeringPreferences: {
    tshirts: { type: String },
    ticketSales: { type: String },
    raffleTicketSales: { type: String },
    trafficParking: { type: String },
    cleanupGrounds: { type: String },
  },
  shiftPreferences: {
    morning: { type: String },
    afternoon: { type: String},
    evening: { type: String },
  },
}, { timestamps: true });

// Pre-save middleware to hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
