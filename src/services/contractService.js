import prisma from '../prisma/prisma.js';

export const createContract = async (contractData) => {
    try {
      const { tenant_id, room_id, startDate, endDate, depositAmount, status } =
        contractData;

      // Validate required fields
      if (
        !tenant_id ||
        !room_id ||
        !startDate ||
        !endDate ||
        !depositAmount ||
        !status
      ) {
        throw new Error("Required fields missing");
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        throw new Error("End date must be after start date");
      }

      // Validate status enum
      const validStatus = ["active", "expired", "terminated"];
      if (!validStatus.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatus.join(", ")}`
        );
      }

      // Validate room availability
      const room = await prisma.room.findUnique({
        where: { room_id: room_id },
        include: {
          contracts: {
            where: {
              status: "active",
            },
          },
        },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      if (room.status !== "available" && room.contracts.length > 0) {
        throw new Error("Room is not available for new contract");
      }

      return await prisma.contract.create({
        data: {
          tenant_id: tenant_id,
          room_id: room_id,
          startDate: start,
          endDate: end,
          depositAmount: parseFloat(depositAmount),
          status: status,
        },
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
          room: {
            include: {
              details: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error creating contract: ${error.message}`);
    }
  }

export const getAllContracts = async () => {
    try {
      return await prisma.contract.findMany({
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
          room: {
            include: {
              details: true,
            },
          },
          checkIn: true,
          checkOut: true,
          meterReadings: {
            orderBy: {
              recordedDate: "desc",
            },
          },
          payments: {
            include: {
              items: true,
              slip: true,
            },
          },
          outstandingPayments: true,
        },
        orderBy: {
          startDate: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching contracts: ${error.message}`);
    }
  }

export const getContractById = async (contractId) => {
    try {
      return await prisma.contract.findUnique({
        where: {
          contract_id: contractId,
        },
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
          room: {
            include: {
              details: true,
            },
          },
          checkIn: true,
          checkOut: true,
          meterReadings: {
            orderBy: {
              recordedDate: "desc",
            },
          },
          payments: {
            include: {
              items: true,
              slip: true,
            },
          },
          outstandingPayments: true,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching contract: ${error.message}`);
    }
  }

export const updateContract = async (contractId, contractData) => {
    try {
      const { startDate, endDate, depositAmount, status } = contractData;

      // Validate status if provided
      if (status) {
        const validStatus = ["active", "expired", "terminated"];
        if (!validStatus.includes(status)) {
          throw new Error(
            `Invalid status. Must be one of: ${validStatus.join(", ")}`
          );
        }
      }

      // Validate dates if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
          throw new Error("End date must be after start date");
        }
      }

      return await prisma.contract.update({
        where: {
          contract_id: contractId,
        },
        data: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
          status,
        },
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
          room: {
            include: {
              details: true,
            },
          },
          checkIn: true,
          checkOut: true,
          meterReadings: {
            orderBy: {
              recordedDate: "desc",
            },
          },
          payments: {
            include: {
              items: true,
              slip: true,
            },
          },
          outstandingPayments: true,
        },
      });
    } catch (error) {
      throw new Error(`Error updating contract: ${error.message}`);
    }
  }

export const deleteContract = async (contractId) => {
    try {
      const contract = await prisma.contract.findUnique({
        where: {
          contract_id: contractId,
        },
        include: {
          checkIn: true,
          checkOut: true,
          meterReadings: true,
          payments: {
            include: {
              items: true,
              slip: true,
            },
          },
          outstandingPayments: true,
        },
      });

      if (!contract) {
        throw new Error("Contract not found");
      }

      // Use transaction to ensure all related data is deleted properly
      return await prisma.$transaction(async (prisma) => {
        // Delete related payment items and slips first
        for (const payment of contract.payments) {
          if (payment.slip) {
            await prisma.paymentSlip.delete({
              where: { payment_id: payment.payment_id },
            });
          }
          await prisma.paymentItem.deleteMany({
            where: { payment_id: payment.payment_id },
          });
        }

        // Delete payments
        await prisma.payment.deleteMany({
          where: { contract_id: contractId },
        });

        // Delete outstanding payments
        await prisma.outstandingPayment.deleteMany({
          where: { contract_id: contractId },
        });

        // Delete meter readings
        await prisma.meterReading.deleteMany({
          where: { contract_id: contractId },
        });

        // Delete check-in and check-out
        if (contract.checkIn) {
          await prisma.checkIn.delete({
            where: { contract_id: contractId },
          });
        }
        if (contract.checkOut) {
          // Delete checkout problems first
          await prisma.checkoutProblem.deleteMany({
            where: { checkout_id: contract.checkOut.checkOut_id },
          });
          await prisma.checkOut.delete({
            where: { contract_id: contractId },
          });
        }

        // Finally delete the contract
        return await prisma.contract.delete({
          where: { contract_id: contractId },
        });
      });
    } catch (error) {
      throw new Error(`Error deleting contract: ${error.message}`);
    }
  }

export const getActiveContractsByRoom = async (roomId) => {
    try {
      return await prisma.contract.findMany({
        where: {
          room_id: roomId,
          status: "active",
        },
        include: {
          tenant: {
            include: {
              user: true,
            },
          },
          room: {
            include: {
              details: true,
            },
          },
          checkIn: true,
          outstandingPayments: {
            where: {
              status: "unpaid",
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Error fetching active contracts: ${error.message}`);
    }
  }

export const getContractsByTenant = async (tenantId) => {
    try {
      return await prisma.contract.findMany({
        where: {
          tenant_id: tenantId,
        },
        include: {
          room: {
            include: {
              details: true,
            },
          },
          checkIn: true,
          checkOut: true,
          payments: {
            include: {
              items: true,
              slip: true,
            },
          },
          outstandingPayments: true,
        },
        orderBy: {
          startDate: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching tenant contracts: ${error.message}`);
    }
  }