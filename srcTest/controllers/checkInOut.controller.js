import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class CheckInOutController {
  // Get all check-in/out records
  async getCheckInOuts(req, res) {
    try {
      const { 
        type, 
        status,
        roomId,
        tenantId,
        startDate,
        endDate,
        page = 1, 
        limit = 20 
      } = req.query;

      // Build filter conditions
      const where = {};
      if (type) where.type = type;
      if (status) where.status = status;
      if (roomId) where.roomId = roomId;
      if (tenantId) where.tenantId = tenantId;
      
      // Date range filter
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      // Get total count for pagination
      const total = await prisma.checkInOut.count({ where });

      // Get records with pagination
      const records = await prisma.checkInOut.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: {
          date: 'desc'
        },
        include: {
          room: {
            select: {
              roomNumber: true,
              buildingName: true
            }
          },
          tenant: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          contract: {
            select: {
              contractNumber: true,
              startDate: true,
              endDate: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          records,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get check-in/out records error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Process check-in
  async checkIn(req, res) {
    try {
      const {
        roomId,
        tenantId,
        checkInDate,
        contractDetails,
        initialPayment
      } = req.body;

      // Validate room and tenant
      const [room, tenant] = await Promise.all([
        prisma.room.findUnique({
          where: { id: roomId },
          include: {
            tenants: {
              where: { status: 'ACTIVE' }
            }
          }
        }),
        prisma.tenant.findUnique({
          where: { id: tenantId }
        })
      ]);

      if (!room || !tenant) {
        return res.status(404).json({
          success: false,
          message: 'Room or tenant not found'
        });
      }

      // Check if room is available
      if (room.tenants.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Room is already occupied'
        });
      }

      // Start transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Create contract
        const contract = await prisma.contract.create({
          data: {
            contractNumber: `CNT${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0).padStart(4, '0')}`,
            roomId,
            tenantId,
            startDate: new Date(contractDetails.startDate),
            endDate: new Date(contractDetails.endDate),
            monthlyRent: contractDetails.monthlyRent,
            deposit: contractDetails.deposit,
            paymentDueDate: 5, // Default to 5th of each month
            status: 'ACTIVE',
            ownerName: contractDetails.ownerName,
            ownerIdNumber: contractDetails.ownerIdNumber,
            ownerPhone: contractDetails.ownerPhone
          }
        });

        // Create initial payment record
        const payment = await prisma.payment.create({
          data: {
            billNumber: `INV${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
            roomId,
            tenantId,
            contractId: contract.id,
            title: 'ค่ามัดจำและค่าเช่าเดือนแรก',
            dueDate: new Date(),
            status: 'PENDING',
            roomRent: initialPayment.firstMonthRent,
            commonFee: room.commonFee || 0,
            totalAmount: initialPayment.firstMonthRent + initialPayment.deposit,
            notes: 'Initial payment for check-in'
          }
        });

        // Create check-in record
        const checkIn = await prisma.checkInOut.create({
          data: {
            type: 'CHECK_IN',
            roomId,
            tenantId,
            contractId: contract.id,
            date: new Date(checkInDate),
            initialPaymentId: payment.id,
            depositPaid: false,
            status: 'PENDING'
          }
        });

        // Update room and tenant status
        await Promise.all([
          prisma.room.update({
            where: { id: roomId },
            data: { status: 'OCCUPIED' }
          }),
          prisma.tenant.update({
            where: { id: tenantId },
            data: {
              roomId,
              checkInDate: new Date(checkInDate),
              status: 'ACTIVE'
            }
          })
        ]);

        return { contract, payment, checkIn };
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Process check-out
  async checkOut(req, res) {
    try {
      const {
        roomId,
        tenantId,
        checkOutDate,
        inspection,
        damages = []
      } = req.body;

      // Validate room and tenant
      const [room, tenant, activeContract] = await Promise.all([
        prisma.room.findUnique({ where: { id: roomId } }),
        prisma.tenant.findUnique({ where: { id: tenantId } }),
        prisma.contract.findFirst({
          where: {
            roomId,
            tenantId,
            status: 'ACTIVE'
          }
        })
      ]);

      if (!room || !tenant || !activeContract) {
        return res.status(404).json({
          success: false,
          message: 'Room, tenant or active contract not found'
        });
      }

      // Calculate total damage costs
      const totalDeduction = damages.reduce((sum, damage) => sum + damage.repairCost, 0);
      const depositReturned = Math.max(0, activeContract.deposit - totalDeduction);

      // Start transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Create check-out record
        const checkOut = await prisma.checkInOut.create({
          data: {
            type: 'CHECK_OUT',
            roomId,
            tenantId,
            contractId: activeContract.id,
            date: new Date(checkOutDate),
            inspectionDate: new Date(),
            keyReturned: inspection.keyReturned,
            electricalAppliances: inspection.electricalAppliances,
            roomCleaned: inspection.roomCleaned,
            furnitureComplete: inspection.furnitureComplete,
            bedroomCondition: inspection.bedroomCondition,
            bathroomCondition: inspection.bathroomCondition,
            damages,
            totalDeduction,
            depositReturned,
            status: 'COMPLETED'
          }
        });

        // Update contract status
        await prisma.contract.update({
          where: { id: activeContract.id },
          data: { status: 'TERMINATED' }
        });

        // Update room and tenant status
        await Promise.all([
          prisma.room.update({
            where: { id: roomId },
            data: {
              status: damages.length > 0 ? 'MAINTENANCE' : 'AVAILABLE'
            }
          }),
          prisma.tenant.update({
            where: { id: tenantId },
            data: {
              status: 'INACTIVE',
              checkOutDate: new Date(checkOutDate),
              roomId: null
            }
          })
        ]);

        return checkOut;
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Check-out error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update check-in/out status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, depositPaid } = req.body;

      const record = await prisma.checkInOut.findUnique({
        where: { id }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Check-in/out record not found'
        });
      }

      // Update record
      const updatedRecord = await prisma.checkInOut.update({
        where: { id },
        data: {
          status,
          depositPaid: depositPaid !== undefined ? depositPaid : record.depositPaid
        }
      });

      res.json({
        success: true,
        data: updatedRecord
      });
    } catch (error) {
      console.error('Update check-in/out status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new CheckInOutController();