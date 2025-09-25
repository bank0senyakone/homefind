import prisma  from '../config/prisma.js';
class DashboardController {
  async getSummary(req, res) {
    try {
      // Get total counts
      const [
        totalTenants,
        totalRooms,
        occupiedRooms,
        availableRooms,
        overduePayments,
        depositPaidRooms
      ] = await Promise.all([
        // Total tenants
        prisma.tenant.count({
          where: { status: 'ACTIVE' }
        }),
        // Total rooms
        prisma.room.count(),
        // Occupied rooms
        prisma.room.count({
          where: { status: 'OCCUPIED' }
        }),
        // Available rooms
        prisma.room.count({
          where: { status: 'AVAILABLE' }
        }),
        // Overdue payments
        prisma.payment.count({
          where: { status: 'OVERDUE' }
        }),
        // Rooms with deposit paid
        prisma.checkInOut.count({
          where: {
            type: 'CHECK_IN',
            depositPaid: true,
            status: 'COMPLETED'
          }
        })
      ]);

      // Get monthly revenue for the past 12 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      
      const monthlyRevenue = await prisma.payment.groupBy({
        by: ['paidDate'],
        where: {
          status: 'PAID',
          paidDate: {
            gte: startDate
          }
        },
        _sum: {
          totalAmount: true
        }
      });

      // Get recent check in/out activities
      const recentCheckInOut = await prisma.checkInOut.findMany({
        take: 5,
        orderBy: {
          date: 'desc'
        },
        include: {
          room: true,
          tenant: true
        }
      });

      // Get recent issues
      const recentIssues = await prisma.issue.findMany({
        take: 5,
        orderBy: {
          reportDate: 'desc'
        },
        include: {
          room: true,
          tenant: true
        }
      });

      // Format the response
      const summary = {
        success: true,
        data: {
          totalTenants,
          totalRooms,
          occupiedRooms,
          availableRooms,
          overdueRooms: overduePayments,
          depositPaidRooms,
          monthlyRevenue: monthlyRevenue.map(mr => ({
            month: mr.paidDate,
            amount: mr._sum.totalAmount
          })),
          recentCheckInOut: recentCheckInOut.map(cio => ({
            type: cio.type,
            roomNumber: cio.room.roomNumber,
            tenantName: `${cio.tenant.firstName} ${cio.tenant.lastName}`,
            date: cio.date
          })),
          recentIssues: recentIssues.map(issue => ({
            id: issue.id,
            category: issue.category,
            roomNumber: issue.room.roomNumber,
            tenantName: `${issue.tenant.firstName} ${issue.tenant.lastName}`,
            status: issue.status,
            priority: issue.priority,
            reportDate: issue.reportDate
          }))
        }
      };

      res.json(summary);
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get occupancy statistics
  async getOccupancyStats(req, res) {
    try {
      const totalRooms = await prisma.room.count();
      const occupiedRooms = await prisma.room.count({
        where: { status: 'OCCUPIED' }
      });

      const occupancyRate = totalRooms > 0 
        ? Math.round((occupiedRooms / totalRooms) * 100) 
        : 0;

      // Get monthly trend for the past 6 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5);
      
      const monthlyStats = await prisma.room.groupBy({
        by: ['status'],
        where: {
          status: 'OCCUPIED',
          updatedAt: {
            gte: startDate
          }
        },
        _count: true,
        orderBy: {
          updatedAt: 'asc'
        }
      });

      res.json({
        success: true,
        data: {
          occupancyRate,
          totalRooms,
          occupiedRooms,
          availableRooms: totalRooms - occupiedRooms,
          monthlyTrend: monthlyStats.map(stat => ({
            month: stat.updatedAt,
            rate: Math.round((stat._count / totalRooms) * 100)
          }))
        }
      });
    } catch (error) {
      console.error('Get occupancy stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get revenue statistics
  async getRevenueStats(req, res) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;

      const where = {
        status: 'PAID'
      };

      if (startDate) {
        where.paidDate = {
          gte: new Date(startDate)
        };
      }

      if (endDate) {
        where.paidDate = {
          ...where.paidDate,
          lte: new Date(endDate)
        };
      }

      const revenue = await prisma.payment.groupBy({
        by: ['paidDate'],
        where,
        _sum: {
          roomRent: true,
          waterFee: true,
          electricityFee: true,
          commonFee: true,
          totalAmount: true
        }
      });

      res.json({
        success: true,
        data: {
          totalRevenue: revenue.reduce((acc, curr) => acc + curr._sum.totalAmount, 0),
          breakdown: revenue.map(rev => ({
            period: rev.paidDate,
            roomRent: rev._sum.roomRent,
            utilities: rev._sum.waterFee + rev._sum.electricityFee,
            commonFee: rev._sum.commonFee,
            total: rev._sum.totalAmount
          }))
        }
      });
    } catch (error) {
      console.error('Get revenue stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new DashboardController();