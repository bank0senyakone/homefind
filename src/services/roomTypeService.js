// import prisma from '../prisma/client.js';

// class RoomTypeService {
//     async createRoomType(data) {
//         try {
//             return await prisma.roomType.create({
//                 data: {
//                     name: data.name,
//                     description: data.description
//                 }
//             });
//         } catch (error) {
//             throw new Error(`Error creating room type: ${error.message}`);
//         }
//     }

//     async getAllRoomTypes() {
//         try {
//             return await prisma.roomType.findMany({
//                 include: {
//                     rooms: true
//                 }
//             });
//         } catch (error) {
//             throw new Error(`Error fetching room types: ${error.message}`);
//         }
//     }

//     async getRoomTypeById(roomTypeId) {
//         try {
//             return await prisma.roomType.findUnique({
//                 where: { roomTypeId: parseInt(roomTypeId) },
//                 include: {
//                     rooms: true
//                 }
//             });
//         } catch (error) {
//             throw new Error(`Error fetching room type: ${error.message}`);
//         }
//     }

//     async updateRoomType(roomTypeId, data) {
//         try {
//             return await prisma.roomType.update({
//                 where: { roomTypeId: parseInt(roomTypeId) },
//                 data: {
//                     name: data.name,
//                     description: data.description
//                 }
//             });
//         } catch (error) {
//             throw new Error(`Error updating room type: ${error.message}`);
//         }
//     }

//     async deleteRoomType(roomTypeId) {
//         try {
//             return await prisma.roomType.delete({
//                 where: { roomTypeId: parseInt(roomTypeId) }
//             });
//         } catch (error) {
//             throw new Error(`Error deleting room type: ${error.message}`);
//         }
//     }
// }

// export default new RoomTypeService();
