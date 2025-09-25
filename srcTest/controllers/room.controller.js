import prisma  from '../config/prisma.js';
class RoomController {
  // Get all rooms with filtering and pagination
  async getRooms(req, res) {
    try {
      const { 
        status, 
        buildingName, 
        roomType, 
        minRent, 
        maxRent,
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Build filter conditions
      const where = {};
      if (status) where.status = status;
      if (buildingName) where.buildingName = buildingName;
      if (roomType) where.roomType = roomType;
      if (minRent || maxRent) {
        where.monthlyRent = {};
        if (minRent) where.monthlyRent.gte = parseFloat(minRent);
        if (maxRent) where.monthlyRent.lte = parseFloat(maxRent);
      }

      // Get total count for pagination
      const total = await prisma.room.count({ where });

      // Get rooms with pagination
      const rooms = await prisma.room.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: {
          roomNumber: 'asc'
        },
        include: {
          tenants: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          rooms,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get single room details
  async getRoom(req, res) {
    try {
      const { id } = req.params;

      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          tenants: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          },
          contracts: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              contractNumber: true,
              startDate: true,
              endDate: true,
              monthlyRent: true
            }
          }
        }
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Get room details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create multiple rooms
  async createRooms(req, res) {
    try {
      const {
        roomPrefix,
        roomStart,
        roomEnd,
        buildingName,
        roomType,
        pricing,
        details,
        address
      } = req.body;

      // Validate room numbers don't exist
      const existingRooms = await prisma.room.findMany({
        where: {
          roomNumber: {
            in: Array.from(
              { length: roomEnd - roomStart + 1 },
              (_, i) => `${roomPrefix}${(roomStart + i).toString().padStart(3, '0')}`
            )
          }
        }
      });

      if (existingRooms.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some room numbers already exist',
          existingRooms: existingRooms.map(r => r.roomNumber)
        });
      }

      // Create rooms in batch
      const roomsData = Array.from(
        { length: roomEnd - roomStart + 1 },
        (_, i) => ({
          roomPrefix,
          roomNumber: `${roomPrefix}${(roomStart + i).toString().padStart(3, '0')}`,
          buildingName,
          roomType,
          monthlyRent: pricing.monthlyRent,
          deposit: pricing.deposit,
          commonFee: pricing.commonFee,
          size: details.size,
          floor: details.floor,
          description: details.description,
          ...address
        })
      );

      const rooms = await prisma.room.createMany({
        data: roomsData
      });

      res.status(201).json({
        success: true,
        message: `Created ${rooms.count} rooms successfully`,
        data: {
          count: rooms.count,
          roomNumbers: roomsData.map(r => r.roomNumber)
        }
      });
    } catch (error) {
      console.error('Create rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update room
  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate room exists
      const existingRoom = await prisma.room.findUnique({
        where: { id }
      });

      if (!existingRoom) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // If changing room number, check it doesn't exist
      if (updateData.roomNumber && updateData.roomNumber !== existingRoom.roomNumber) {
        const roomExists = await prisma.room.findFirst({
          where: { roomNumber: updateData.roomNumber }
        });

        if (roomExists) {
          return res.status(400).json({
            success: false,
            message: 'Room number already exists'
          });
        }
      }

      const room = await prisma.room.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Update room error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete room
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      // Check if room has active tenants
      const room = await prisma.room.findUnique({
        where: { id },
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
          message: 'Cannot delete room with active tenants'
        });
      }

      await prisma.room.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Upload room images
  async uploadImages(req, res) {
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
      
      if (files.coverImage) {
        updateData.coverImage = files.coverImage[0].path;
      }
      
      if (files.additionalImages) {
        // Limit to 4 additional images
        updateData.additionalImages = files.additionalImages
          .slice(0, 4)
          .map(file => file.path);
      }

      const room = await prisma.room.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Upload room images error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new RoomController();