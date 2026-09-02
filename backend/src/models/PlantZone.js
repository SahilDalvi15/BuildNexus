import mongoose from 'mongoose';

const plantZoneSchema = new mongoose.Schema({
    zoneId: {
        type: String,
        required: true,
        unique: true
    },
    plantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['PRODUCTION', 'STORAGE', 'MAINTENANCE', 'OFFICE', 'OTHER'],
        default: 'PRODUCTION'
    },
    boundaries: {
        // Simple 2D bounding box
        xMin: Number,
        yMin: Number,
        xMax: Number,
        yMax: Number
    },
    environmentConstraints: {
        targetTemperature: Number,
        maxHumidity: Number
    }
}, {
    timestamps: true
});

plantZoneSchema.index({ plantId: 1 });

export default mongoose.model('PlantZone', plantZoneSchema);
