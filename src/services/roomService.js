import prisma from '../prisma/prisma.js';
import cloudinary from '../config/cloudinary.js';

// ແກ້ແລ້ວ ຍັງແກ້ roomNumber ຫ້າມສ້ຳກັນ
export const createRoom = async (roomData) => {
    const { roomNumber, status, type, price, earnestmoney, floor, description, coverImage, images } = roomData;
    
    let coverImageUrl = null;
    let imageUrls = [];

    // Upload cover image
    if (coverImage) {
        try {
            const result = await cloudinary.uploader.upload(coverImage.path, {
                folder: 'rooms/covers',
                use_filename: true
            });
            coverImageUrl = result.secure_url;
        } catch (error) {
            throw new Error('Error uploading cover image to Cloudinary: ' + error.message);
        }
    }

    // Upload additional images
    if (images && images.length > 0) {
        try {
            for (const image of images) {
                const result = await cloudinary.uploader.upload(image.path, {
                    folder: 'rooms/gallery',
                    use_filename: true
                });
                imageUrls.push(result.secure_url);
            }
        } catch (error) {
            throw new Error('Error uploading additional images to Cloudinary: ' + error.message);
        }
    }

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
                    description,
                    coverImage: coverImageUrl,
                    images: imageUrls
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
    const { roomNumber, status, type, price, earnestmoney, floor, description, coverImage, images } = roomData;
    
    let coverImageUrl = undefined;
    let imageUrls = undefined;

    // Handle cover image update
    if (coverImage) {
        try {
            const existingRoom = await prisma.room.findUnique({
                where: { room_id: roomId },
                include: { details: true }
            });
            
            // Delete previous cover image if exists
            if (existingRoom.details?.coverImage) {
                const publicId = existingRoom.details.coverImage.split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy(`rooms/covers/${publicId}`);
            }
            
            // Upload new cover image
            const result = await cloudinary.uploader.upload(coverImage.path, {
                folder: 'rooms/covers',
                use_filename: true
            });
            coverImageUrl = result.secure_url;
        } catch (error) {
            throw new Error('Error handling cover image upload: ' + error.message);
        }
    }

    // Handle additional images update
    if (images && images.length > 0) {
        try {
            const existingRoom = await prisma.room.findUnique({
                where: { room_id: roomId },
                include: { details: true }
            });
            
            // Delete previous images if they exist
            if (existingRoom.details?.images && existingRoom.details.images.length > 0) {
                for (const imageUrl of existingRoom.details.images) {
                    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
                    await cloudinary.uploader.destroy(`rooms/gallery/${publicId}`);
                }
            }
            
            // Upload new images
            imageUrls = [];
            for (const image of images) {
                const result = await cloudinary.uploader.upload(image.path, {
                    folder: 'rooms/gallery',
                    use_filename: true
                });
                imageUrls.push(result.secure_url);
            }
        } catch (error) {
            throw new Error('Error handling additional images upload: ' + error.message);
        }
    }
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
                    description,
                    ...(coverImageUrl && { coverImage: coverImageUrl }),
                    ...(imageUrls && { images: imageUrls })
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
