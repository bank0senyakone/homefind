import prisma from '../prisma/prisma.js';

export const createMeterReading = async (data) => {
    try {
      // Validate required fields
      if (!data.room_id || !data.contract_id) {
        throw new Error('room_id and contract_id are required');
      }

      // Validate room exists
      const room = await prisma.room.findUnique({
        where: { room_id: data.room_id }
      });
      if (!room) {
        throw new Error('Room not found');
      }
      // Validate contract exists
      const contract = await prisma.contract.findUnique({
        where: { contract_id: data.contract_id }
      });
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Check if contract belongs to room
      if (contract.room_id !== data.room_id) {
        throw new Error('Contract does not belong to this room');
      }

      // Validate decimal values
      const numericFields = [
        "waterOld",
        "waterNew",
        "electricOld",
        "electricNew",
      ];
      for (const field of numericFields) {
        const value = parseFloat(data[field]);
        if (isNaN(value)) {
          throw new Error(`Invalid ${field} value: must be a number`);
        }
        // Validate new readings are higher than old readings
        if (field === 'waterNew' && value <= parseFloat(data.waterOld)) {
          throw new Error('New water reading must be higher than old reading');
        }
        if (field === 'electricNew' && value <= parseFloat(data.electricOld)) {
          throw new Error('New electric reading must be higher than old reading');
        }
      }

      // Validate dates
      const month = new Date(data.month);
      const recordedDate = new Date(data.recordedDate);
      if (isNaN(month.getTime())) {
        throw new Error('Invalid month date format');
      }
      if (isNaN(recordedDate.getTime())) {
        throw new Error('Invalid recorded date format');
      }

      // Create meter reading with validated data
      return await prisma.meterReading.create({
        data: {
          room: {
            connect: {
              room_id: data.room_id
            }
          },
          contract: {
            connect: {
              contract_id: data.contract_id
            }
          },
          month,
          waterOld: parseFloat(data.waterOld),
          waterNew: parseFloat(data.waterNew),
          electricOld: parseFloat(data.electricOld),
          electricNew: parseFloat(data.electricNew),
          recordedDate
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error creating meter reading: ${error.message}`);
    }
  }

export const getAllMeterReadings = async () => {
    try {
      return await prisma.meterReading.findMany({
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
        orderBy: {
          recordedDate: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching meter readings: ${error.message}`);
    }
  }

export const getMeterReadingsByRoom = async (roomId) => {
    try {
      return await prisma.meterReading.findMany({
        where: {
          room_id: roomId,
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
        orderBy: {
          recordedDate: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching room meter readings: ${error.message}`);
    }
  }

export const getMeterReadingById = async (meterReadingId) => {
    try {
      return await prisma.meterReading.findUnique({
        where: {
          meterReading_id: meterReadingId,
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching meter reading: ${error.message}`);
    }
  }

export const updateMeterReading = async (meterReadingId, data) => {
    try {
      // Validate decimal values if provided
      const numericFields = [
        "waterOld",
        "waterNew",
        "electricOld",
        "electricNew",
      ];
      for (const field of numericFields) {
        if (data[field] !== undefined && isNaN(parseFloat(data[field]))) {
          throw new Error(`Invalid ${field} value: must be a number`);
        }
      }

      return await prisma.meterReading.update({
        where: {
          meterReading_id: meterReadingId,
        },
        data: {
          waterOld: data.waterOld ? parseFloat(data.waterOld) : undefined,
          waterNew: data.waterNew ? parseFloat(data.waterNew) : undefined,
          electricOld: data.electricOld
            ? parseFloat(data.electricOld)
            : undefined,
          electricNew: data.electricNew
            ? parseFloat(data.electricNew)
            : undefined,
          recordedDate: data.recordedDate
            ? new Date(data.recordedDate)
            : undefined,
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error updating meter reading: ${error.message}`);
    }
  }

export const deleteMeterReading = async (meterReadingId) => {
    try {
      const meterReading = await prisma.meterReading.findUnique({
        where: {
          meterReading_id: meterReadingId,
        },
      });

      if (!meterReading) {
        throw new Error("Meter reading not found");
      }

      return await prisma.meterReading.delete({
        where: {
          meterReading_id: meterReadingId,
        },
      });
    } catch (error) {
      throw new Error(`Error deleting meter reading: ${error.message}`);
    }
  }

export const getLatestMeterReading = async (roomId) => {
    try {
      return await prisma.meterReading.findFirst({
        where: {
          room_id: roomId,
        },
        orderBy: {
          recordedDate: "desc",
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching latest meter reading: ${error.message}`);
    }
  }

export const getMeterReadingsByContract = async (contractId) => {
    try {
      return await prisma.meterReading.findMany({
        where: {
          contract_id: contractId,
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          contract: {
            include: {
              tenant: true,
            },
          },
        },
        orderBy: {
          recordedDate: "desc",
        },
      });
    } catch (error) {
      throw new Error(
        `Error fetching contract meter readings: ${error.message}`
      );
    }
  }