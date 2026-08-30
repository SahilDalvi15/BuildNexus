import { GoogleGenAI } from '@google/genai';
import SensorReading from '../models/SensorReading.js';

// Initialize the Gemini client. It will automatically use process.env.GEMINI_API_KEY
// Note: User can provide the API key in the .env file
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI() : null;

// Helper function to fetch live factory context
const getLiveFactoryContext = async () => {
  try {
    const latestReadings = await SensorReading.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$machineId",
          oee: { $first: "$derivedMetrics.OEE" },
          availability: { $first: "$derivedMetrics.availability" },
          performance: { $first: "$derivedMetrics.performance" },
          quality: { $first: "$derivedMetrics.quality" },
          energyConsumption: { $first: "$energyConsumption" },
          operatingStatus: { $first: "$operatingStatus" }
        }
      }
    ]);

    if (!latestReadings || latestReadings.length === 0) {
      return "Factory Context: No live data available right now.";
    }

    const totalMachines = latestReadings.length;
    const runningMachines = latestReadings.filter(r => r.operatingStatus === 'RUNNING').length;
    const avgOEE = latestReadings.reduce((acc, curr) => acc + (curr.oee || 0), 0) / totalMachines;
    const totalEnergy = latestReadings.reduce((acc, curr) => acc + (curr.energyConsumption || 0), 0);

    return `
      Current Factory Context (Real-Time Data):
      - Total Machines: ${totalMachines}
      - Currently Running: ${runningMachines}
      - Down/Idle: ${totalMachines - runningMachines}
      - Average OEE (Overall Equipment Effectiveness): ${(avgOEE * 100).toFixed(2)}%
      - Total Live Energy Consumption: ${totalEnergy.toFixed(2)} kWh
    `;
  } catch (error) {
    console.error("Error fetching factory context for AI:", error);
    return "Factory Context: Unable to fetch live data.";
  }
};

// @desc    Ask the AI Assistant a question (with RAG/Grounding)
// @route   POST /api/ai/ask
// @access  Private
export const askAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question) {
      res.status(400);
      throw new Error('Please provide a question');
    }

    if (!ai) {
      // If no API key is provided yet, return a mock response that still demonstrates the context injection
      const context = await getLiveFactoryContext();
      return res.json({
        answer: "This is a mock response because the GEMINI_API_KEY is not set in the .env file. \n\nHowever, I am aware of the current factory state!\n\n" + context,
        contextUsed: true
      });
    }

    // Fetch the live context
    const factoryContext = await getLiveFactoryContext();

    // Construct the system instruction
    const systemInstruction = `
      You are the BuildNexus AI Assistant, an intelligent companion for factory engineers and managers.
      You have access to live data from the factory floor. Always be helpful, concise, and professional.
      Use the following real-time factory context to inform your answers if relevant:
      ${factoryContext}
    `;

    // Call the Gemini API
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: question,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    res.json({
      answer: response.text,
      contextUsed: true
    });
  } catch (error) {
    next(error);
  }
};
