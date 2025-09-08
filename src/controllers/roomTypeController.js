import {
  createRoomType as _createRoomType,
  getAllRoomTypes as _getAllRoomTypes,
  getRoomTypeById as _getRoomTypeById,
  updateRoomType as _updateRoomType,
  deleteRoomType as _deleteRoomType,
} from "../services/roomTypeService.js";

class RoomTypeController {
  async createRoomType(req, res) {
    try {
      const roomType = await _createRoomType(req.body);
      res.status(201).json(roomType);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllRoomTypes(req, res) {
    try {
      const roomTypes = await _getAllRoomTypes();
      res.json(roomTypes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRoomTypeById(req, res) {
    try {
      const roomType = await _getRoomTypeById(req.params.id);
      if (!roomType) {
        return res.status(404).json({ error: "Room type not found" });
      }
      res.json(roomType);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRoomType(req, res) {
    try {
      const roomType = await _updateRoomType(req.params.id, req.body);
      res.json(roomType);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRoomType(req, res) {
    try {
      await _deleteRoomType(req.params.id);
      res.json({ message: "Room type deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new RoomTypeController();
