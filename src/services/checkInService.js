import prisma from "../prisma/prisma.js";

export const createCheckIn = async (data) => {
  try {
    // First check if the contract exists and doesn't have a check-in already
    const existingContract = await prisma.contract.findUnique({
      where: {
        contract_id: data.contract_id,
      },
      include: {
        checkIn: true,
      },
    });

    if (!existingContract) {
      throw new Error("Contract not found");
    }

    if (existingContract.checkIn) {
      throw new Error("Check-in already exists for this contract");
    }

    // Create the check-in
    return await prisma.checkIn.create({
      data: {
        contract_id: data.contract_id,
        checkInDate: new Date(data.checkInDate),
        remarks: data.remarks,
      },
      include: {
        contract: {
          include: {
            room: {
              include: {
                details: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error creating check-in: ${error.message}`);
  }
};

export const getAllCheckIns = async () => {
  try {
    return await prisma.checkIn.findMany({
      include: {
        contract: {
          include: {
            room: {
              include: {
                details: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error fetching check-ins: ${error.message}`);
  }
};

export const getCheckInById = async (checkInId) => {
  try {
    return await prisma.checkIn.findUnique({
      where: {
        checkIn_id: checkInId,
      },
      include: {
        contract: {
          include: {
            room: {
              include: {
                details: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error fetching check-in: ${error.message}`);
  }
};

export const getCheckInByContractId = async (contractId) => {
  try {
    return await prisma.checkIn.findUnique({
      where: {
        contract_id: contractId,
      },
      include: {
        contract: {
          include: {
            room: {
              include: {
                details: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error fetching check-in: ${error.message}`);
  }
};

export const updateCheckIn = async (checkInId, data) => {
  try {
    return await prisma.checkIn.update({
      where: {
        checkIn_id: checkInId,
      },
      data: {
        checkInData: data.checkInData ? new Date(data.checkInData) : undefined,
        remarks: data.remarks,
      },
      include: {
        contract: {
          include: {
            room: {
              include: {
                details: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error updating check-in: ${error.message}`);
  }
};

export const deleteCheckIn = async (checkInId) => {
  try {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        checkIn_id: checkInId,
      },
      include: {
        contract: true,
      },
    });

    if (!checkIn) {
      throw new Error("Check-in not found");
    }

    return await prisma.checkIn.delete({
      where: {
        checkIn_id: checkInId,
      },
    });
  } catch (error) {
    throw new Error(`Error deleting check-in: ${error.message}`);
  }
};
