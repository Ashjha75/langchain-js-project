import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';
import { config } from '../config';

async function resetPassword() {
    try {
        // Connect to database
        await mongoose.connect(config.database.mongodb.uri);
        console.log('Connected to database');

        // Find the user
        const email = 'ashish.jha@novoinvent.com';
        const newPassword = 'Staging123$'; // The password you want to set

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', {
            id: user._id,
            email: user.email,
            currentPasswordHash: user.password
        });

        // Hash the new password correctly (single hash)
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user directly in database (bypass the pre-save hook)
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        console.log('Password updated successfully');
        console.log('New password hash:', hashedPassword);

        // Test the new hash
        const isValid = await bcrypt.compare(newPassword, hashedPassword);
        console.log('Password verification test:', isValid);

        await mongoose.disconnect();
        console.log('Disconnected from database');
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
}

resetPassword();