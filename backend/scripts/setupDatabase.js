import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import SensorReading from '../src/models/SensorReading.js';

dotenv.config();

const setupDatabase = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Ensuring time-series collection is configured...');
        
        // Mongoose automatically creates collections with the right options 
        // when init() is called if they don't exist yet
        await SensorReading.init();

        console.log('Ensuring indexes...');
        await SensorReading.syncIndexes();

        console.log('Database setup complete. SensorData is now optimized for time-series IoT data.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
};

setupDatabase();
