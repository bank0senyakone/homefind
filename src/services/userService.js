// import prisma from "../prisma/client.js";

// class UserService {
//   async createUser(userData) {
//     const { username, email, phoneNumber, password, role, profile } = userData;
//     return await prisma.users.create({
//       data: {
//         username,
//         email,
//         phoneNumber,
//         password,
//         role,
//         profile,
//       },
//       include: {
//         tenants: true,
//       },
//     });
//   }

//   async getAllUsers() {
//     return await prisma.users.findMany({
//       include: {
//         tenants: {
//           include: {
//             contracts: {
//               where: {
//                 status: "active",
//               },
//               include: {
//                 room: true,
//               },
//             },
//           },
//         },
//       },
//     });
//   }

//   async getUserById(userId) {
//     const userIdInt = parseInt(userId, 10);
//     return await prisma.users.findUnique({
//       where: {
//         user_id: userIdInt,
//       },
//       include: {
//         tenants: {
//           include: {
//             contracts: {
//               include: {
//                 room: true,
//                 checkIn: true,
//                 checkOut: true,
//                 payments: true,
//                 outstandingPayments: true,
//               },
//             },
//             problems: true,
//           },
//         },
//       },
//     });
//   }

//   async getUserByEmail(email) {
//     return await prisma.users.findUnique({
//       where: {
//         email: email,
//       },
//     });
//   }

//   async updateUser(userId, userData) {
//     const userIdInt = parseInt(userId, 10);
//     const { username, email, phoneNumber, password, role, profile } = userData;

//     return await prisma.users.update({
//       where: {
//         user_id: userIdInt,
//       },
//       data: {
//         username,
//         email,
//         phoneNumber,
//         password,
//         role,
//         profile,
//         updated_at: new Date(),
//       },
//       include: {
//         tenants: true,
//       },
//     });
//   }

//   async deleteUser(userId) {
//     const userIdInt = parseInt(userId, 10);

//     return await prisma.$transaction(async (prisma) => {
//       // Check if user has any tenants with active contracts
//       const userWithTenants = await prisma.users.findUnique({
//         where: { user_id: userIdInt },
//         include: {
//           tenants: {
//             include: {
//               contracts: {
//                 where: {
//                   status: "active",
//                 },
//               },
//             },
//           },
//         },
//       });

//       if (
//         userWithTenants?.tenants.some((tenant) =>
//           tenant.contracts.some((contract) => contract.status === "active")
//         )
//       ) {
//         throw new Error("Cannot delete user with active contracts");
//       }

//       // Delete all related data
//       for (const tenant of userWithTenants?.tenants || []) {
//         // Delete problem notifications
//         await prisma.problem_notification.deleteMany({
//           where: { tenant_id: tenant.tenant_id },
//         });

//         // Delete contracts and related data
//         await prisma.contract.deleteMany({
//           where: { tenant_id: tenant.tenant_id },
//         });

//         // Delete tenant
//         await prisma.tenant.delete({
//           where: { tenant_id: tenant.tenant_id },
//         });
//       }

//       // Finally delete the user
//       return await prisma.users.delete({
//         where: { user_id: userIdInt },
//       });
//     });
//   }
// }

// export default new UserService();
