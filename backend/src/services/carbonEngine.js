import EmissionFactor from '../models/EmissionFactor.js';

/**
 * Carbon Intelligence Engine
 * Dynamically calculates Scope 1, 2, and 3 emissions based on configured factors.
 */

export const calculateEmissions = async (value, category, scope, plantId = null) => {
    try {
        // Find the active emission factor for this category and scope
        const factorQuery = {
            category,
            scope,
            isActive: true,
            effectiveDate: { $lte: new Date() }
        };
        
        if (plantId) {
            // Priority: Plant-specific factor first, then fallback to organization default
            factorQuery.$or = [{ plantId }, { plantId: null }];
        }

        const factors = await EmissionFactor.find(factorQuery).sort({ plantId: -1, effectiveDate: -1 });

        if (!factors || factors.length === 0) {
            console.warn(`[CarbonEngine] No active emission factor found for ${scope} - ${category}. Using fallback.`);
            // Fallback for Phase 3 if database is empty
            const fallbackFactor = scope === 'SCOPE_2' ? 0.38 : (scope === 'SCOPE_1' ? 2.68 : 0.50);
            return {
                emissionsKg: value * fallbackFactor,
                factorApplied: fallbackFactor,
                source: 'Fallback System Default',
                version: '1.0',
                isEstimate: true
            };
        }

        const activeFactor = factors[0];

        return {
            emissionsKg: value * activeFactor.factorValue,
            factorApplied: activeFactor.factorValue,
            unit: activeFactor.unit,
            source: activeFactor.source,
            version: activeFactor.version,
            isEstimate: scope === 'SCOPE_3' // Scope 3 is treated as an estimate per PRD Section 15
        };

    } catch (error) {
        console.error('[CarbonEngine] Error calculating emissions:', error);
        return null;
    }
};

/**
 * Utility to seed default emission factors.
 */
export const seedDefaultEmissionFactors = async () => {
    try {
        const count = await EmissionFactor.countDocuments();
        if (count > 0) return;

        console.log('[CarbonEngine] Seeding default emission factors...');
        
        const defaultFactors = [
            {
                name: "US Grid Average Electricity",
                scope: "SCOPE_2",
                category: "Electricity",
                factorValue: 0.38,
                unit: "kgCO2e/kWh",
                source: "EPA eGRID 2023",
                version: "2023.1"
            },
            {
                name: "Diesel Fuel Combustion",
                scope: "SCOPE_1",
                category: "Fuel",
                factorValue: 2.68,
                unit: "kgCO2e/liter",
                source: "EPA 2023",
                version: "2023.1"
            },
            {
                name: "Raw Material - Steel Proxy",
                scope: "SCOPE_3",
                category: "Raw Material",
                factorValue: 1.85,
                unit: "kgCO2e/kg",
                source: "DEFRA 2024",
                version: "2024.1"
            }
        ];

        await EmissionFactor.insertMany(defaultFactors);
    } catch (error) {
        console.error('[CarbonEngine] Error seeding emission factors:', error);
    }
};
