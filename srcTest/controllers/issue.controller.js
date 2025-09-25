import prisma  from '../config/prisma.js';
class IssueController {
  // Get all issues with filtering and pagination
  async getIssues(req, res) {
    try {
      const { 
        status,
        category,
        priority,
        roomId,
        tenantId,
        startDate,
        endDate,
        page = 1, 
        limit = 20 
      } = req.query;

      // Build filter conditions
      const where = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (roomId) where.roomId = roomId;
      if (tenantId) where.tenantId = tenantId;
      
      // Date range filter
      if (startDate || endDate) {
        where.reportDate = {};
        if (startDate) where.reportDate.gte = new Date(startDate);
        if (endDate) where.reportDate.lte = new Date(endDate);
      }

      // Get total counts for summary
      const [total, totalPending, totalInProgress, totalResolved, totalClosed] = await Promise.all([
        prisma.issue.count({ where }),
        prisma.issue.count({ where: { ...where, status: 'PENDING' } }),
        prisma.issue.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.issue.count({ where: { ...where, status: 'RESOLVED' } }),
        prisma.issue.count({ where: { ...where, status: 'CLOSED' } })
      ]);

      // Get issues with pagination
      const issues = await prisma.issue.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: [
          { priority: 'desc' },
          { reportDate: 'desc' }
        ],
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
          resolvedBy: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          issues,
          summary: {
            totalPending,
            totalInProgress,
            totalResolved,
            totalClosed
          },
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get single issue details
  async getIssue(req, res) {
    try {
      const { id } = req.params;

      const issue = await prisma.issue.findUnique({
        where: { id },
        include: {
          room: true,
          tenant: true,
          resolvedBy: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      console.error('Get issue details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new issue
  async createIssue(req, res) {
    try {
      const {
        roomId,
        tenantId,
        category,
        description,
        priority,
        images = []
      } = req.body;

      // Validate room and tenant
      const [room, tenant] = await Promise.all([
        prisma.room.findUnique({ where: { id: roomId } }),
        prisma.tenant.findUnique({ where: { id: tenantId } })
      ]);

      if (!room || !tenant) {
        return res.status(404).json({
          success: false,
          message: 'Room or tenant not found'
        });
      }

      // Create issue
      const issue = await prisma.issue.create({
        data: {
          roomId,
          tenantId,
          category,
          description,
          priority,
          images,
          reportDate: new Date(),
          status: 'PENDING'
        }
      });

      // Create notification for staff
      await prisma.notification.create({
        data: {
          userId: req.user.id, // Current user reporting the issue
          type: 'ISSUE',
          title: `New Issue Reported - Room ${room.roomNumber}`,
          message: `New ${priority} priority issue reported for room ${room.roomNumber}: ${category}`,
          relatedId: issue.id
        }
      });

      res.status(201).json({
        success: true,
        data: issue
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update issue status and resolution
  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const {
        status,
        priority,
        resolvedDate,
        resolutionNotes,
        repairCost
      } = req.body;

      // Validate issue exists
      const issue = await prisma.issue.findUnique({
        where: { id },
        include: {
          room: true
        }
      });

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      // Update issue
      const updateData = {
        status,
        priority: priority || issue.priority
      };

      // Add resolution details if resolving the issue
      if (status === 'RESOLVED') {
        updateData.resolvedDate = new Date(resolvedDate);
        updateData.resolvedById = req.user.id;
        updateData.resolutionNotes = resolutionNotes;
        updateData.repairCost = repairCost;
      }

      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: updateData
      });

      // Create notification for tenant
      if (status === 'RESOLVED') {
        await prisma.notification.create({
          data: {
            userId: issue.tenantId,
            type: 'ISSUE',
            title: `Issue Resolved - Room ${issue.room.roomNumber}`,
            message: `Your reported issue has been resolved: ${issue.category}`,
            relatedId: issue.id
          }
        });
      }

      res.json({
        success: true,
        data: updatedIssue
      });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete issue (only if pending and no resolution)
  async deleteIssue(req, res) {
    try {
      const { id } = req.params;

      // Check issue status
      const issue = await prisma.issue.findUnique({
        where: { id }
      });

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      if (issue.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Can only delete pending issues'
        });
      }

      await prisma.issue.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Issue deleted successfully'
      });
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Upload issue images
  async uploadImages(req, res) {
    try {
      const { id } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const issue = await prisma.issue.findUnique({
        where: { id }
      });

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      // Add new images to existing ones
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: {
          images: {
            push: files.map(file => file.path)
          }
        }
      });

      res.json({
        success: true,
        data: updatedIssue
      });
    } catch (error) {
      console.error('Upload issue images error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new IssueController();