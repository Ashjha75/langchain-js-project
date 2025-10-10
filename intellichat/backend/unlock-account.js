const mongoose = require('mongoose');

// User schema (simplified)
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    role: String,
    status: String,
    auth: {
        failedLoginAttempts: Number,
        lastFailedLogin: Date,
        accountLocked: Boolean,
        lockUntil: Date,
        lastLogin: Date
    }
});

const User = mongoose.model('User', userSchema);

async function unlockAccount() {
    try {
        // Connect to database
        await mongoose.connect('mongodb+srv://ashishbiller_db_user:iN1zSaW1tqdf9uCM@cluster0.t6wailw.mongodb.net/intellichat');
        console.log('Connected to database');

        // Find the user
        const email = 'ashish.jha@novoinvent.com';

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', {
            id: user._id,
            email: user.email,
            failedLoginAttempts: user.auth?.failedLoginAttempts || 0,
            lastFailedLogin: user.auth?.lastFailedLogin
        });

        // Reset failed login attempts and unlock account
        await User.updateOne(
            { _id: user._id },
            { 
                $unset: { 
                    'auth.failedLoginAttempts': 1, 
                    'auth.lastFailedLogin': 1,
                    'auth.accountLocked': 1,
                    'auth.lockUntil': 1
                }
            }
        );

        console.log('Account unlocked successfully');

        await mongoose.disconnect();
        console.log('Disconnected from database');
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
}

unlockAccount();