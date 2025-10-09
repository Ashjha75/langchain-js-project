import app from './app';
import dbConnect from './database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await dbConnect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
