// import prisma from "../prisma/client.js";

// class TenantService {
//   async createTenant(tenantData) {
//     const { user_id, profile, name, phone, email, idcard, address, Census } =
//       tenantData;

//     return await prisma.tenant.create({
//       data: {
//         user_id,
//         profile,
//         name,
//         phone,
//         email,
//         idcard,
//         address,
//         Census,
//       },
//       include: {
//         user: true,
//         contracts: true,
//         problems: true,
//       },
//     });
//   }

//   async getAllTenants() {
//     return await prisma.tenant.findMany({
//       include: {
//         user: {
//           select: {
//             username: true,
//             email: true,
//             phoneNumber: true,
//             role: true,
//           },
//         },
//         contracts: {
//           where: {
//             status: "active",
//           },
//           include: {
//             room: true,
//           },
//         },
//         problems: true,
//       },
//     });
//   }

//   async getTenantById(tenantId) {
//     const tenantIdInt = parseInt(tenantId, 10);
//     return await prisma.tenant.findUnique({
//       where: {
//         tenant_id: tenantIdInt,
//       },
//       include: {
//         user: {
//           select: {
//             username: true,
//             email: true,
//             phoneNumber: true,
//             role: true,
//           },
//         },
//         contracts: {
//           include: {
//             room: true,
//             checkIn: true,
//             checkOut: true,
//             payments: true,
//             outstandingPayments: true,
//           },
//         },
//         problems: true,
//       },
//     });
//   }

//   async updateTenant(tenantId, tenantData) {
//     const tenantIdInt = parseInt(tenantId, 10);
//     const { profile, name, phone, email, idcard, address, Census } = tenantData;

//     return await prisma.tenant.update({
//       where: {
//         tenant_id: tenantIdInt,
//       },
//       data: {
//         profile,
//         name,
//         phone,
//         email,
//         idcard,
//         address,
//         Census,
//       },
//       include: {
//         user: true,
//         contracts: true,
//         problems: true,
//       },
//     });
//   }

//   async deleteTenant(tenantId) {
//     const tenantIdInt = parseInt(tenantId, 10);
//     return await prisma.$transaction(async (prisma) => {
//       // First, check if tenant has any active contracts
//       const activeContracts = await prisma.contract.findMany({
//         where: {
//           tenant_id: tenantIdInt,
//           status: "active",
//         },
//       });

//       if (activeContracts.length > 0) {
//         throw new Error("Cannot delete tenant with active contracts");
//       }

//       // Delete related Problem_notifications
//       await prisma.problem_notification.deleteMany({
//         where: { tenant_id: tenantIdInt },
//       });

//       // Delete related Contracts (this will cascade to CheckIn, CheckOut, etc.)
//       await prisma.contract.deleteMany({
//         where: { tenant_id: tenantIdInt },
//       });

//       // Finally, delete the tenant
//       return await prisma.tenant.delete({
//         where: { tenant_id: tenantIdInt },
//       });
//     });
//   }
//   async getTenantsByUserId(userId) {
//     const userIdInt = parseInt(userId, 10);
//     return await prisma.tenant.findMany({
//       where: {
//         user_id: userIdInt,
//       },
//       include: {
//         contracts: {
//           include: {
//             room: true,
//           },
//         },
//         problems: true,
//       },
//     });
//   }

//   async getTenantsByRoomId(roomId) {
//     const roomIdInt = parseInt(roomId, 10);
//     return await prisma.tenant.findMany({
//       where: {
//         contracts: {
//           some: {
//             room_id: roomIdInt,
//             status: "active",
//           },
//         },
//       },
//       include: {
//         contracts: {
//           where: {
//             room_id: roomIdInt,
//             status: "active",
//           },
//           include: {
//             room: true,
//             checkIn: true,
//           },
//         },
//       },
//     });
//   }
// }

// export default new TenantService();
