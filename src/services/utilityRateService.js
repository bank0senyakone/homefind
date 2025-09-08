import prisma from '../prisma/prisma.js';

export const createUtilityRate = async (data) => {
    try {
        // Validate type enum
        const validTypes = ['water', 'electric'];
        if (!validTypes.includes(data.type)) {
            throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
        }

        // Validate rate
        if (isNaN(parseFloat(data.ratePerUnit)) || parseFloat(data.ratePerUnit) <= 0) {
            throw new Error('Rate per unit must be a positive number');
        }

        return await prisma.utilityRate.create({
            data: {
                type: data.type,
                ratePerUnit: parseFloat(data.ratePerUnit),
                effectiveFrom: new Date(data.effectiveFrom)
            }
        });
    } catch (error) {
        throw new Error(`Error creating utility rate: ${error.message}`);
    }
}

export const getAllUtilityRates = async () => {
    try {
        return await prisma.utilityRate.findMany({
            orderBy: [
                {
                    type: 'asc'
                },
                {
                    effectiveFrom: 'desc'
                }
            ]
        });
    } catch (error) {
        throw new Error(`Error fetching utility rates: ${error.message}`);
    }
}

export const getCurrentUtilityRate = async (type) => {
    try {
        // Validate type enum
        const validTypes = ['water', 'electric'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
        }

        return await prisma.utilityRate.findFirst({
            where: {
                type: type,
                effectiveFrom: {
                    lte: new Date()
                }
            },
            orderBy: {
                effectiveFrom: 'desc'
            }
        });
    } catch (error) {
        throw new Error(`Error fetching current utility rate: ${error.message}`);
    }
}

export const getUtilityRateById = async (utilityRateId) => {
    try {
        return await prisma.utilityRate.findUnique({
            where: { 
                utilityRate_id: parseInt(utilityRateId) 
            }
        });
    } catch (error) {
        throw new Error(`Error fetching utility rate: ${error.message}`);
    }
}

export const updateUtilityRate = async (utilityRateId, data) => {
    try {
        // Validate type enum if provided
        if (data.type) {
            const validTypes = ['water', 'electric'];
            if (!validTypes.includes(data.type)) {
                throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
            }
        }

        // Validate rate if provided
        if (data.ratePerUnit) {
            if (isNaN(parseFloat(data.ratePerUnit)) || parseFloat(data.ratePerUnit) <= 0) {
                throw new Error('Rate per unit must be a positive number');
            }
        }

        return await prisma.utilityRate.update({
            where: { 
                utilityRate_id: parseInt(utilityRateId) 
            },
            data: {
                type: data.type,
                ratePerUnit: data.ratePerUnit ? parseFloat(data.ratePerUnit) : undefined,
                effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined
            }
        });
    } catch (error) {
        throw new Error(`Error updating utility rate: ${error.message}`);
    }
}

export const deleteUtilityRate = async (utilityRateId) => {
    try {
        const utilityRate = await prisma.utilityRate.findUnique({
            where: { 
                utilityRate_id: parseInt(utilityRateId) 
            }
        });

        if (!utilityRate) {
            throw new Error('Utility rate not found');
        }

        // Check if this is the only current rate for its type
        const currentRate = await getCurrentUtilityRate(utilityRate.type);
        if (currentRate && currentRate.utilityRate_id === parseInt(utilityRateId)) {
            throw new Error('Cannot delete the current active utility rate');
        }

        return await prisma.utilityRate.delete({
            where: { 
                utilityRate_id: parseInt(utilityRateId) 
            }
        });
    } catch (error) {
        throw new Error(`Error deleting utility rate: ${error.message}`);
    }
}

export const getUtilityRateHistory = async (type, startDate, endDate) => {
    try {
        // Validate type enum
        const validTypes = ['water', 'electric'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
        }

        return await prisma.utilityRate.findMany({
            where: {
                type: type,
                effectiveFrom: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: {
                effectiveFrom: 'desc'
            }
        });
    } catch (error) {
        throw new Error(`Error fetching utility rate history: ${error.message}`);
    }
}