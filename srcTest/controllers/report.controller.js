import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ReportController {
  // Get revenue report
  async getRevenueReport(req, res) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;

      // Build date range filter
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      // Get payment data
      const payments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          paidDate: dateFilter
        },
        select: {
          paidDate: true,
          roomRent: true,
          waterFee: true,
          electricityFee: true,
          commonFee: true,
          totalAmount: true
        },
        orderBy: {
          paidDate: 'asc'
        }
      });

      // Group data by specified interval
      const groupedData = payments.reduce((acc, payment) => {
        const date = new Date(payment.paidDate);
        let period;

        if (groupBy === 'month') {
          period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (groupBy === 'year') {
          period = date.getFullYear().toString();
        } else {
          period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        }

        if (!acc[period]) {
          acc[period] = {
            roomRent: 0,
            utilities: 0,
            commonFee: 0,
            total: 0
          };
        }

        acc[period].roomRent += payment.roomRent;
        acc[period].utilities += (payment.waterFee + payment.electricityFee);
        acc[period].commonFee += payment.commonFee;
        acc[period].total += payment.totalAmount;

        return acc;
      }, {});

      const totalRevenue = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);

      res.json({
        success: true,
        data: {
          totalRevenue,
          breakdown: Object.entries(groupedData).map(([period, data]) => ({
            period,
            ...data
          }))
        }
      });
    } catch (error) {
      console.error('Revenue report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get occupancy report
  async getOccupancyReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Get current occupancy stats
      const [totalRooms, occupiedRooms] = await Promise.all([
        prisma.room.count(),
        prisma.room.count({
          where: { status: 'OCCUPIED' }
        })
      ]);

      // Get monthly trend
      const checkInOuts = await prisma.checkInOut.findMany({
        where: {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      // Calculate occupancy rate changes by month
      const monthlyTrend = checkInOuts.reduce((acc, record) => {
        const month = `${record.date.getFullYear()}-${(record.date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!acc[month]) {
          acc[month] = { checkIns: 0, checkOuts: 0 };
        }

        if (record.type === 'CHECK_IN') {
          acc[month].checkIns++;
        } else {
          acc[month].checkOuts++;
        }

        return acc;
      }, {});

      const occupancyRate = (occupiedRooms / totalRooms) * 100;

      res.json({
        success: true,
        data: {
          currentStats: {
            occupancyRate: Math.round(occupancyRate),
            totalRooms,
            occupiedRooms,
            availableRooms: totalRooms - occupiedRooms
          },
          monthlyTrend: Object.entries(monthlyTrend).map(([month, data]) => ({
            month,
            ...data
          }))
        }
      });
    } catch (error) {
      console.error('Occupancy report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get tenant statistics report
  async getTenantReport(req, res) {
    try {
      // Get tenant statistics
      const [
        totalTenants,
        activeTenants,
        newTenants,
        departedTenants
      ] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({
          where: { status: 'ACTIVE' }
        }),
        prisma.tenant.count({
          where: {
            checkInDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        }),
        prisma.tenant.count({
          where: {
            checkOutDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        })
      ]);

      // Get average tenancy duration
      const completedTenancies = await prisma.tenant.findMany({
        where: {
          checkInDate: { not: null },
          checkOutDate: { not: null }
        },
        select: {
          checkInDate: true,
          checkOutDate: true
        }
      });

      const avgTenancyDuration = completedTenancies.reduce((sum, tenant) => {
        const duration = tenant.checkOutDate.getTime() - tenant.checkInDate.getTime();
        return sum + duration;
      }, 0) / (completedTenancies.length || 1);

      res.json({
        success: true,
        data: {
          totalTenants,
          activeTenants,
          inactiveTenants: totalTenants - activeTenants,
          lastMonthStats: {
            newTenants,
            departedTenants
          },
          averageTenancyMonths: Math.round(avgTenancyDuration / (1000 * 60 * 60 * 24 * 30))
        }
      });
    } catch (error) {
      console.error('Tenant report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get maintenance and issue report
  async getMaintenanceReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Get issue statistics
      const issues = await prisma.issue.findMany({
        where: {
          reportDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        },
        include: {
          room: true
        }
      });

      // Calculate statistics
      const stats = {
        totalIssues: issues.length,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        totalCost: 0,
        averageResolutionTime: 0
      };

      let resolvedCount = 0;
      let totalResolutionTime = 0;

      issues.forEach(issue => {
        // Count by status
        stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;

        // Count by category
        stats.byCategory[issue.category] = (stats.byCategory[issue.category] || 0) + 1;

        // Count by priority
        stats.byPriority[issue.priority] = (stats.byPriority[issue.priority] || 0) + 1;

        // Sum repair costs
        if (issue.repairCost) {
          stats.totalCost += issue.repairCost;
        }

        // Calculate resolution time
        if (issue.resolvedDate) {
          resolvedCount++;
          totalResolutionTime += (new Date(issue.resolvedDate) - new Date(issue.reportDate));
        }
      });

      // Calculate average resolution time in days
      stats.averageResolutionTime = resolvedCount > 0
        ? Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24))
        : 0;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Maintenance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get financial summary report
  async getFinancialSummary(req, res) {
    try {
      const { year, month } = req.query;
      
      // Calculate date range
      const startDate = month
        ? new Date(year, month - 1, 1)
        : new Date(year, 0, 1);
      const endDate = month
        ? new Date(year, month, 0)
        : new Date(year, 11, 31);

      // Get all financial data
      const [payments, issues] = await Promise.all([
        prisma.payment.findMany({
          where: {
            paidDate: {
              gte: startDate,
              lte: endDate
            },
            status: 'PAID'
          }
        }),
        prisma.issue.findMany({
          where: {
            resolvedDate: {
              gte: startDate,
              lte: endDate
            },
            repairCost: { not: null }
          }
        })
      ]);

      // Calculate totals
      const revenue = payments.reduce((acc, payment) => ({
        roomRent: acc.roomRent + payment.roomRent,
        utilities: acc.utilities + (payment.waterFee + payment.electricityFee),
        commonFee: acc.commonFee + payment.commonFee,
        total: acc.total + payment.totalAmount
      }), { roomRent: 0, utilities: 0, commonFee: 0, total: 0 });

      const expenses = issues.reduce((sum, issue) => sum + (issue.repairCost || 0), 0);

      res.json({
        success: true,
        data: {
          period: {
            year,
            month: month || 'all'
          },
          revenue,
          expenses,
          netIncome: revenue.total - expenses
        }
      });
    } catch (error) {
      console.error('Financial summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new ReportController();