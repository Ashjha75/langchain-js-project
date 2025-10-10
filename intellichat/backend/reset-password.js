const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema (simplified)
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    role: String,
    status: String
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
    try {
        // Connect to database
        await mongoose.connect('mongodb+srv://ashishbiller_db_user:iN1zSaW1tqdf9uCM@cluster0.t6wailw.mongodb.net/intellichat');
        console.log('Connected to database');

        // Find the user
        const email = 'ashish.jha@novoinvent.com';
        const newPassword = 'Staging123$';

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', {
            id: user._id,
            email: user.email,
            currentPasswordHash: user.password.substring(0, 20) + '...'
        });

        // Hash the new password correctly (single hash)
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user directly in database
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        console.log('Password updated successfully');
        console.log('New password hash:', hashedPassword.substring(0, 20) + '...');

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