import {
  createMeterReading as _createMeterReading,
  getAllMeterReadings as _getAllMeterReadings,
  getMeterReadingsByRoom as _getMeterReadingsByRoom,
  getMeterReadingById as _getMeterReadingById,
  updateMeterReading as _updateMeterReading,
  deleteMeterReading as _deleteMeterReading,
  getLatestMeterReading as _getLatestMeterReading,
} from "../services/meterReadingService.js";

class MeterReadingController {
  async createMeterReading(req, res) {
    try {
      const meterReading = await _createMeterReading(req.body);
      res.status(201).json(meterReading);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllMeterReadings(req, res) {
    try {
      const meterReadings = await _getAllMeterReadings();
      res.json(meterReadings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMeterReadingsByRoom(req, res) {
    try {
      const meterReadings = await _getMeterReadingsByRoom(req.params.roomId);
      res.json(meterReadings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMeterReadingById(req, res) {
    try {
      const meterReading = await _getMeterReadingById(req.params.id);
      if (!meterReading) {
        return res.status(404).json({ error: "Meter reading not found" });
      }
      res.json(meterReading);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMeterReading(req, res) {
    try {
      const meterReading = await _updateMeterReading(req.params.id, req.body);
      res.json(meterReading);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMeterReading(req, res) {
    try {
      await _deleteMeterReading(req.params.id);
      res.json({ message: "Meter reading deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLatestMeterReading(req, res) {
    try {
      const meterReading = await _getLatestMeterReading(req.params.roomId);
      if (!meterReading) {
        return res
          .status(404)
          .json({ error: "No meter readings found for this room" });
      }
      res.json(meterReading);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new MeterReadingController();
