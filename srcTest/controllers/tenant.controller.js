import prisma  from '../config/prisma.js';
class TenantController {
  // Get all tenants with filtering and pagination
  async getTenants(req, res) {
    try {
      const { 
        status, 
        roomId, 
        search,
        page = 1, 
        limit = 20 
      } = req.query;

      // Build filter conditions
      const where = {};
      if (status) where.status = status;
      if (roomId) where.roomId = roomId;
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          { idNumber: { contains: search } }
        ];
      }

      // Get total count for pagination
      const total = await prisma.tenant.count({ where });

      // Get tenants with pagination
      const tenants = await prisma.tenant.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: [
          { status: 'asc' },
          { firstName: 'asc' }
        ],
        include: {
          room: {
            select: {
              roomNumber: true,
              buildingName: true
            }
          },
          contracts: {
            where: { status: 'ACTIVE' },
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
          tenants: tenants.map(tenant => ({
            ...tenant,
            activeContract: tenant.contracts[0] || null
          })),
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get single tenant details
  async getTenant(req, res) {
    try {
      const { id } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          room: true,
          contracts: {
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 12
          },
          issues: {
            orderBy: { reportDate: 'desc' },
            take: 10
          },
          checkInOuts: {
            orderBy: { date: 'desc' }
          }
        }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Get tenant details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new tenant
  async createTenant(req, res) {
    try {
      const {
        personalInfo,
        identification,
        address,
        roomId
      } = req.body;

      // Check if ID number is unique
      const existingTenant = await prisma.tenant.findFirst({
        where: { idNumber: identification.idNumber }
      });

      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: 'Tenant with this ID number already exists'
        });
      }

      // Check if room exists and is available
      if (roomId) {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            tenants: {
              where: { status: 'ACTIVE' }
            }
          }
        });

        if (!room) {
          return res.status(404).json({
            success: false,
            message: 'Room not found'
          });
        }

        if (room.tenants.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Room is already occupied'
          });
        }
      }

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phone: personalInfo.phone,
          email: personalInfo.email,
          profileImage: personalInfo.profileImage,
          idType: identification.type,
          idNumber: identification.idNumber,
          documentImage: identification.documentImage,
          village: address.village,
          city: address.city,
          district: address.district,
          roomId,
          status: 'ACTIVE'
        }
      });

      // If room is assigned, update room status
      if (roomId) {
        await prisma.room.update({
          where: { id: roomId },
          data: { status: 'OCCUPIED' }
        });
      }

      res.status(201).json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Create tenant error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update tenant
  async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if tenant exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { id }
      });

      if (!existingTenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      // If changing ID number, check it's unique
      if (updateData.idNumber && updateData.idNumber !== existingTenant.idNumber) {
        const tenantExists = await prisma.tenant.findFirst({
          where: { idNumber: updateData.idNumber }
        });

        if (tenantExists) {
          return res.status(400).json({
            success: false,
            message: 'Tenant with this ID number already exists'
          });
        }
      }

      // If changing room, validate new room
      if (updateData.roomId && updateData.roomId !== existingTenant.roomId) {
        const newRoom = await prisma.room.findUnique({
          where: { id: updateData.roomId },
          include: {
            tenants: {
              where: { status: 'ACTIVE' }
            }
          }
        });

        if (!newRoom) {
          return res.status(404).json({
            success: false,
            message: 'New room not found'
          });
        }

        if (newRoom.tenants.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'New room is already occupied'
          });
        }
      }

      // Update tenant
      const tenant = await prisma.tenant.update({
        where: { id },
        data: updateData
      });

      // Update room statuses if room changed
      if (updateData.roomId && updateData.roomId !== existingTenant.roomId) {
        // Update old room to available
        if (existingTenant.roomId) {
          await prisma.room.update({
            where: { id: existingTenant.roomId },
            data: { status: 'AVAILABLE' }
          });
        }

        // Update new room to occupied
        await prisma.room.update({
          where: { id: updateData.roomId },
          data: { status: 'OCCUPIED' }
        });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Update tenant error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete tenant (soft delete by setting status to INACTIVE)
  async deleteTenant(req, res) {
    try {
      const { id } = req.params;

      // Check if tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          contracts: {
            where: { status: 'ACTIVE' }
          }
        }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      // Check for active contracts
      if (tenant.contracts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete tenant with active contracts'
        });
      }

      // Soft delete tenant
      await prisma.tenant.update({
        where: { id },
        data: {
          status: 'INACTIVE',
          checkOutDate: new Date()
        }
      });

      // Update room status if tenant had a room
      if (tenant.roomId) {
        await prisma.room.update({
          where: { id: tenant.roomId },
          data: { status: 'AVAILABLE' }
        });
      }

      res.json({
        success: true,
        message: 'Tenant deleted successfully'
      });
    } catch (error) {
      console.error('Delete tenant error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Upload tenant documents
  async uploadDocuments(req, res) {
    try {
      const { id } = req.params;
      const files = req.files;

      if (!files) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const updateData = {};
      
      if (files.profileImage) {
        updateData.profileImage = files.profileImage[0].path;
      }
      
      if (files.documentImage) {
        updateData.documentImage = files.documentImage[0].path;
      }

      const tenant = await prisma.tenant.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Upload tenant documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new TenantController();