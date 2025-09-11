import {
  createRoom as _createRoom,
  getAllRooms as _getAllRooms,
  getRoomByIdOrNumber as _getRoomByIdOrNumber,
  updateRoom as _updateRoom,
  deleteRoom as _deleteRoom,
} from "../services/roomService.js";
import upload from "../config/multer.js";

class RoomController {
  uploadImages = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]);
  
  async createRoom(req, res) {
    try {
      const {
        roomNumber,
        status,
        type,
        price,
        earnestmoney,
        floor,
        description,
      } = req.body;
      
      const coverImage = req.files?.coverImage?.[0];
      const images = req.files?.images;

      // Validate required fields
      if (
        !roomNumber ||
        !status ||
        !type ||
        !price ||
        !earnestmoney ||
        !floor
      ) {
        return res.status(400).json({
          error:
            "Required fields: roomNumber, status, type, price, earnestmoney, floor",
        });
      }

      // Validate status enum
      const validStatus = ["available", "rented", "under_maintenance"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${validStatus.join(", ")}`,
        });
      }

      // Validate numeric fields
      if (isNaN(price) || isNaN(earnestmoney) || isNaN(floor)) {
        return res.status(400).json({
          error: "Price, earnestmoney, and floor must be numeric values",
        });
      }

      console.log('Files received:', {
        coverImage: coverImage ? coverImage.path : null,
        images: images ? images.map(img => img.path) : null
      });

      // Convert string numbers to actual numbers
      const roomData = {
        ...req.body,
        price: parseFloat(req.body.price),
        earnestmoney: parseFloat(req.body.earnestmoney),
        floor: parseInt(req.body.floor),
        coverImage,
        images
      };
      
      try {
        const room = await _createRoom(roomData);
        console.log('Room created successfully:', room);
        res.status(201).json(room);
      } catch (err) {
        console.error('Error in createRoom:', err);
        res.status(400).json({ 
          error: err.message,
          stack: err.stack,
          details: 'Failed to create room with images'
        });
      }
    } catch (error) {
      console.error('Error in controller:', error);
      res.status(400).json({ 
        error: error.message,
        stack: error.stack,
        details: 'Controller error'
      });
    }
  }

  async getAllRooms(req, res) {
    try {
      const { status, type } = req.query;
      let rooms = await _getAllRooms();

      // Filter by status if provided
      if (status) {
        rooms = rooms.filter((room) => room.status === status);
      }

      // Filter by type if provided
      if (type) {
        rooms = rooms.filter((room) => room.details?.type === type);
      }

      res.json(rooms);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRoomByIdOrNumber(req, res) {
    try {
      const room = await _getRoomByIdOrNumber(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRoom(req, res) {
    try {
      const {
        roomNumber,
        status,
        type,
        price,
        earnestmoney,
        floor,
        description,
      } = req.body;

      // Validate if any field is provided
      if (
        !roomNumber &&
        !status &&
        !type &&
        !price &&
        !earnestmoney &&
        !floor &&
        !description
      ) {
        return res.status(400).json({
          error: "At least one field must be provided for update",
        });
      }

      // Validate status if provided
      if (status) {
        const validStatus = ["available", "rented", "under_maintenance"];
        if (!validStatus.includes(status)) {
          return res.status(400).json({
            error: `Status must be one of: ${validStatus.join(", ")}`,
          });
        }
      }

      // Validate numeric fields if provided
      if (
        (price && isNaN(price)) ||
        (earnestmoney && isNaN(earnestmoney)) ||
        (floor && isNaN(floor))
      ) {
        return res.status(400).json({
          error: "Price, earnestmoney, and floor must be numeric values",
        });
      }

      const coverImage = req.files?.coverImage?.[0];
      const images = req.files?.images;

      // Convert string numbers to actual numbers for update
      const roomData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        earnestmoney: req.body.earnestmoney ? parseFloat(req.body.earnestmoney) : undefined,
        floor: req.body.floor ? parseInt(req.body.floor) : undefined,
        coverImage,
        images
      };
      const room = await _updateRoom(req.params.id, roomData);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRoom(req, res) {
    try {
      // Check if room exists before deletion
      const room = await _getRoomByIdOrNumber(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Check if room has active contracts
      if (
        room.contracts &&
        room.contracts.some((contract) => contract.status === "active")
      ) {
        return res.status(400).json({
          error: "Cannot delete room with active contracts",
        });
      }

      await _deleteRoom(req.params.id);
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new RoomController();
