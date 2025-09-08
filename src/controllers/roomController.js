import {
  createRoom as _createRoom,
  getAllRooms as _getAllRooms,
  getRoomByIdOrNumber as _getRoomByIdOrNumber,
  updateRoom as _updateRoom,
  deleteRoom as _deleteRoom,
} from "../services/roomService.js";

class RoomController {
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

      const room = await _createRoom(req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: error.message });
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

      const room = await _updateRoom(req.params.id, req.body);
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
