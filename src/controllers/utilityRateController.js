import {
  createUtilityRate as _createUtilityRate,
  getAllUtilityRates as _getAllUtilityRates,
  getCurrentUtilityRate as _getCurrentUtilityRate,
  getUtilityRateById as _getUtilityRateById,
  updateUtilityRate as _updateUtilityRate,
  deleteUtilityRate as _deleteUtilityRate,
  getUtilityRateHistory as _getUtilityRateHistory,
} from "../services/utilityRateService.js";

class UtilityRateController {
  async createUtilityRate(req, res) {
    try {
      const utilityRate = await _createUtilityRate(req.body);
      res.status(201).json(utilityRate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllUtilityRates(req, res) {
    try {
      const utilityRates = await _getAllUtilityRates();
      res.json(utilityRates);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCurrentUtilityRate(req, res) {
    try {
      const utilityRate = await _getCurrentUtilityRate(req.params.type);
      if (!utilityRate) {
        return res
          .status(404)
          .json({ error: "No current utility rate found for this type" });
      }
      res.json(utilityRate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUtilityRateById(req, res) {
    try {
      const utilityRate = await _getUtilityRateById(req.params.id);
      if (!utilityRate) {
        return res.status(404).json({ error: "Utility rate not found" });
      }
      res.json(utilityRate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUtilityRate(req, res) {
    try {
      const utilityRate = await _updateUtilityRate(req.params.id, req.body);
      res.json(utilityRate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUtilityRate(req, res) {
    try {
      await _deleteUtilityRate(req.params.id);
      res.json({ message: "Utility rate deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUtilityRateHistory(req, res) {
    try {
      const { type } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Both startDate and endDate are required query parameters" 
        });
      }

      const history = await _getUtilityRateHistory(type, startDate, endDate);
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new UtilityRateController();
