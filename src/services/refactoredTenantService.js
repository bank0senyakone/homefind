import prisma from '../prisma/prisma.js';
export default class refactoredTenantService {
  static async selectAllTenants() {
    return await prisma.tenant.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        contracts: {
          where: {
            status: "active",
            room: {
              is: {},
            },
          },
          include: {
            room: true,
          },
        },
        problems: true,
      },
    });
  }

  static async selectTenantById(tenantId) {
    return await prisma.tenant.findUnique({
      where: {
        tenant_id: tenantId,
      },
      include: {
        user: {
          select: {
            username: true, 
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        contracts: {
          include: {
            room: true,
            checkIn: true,
            checkOut: true,
            payments: true,
            outstandingPayments: true,
          },
        },
        problems: true,
      },
    });
  }

  static async insertTenant(tenantData) {
    return await prisma.tenant.create({
      data: tenantData,
      include: {
        user: true,
        contracts: true,
        problems: true,
      },
    });
  }

  static async updateTenant(tenantId, tenantData) {
    return await prisma.tenant.update({
      where: {
        tenant_id: tenantId,
      },
      data: tenantData,
      include: {
        user: true,
        contracts: true,
        problems: true,
      },
    });
  }

  static async deleteTenant(tenantId) {
    return await prisma.$transaction(async (prisma) => {
      const activeContracts = await prisma.contract.findMany({
        where: {
          tenant_id: tenantId,
          status: "active",
        },
      });

      if (activeContracts.length > 0) {
        throw new Error("Cannot delete tenant with active contracts");
      }

      await prisma.problem_notification.deleteMany({
        where: { tenant_id: tenantId },
      });

      await prisma.contract.deleteMany({
        where: { tenant_id: tenantId },
      });

      return await prisma.tenant.delete({
        where: { tenant_id: tenantId },
      });
    });
  }

  static async selectTenantsByUserId(userId) {
    return await prisma.tenant.findMany({
      where: {
        user_id: userId,
      },
      include: {
        contracts: {
          include: {
            room: true,
          },
        },
        problems: true,
      },
    });
  }

  static async selectTenantsByRoomId(roomId) {
    return await prisma.tenant.findMany({
      where: {
        contracts: {
          some: {
            room_id: roomId,
            status: "active",
          },
        },
      },
      include: {
        contracts: {
          where: {
            room_id: roomId,
            status: "active",
          },
          include: {
            room: true,
            checkIn: true,
          },
        },
      },
    });
  }
}
