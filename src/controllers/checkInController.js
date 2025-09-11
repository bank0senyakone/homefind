import {
  createCheckIn as _createCheckIn,
  getAllCheckIns as _getAllCheckIns,
  getCheckInById as _getCheckInById,
  getCheckInByContractId as _getCheckInByContractId,
  updateCheckIn as _updateCheckIn,
  deleteCheckIn as _deleteCheckIn,
} from "../services/checkInService.js";

class CheckInController {
  async createCheckIn(req, res) {
    try {
      const { contract_id, checkInDate, remarks } = req.body;

      // Validate required fields
      if (!contract_id || !checkInDate) {
        return res.status(400).json({
          error: "Required fields: contract_id, checkInData",
        });
      }

      // Validate date format
      const _checkInDate = new Date(checkInDate);
      if (isNaN(_checkInDate.getTime())) {
        return res.status(400).json({
          error: "Invalid date format for checkInData",
        });
      }

      const checkIn = await _createCheckIn(req.body);
      res.status(201).json({
        message: "Check-in created successfully",
        data: checkIn,
      });
    } catch (error) {
      if (error.message.includes("Contract not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Check-in already exists")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCheckIns(req, res) {
    try {
      const { startDate, endDate } = req.query;
      let checkIns = await _getAllCheckIns();

      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({
            error: "Invalid date format in query parameters",
          });
        }

        checkIns = checkIns.filter((checkIn) => {
          const checkInDate = new Date(checkIn.checkInData);
          return checkInDate >= start && checkInDate <= end;
        });
      }

      res.json(checkIns);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCheckInById(req, res) {
    try {
      const checkIn = await _getCheckInById(req.params.id);
      if (!checkIn) {
        return res.status(404).json({ error: "Check-in not found" });
      }
      res.json(checkIn);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCheckInByContractId(req, res) {
    try {
      const checkIn = await _getCheckInByContractId(req.params.contractId);
      if (!checkIn) {
        return res
          .status(404)
          .json({ error: "Check-in not found for this contract" });
      }
      res.json(checkIn);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCheckIn(req, res) {
    try {
      const { checkInData, remarks } = req.body;

      // Validate at least one field is provided
      if (!checkInData && !remarks) {
        return res.status(400).json({
          error: "At least one field must be provided for update",
        });
      }

      // Validate date format if provided
      if (checkInData) {
        const checkInDate = new Date(checkInData);
        if (isNaN(checkInDate.getTime())) {
          return res.status(400).json({
            error: "Invalid date format for checkInData",
          });
        }
      }

      const checkIn = await _updateCheckIn(req.params.id, req.body);
      if (!checkIn) {
        return res.status(404).json({ error: "Check-in not found" });
      }

      res.json({
        message: "Check-in updated successfully",
        data: checkIn,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCheckIn(req, res) {
    try {
      const checkIn = await _getCheckInById(req.params.id);
      if (!checkIn) {
        return res.status(404).json({ error: "Check-in not found" });
      }

      await _deleteCheckIn(req.params.id);
      res.json({ message: "Check-in deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CheckInController();
