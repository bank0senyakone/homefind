import prisma from '../prisma/prisma.js';
// ແກ້ແລ້ວ ຍັງແກ້ roomNumber ຫ້າມສ້ຳກັນ
export const createRoom = async (roomData) => {
    const { roomNumber, status, type, price, earnestmoney, floor, description } = roomData;

    const existingRoom = await prisma.room.findFirst({
        where: { roomNumber },
    });

    if (existingRoom) {
        throw new Error(`Room with number ${roomNumber} already exists.`);
    }

    return await prisma.room.create({
        data: {
            roomNumber,
            status,
            details: {
                create: {
                    type,
                    price,
                    earnestmoney,
                    floor,
                    description
                }
            }
        },
        include: {
            details: true
        }
    });
};

export const getAllRooms = async () => {
    return await prisma.room.findMany({
        include: {
            details: true
        }
    });
};

export const getRoomByIdOrNumber = async (searchValue) => {
    // const searchConditions = [
    //     { roomNumber: { contains: String(searchValue) } }
    // ];

    // const searchId = (searchValue);
    // if (!isNaN(searchId)) {
    //     searchConditions.push({ room_id: searchId });
    // }

    return await prisma.room.findFirst({
        where: {
           roomNumber :{
            contains: String(searchValue),
            mode:"insensitive"
           }
        },
        include: {
            details: true
        }
    });
};

export const updateRoom = async (roomId, roomData) => {
    const { roomNumber, status, type, price, earnestmoney, floor, description } = roomData;
    return await prisma.room.update({
        where: { room_id: (roomId) },
        data: {
            roomNumber,
            status,
            details: {
                update: {
                    type,
                    price,
                    earnestmoney,
                    floor,
                    description
                }
            }
        },
        include: {
            details: true
        }
    });
};

export const deleteRoom = async (roomNumber) => {
    const roomNumberStr = (roomNumber);

    const room = await prisma.room.findFirst({ where: { roomNumber: roomNumberStr } });
    if (!room) return { message: "Room not found" };


  const roomIdStr = room.room_id; 
    return await prisma.$transaction(async (prisma) => {
        // Delete related MeterReadings
        await prisma.meterReading.deleteMany({
            where: { room_id: roomIdStr },
        });
        // Delete related Problem notifications
        await prisma.problem_notification.deleteMany({
            where: { room_id: roomIdStr },
        });
        // Delete related Contracts (this will cascade to CheckIn and CheckOut)
        await prisma.contract.deleteMany({
            where: { room_id: roomIdStr },
        });
        // Delete related RoomDetails
        await prisma.roomDetails.deleteMany({
            where: { room_id: roomIdStr },
        });
        // Finally, delete the Room
        return await prisma.room.delete({
            where: { room_id: roomIdStr },
        });
    });
};
