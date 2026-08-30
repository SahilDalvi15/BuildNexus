import { Server } from 'socket.io';
import Machine from '../models/Machine.js';

let io;
let simulatorInterval;

// Helper to generate a random float between min and max
const randomFloat = (min, max) => (Math.random() * (max - min) + min);

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For development. In production, restrict this.
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Start the live data simulation if not already started
  startSimulator();
};

const startSimulator = async () => {
  if (simulatorInterval) return;

  console.log('Starting WebSockets Real-Time Simulator...');

  simulatorInterval = setInterval(async () => {
    try {
      if (!io) return;

      // Fetch a few machines to simulate updates for
      const machines = await Machine.find({ currentStatus: 'ONLINE' }).limit(5);

      const liveUpdates = machines.map(machine => {
        // Generate random realistic deltas for sensor data
        return {
          machineId: machine.machineId,
          timestamp: new Date(),
          readings: {
            temperature: randomFloat(70, 95).toFixed(2),
            vibration: randomFloat(0.1, 0.8).toFixed(3),
            pressure: randomFloat(95, 110).toFixed(1),
            current: randomFloat(10, 25).toFixed(2),
            voltage: randomFloat(215, 230).toFixed(1),
            powerFactor: randomFloat(0.85, 0.99).toFixed(2)
          },
          derivedMetrics: {
            OEE: randomFloat(0.70, 0.95).toFixed(3),
            availability: randomFloat(0.8, 1.0).toFixed(3),
            performance: randomFloat(0.8, 1.0).toFixed(3),
            quality: randomFloat(0.9, 1.0).toFixed(3)
          },
          energyConsumption: randomFloat(10, 50).toFixed(2),
          operatingStatus: 'RUNNING'
        };
      });

      // Broadcast the updates to all connected frontend clients
      if (liveUpdates.length > 0) {
        io.emit('factory-live-updates', liveUpdates);
      }
    } catch (error) {
      console.error('Socket Simulator Error:', error);
    }
  }, 3000); // Broadcast every 3 seconds
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
