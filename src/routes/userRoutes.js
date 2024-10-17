import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Adjust this path to where your User model is located

const router = express.Router();

router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dob,
    address,
    volunteeringPreferences,
    shiftPreferences,
  } = req.body;

  console.log(shiftPreferences);

  // Check if all required fields are provided
  if (
    !firstName || !lastName || !email || !password || !dob ||
    !address || !address.streetAddress || !address.city ||
    !address.state || !address.zipCode ||
    !volunteeringPreferences || !shiftPreferences
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided information
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dob,
      address: {
        streetAddress: address.streetAddress,
        streetAddress2: address.streetAddress2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      },
      volunteeringPreferences: {
        tshirts: volunteeringPreferences.tshirts,
        ticketSales: volunteeringPreferences.ticketSales,
        raffleTicketSales: volunteeringPreferences.raffleTicketSales,
        trafficParking: volunteeringPreferences.trafficParking,
        cleanupGrounds: volunteeringPreferences.cleanupGrounds,
      },
      shiftPreferences: {
        morning: shiftPreferences.morning,
        afternoon: shiftPreferences.afternoon,
        evening: shiftPreferences.evening,
      },
    });

    // Save the user to the database
    await user.save();

    // Optionally send a confirmation email (commented out)
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Confirm your account',
    //   text: `Hello ${firstName},\n\nPlease confirm your account by clicking the link: http://localhost:3000/confirm?token=somegeneratedtoken\n\nThank you!`,
    // };
    // await transporter.sendMail(mailOptions);

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully. Please check your email to confirm your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
