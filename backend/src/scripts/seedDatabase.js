import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import connectDB from '../config/db.js';
import Machine from '../models/Machine.js';
import SensorReading from '../models/SensorReading.js';
import User from '../models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the generated synthetic data
const DATA_PATH = path.resolve(__dirname, '../../../ml-services/data/synthetic_sensor_data.csv');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Machine.deleteMany();
    await SensorReading.deleteMany();
    await User.deleteMany();

    console.log('Creating Admin User...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = new User({
      username: 'admin',
      email: 'admin@buildnexus.local',
      passwordHash: passwordHash,
      role: 'ADMIN'
    });
    await admin.save();
    console.log('Admin user created.');

    console.log('Reading synthetic CSV data...');
    const csvData = fs.readFileSync(DATA_PATH, 'utf-8');
    const lines = csvData.split('\n').filter(line => line.trim().length > 0);
    
    // First line is headers
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('Extracting unique machines...');
    const machineIds = new Set();
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length !== headers.length) continue;

      const row = {};
      headers.forEach((h, index) => {
        row[h] = values[index];
      });

      machineIds.add(row.machine_id);
      rows.push(row);
    }

    console.log(`Found ${machineIds.size} unique machines.`);
    
    // Insert Machines
    const machineDocs = Array.from(machineIds).map((mId, index) => {
      // We assign random machine types since we didn't export it in the CSV directly
      const types = ['CNC_MILLING', 'CNC_LATHE', 'FURNACE', 'CONVEYOR', 'PRESS', 'GRINDER'];
      return {
        machineId: mId,
        name: `Machine ${mId}`,
        type: types[index % types.length],
        status: 'RUNNING',
        department: 'Assembly',
        productionLine: `Line ${Math.ceil((index + 1) / 10)}`,
        installationDate: new Date(),
        location: {
          plant: 'Main Plant',
          section: `Section ${Math.ceil((index + 1) / 5)}`
        },
        specifications: {
          manufacturer: 'Nexus Industrial',
          model: `NX-${1000 + index}`,
          maxCapacity: 100
        }
      };
    });

    await Machine.insertMany(machineDocs);
    console.log('Machines seeded.');

    console.log('Formatting and inserting sensor readings in batches...');
    
    const BATCH_SIZE = 1000;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE).map(row => ({
        machineId: row.machine_id,
        timestamp: new Date(row.timestamp),
        readings: {
          temperature: parseFloat(row.temperature),
          vibration: parseFloat(row.vibration),
          pressure: parseFloat(row.pressure),
          current: parseFloat(row.current),
          voltage: parseFloat(row.voltage),
          powerFactor: 0.95 // Synthetic static
        },
        energyConsumption: parseFloat(row.energy_kwh),
        operatingStatus: row.operating_status,
        productionCount: parseInt(row.production_count, 10),
        qualityMetrics: {
          defectRate: 1 - parseFloat(row.quality_score), // Just mapping it logically
          scrapRate: (1 - parseFloat(row.quality_score)) * 0.5
        },
        derivedMetrics: {
          quality: parseFloat(row.quality_score),
          OEE: parseFloat(row.quality_score) * 0.9,
          availability: row.operating_status === 'RUNNING' ? 1.0 : 0.0,
          performance: 0.95
        },
        metadata: {
          failure_risk: parseInt(row.failure_risk, 10),
          is_weekend: parseInt(row.is_weekend, 10),
          hour: parseInt(row.hour, 10),
          temp_rolling_mean: parseFloat(row.temp_rolling_mean),
          vib_rolling_mean: parseFloat(row.vib_rolling_mean),
          temp_rate: parseFloat(row.temp_rate),
          vib_rate: parseFloat(row.vib_rate),
          energy_efficiency: parseFloat(row.energy_efficiency)
        }
      }));

      await SensorReading.insertMany(batch);
      console.log(`Inserted batch ${Math.ceil(i / BATCH_SIZE) + 1} of ${Math.ceil(rows.length / BATCH_SIZE)}`);
    }

    console.log('Data Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
