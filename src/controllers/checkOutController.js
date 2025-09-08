import {
  createCheckOut as _createCheckOut,
  getAllCheckOuts as _getAllCheckOuts,
  getCheckOutById as _getCheckOutById,
  getCheckOutByContractId as _getCheckOutByContractId,
  updateCheckOut as _updateCheckOut,
  deleteCheckOut as _deleteCheckOut,
  updateProblemStatus as _updateProblemStatus,
} from "../services/checkOutService.js";

class CheckOutController {
  async createCheckOut(req, res) {
    try {
      const { contract_id, checkOutDate, remarks, problems } = req.body;

      // Validate required fields
      if (!contract_id || !checkOutDate) {
        return res.status(400).json({
          error: "Required fields: contract_id, checkOutDate",
        });
      }

      // Validate date format
      const checkOutDateObj = new Date(checkOutDate);
      if (isNaN(checkOutDateObj.getTime())) {
        return res.status(400).json({
          error: "Invalid date format for checkOutDate",
        });
      }

      // Validate problems if provided
      if (problems) {
        if (!Array.isArray(problems)) {
          return res.status(400).json({
            error: "Problems must be an array",
          });
        }

        const validStatus = ["new", "resolved", "damage"];
        for (const problem of problems) {
          if (!problem.description) {
            return res.status(400).json({
              error: "Each problem must have a description",
            });
          }
          if (problem.status && !validStatus.includes(problem.status)) {
            return res.status(400).json({
              error: `Invalid problem status. Must be one of: ${validStatus.join(
                ", "
              )}`,
            });
          }
          if (problem.damage_cost && isNaN(parseFloat(problem.damage_cost))) {
            return res.status(400).json({
              error: "Damage cost must be a number",
            });
          }
        }
      }

      const checkOut = await _createCheckOut(req.body);
      res.status(201).json({
        message: "Check-out created successfully",
        data: checkOut,
      });
    } catch (error) {
      if (error.message.includes("Contract not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("pending payments")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCheckOuts(req, res) {
    try {
      const { startDate, endDate, status } = req.query;
      let checkOuts = await _getAllCheckOuts();

      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({
            error: "Invalid date format in query parameters",
          });
        }

        checkOuts = checkOuts.filter((checkOut) => {
          const checkOutDate = new Date(checkOut.checkOutDate);
          return checkOutDate >= start && checkOutDate <= end;
        });
      }

      // Filter by problem status if provided
      if (status) {
        const validStatus = ["new", "resolved", "damage"];
        if (!validStatus.includes(status)) {
          return res.status(400).json({
            error: `Invalid status. Must be one of: ${validStatus.join(", ")}`,
          });
        }

        checkOuts = checkOuts.filter((checkOut) =>
          checkOut.problems.some((problem) => problem.status === status)
        );
      }

      res.json(checkOuts);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCheckOutById(req, res) {
    try {
      const checkOut = await _getCheckOutById(req.params.id);
      if (!checkOut) {
        return res.status(404).json({ error: "Check-out not found" });
      }
      res.json(checkOut);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCheckOutByContractId(req, res) {
    try {
      const checkOut = await _getCheckOutByContractId(req.params.contractId);
      if (!checkOut) {
        return res
          .status(404)
          .json({ error: "Check-out not found for this contract" });
      }
      res.json(checkOut);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCheckOut(req, res) {
    try {
      const { checkOutDate, remarks, problems } = req.body;

      // Validate date if provided
      if (checkOutDate) {
        const checkOutDateObj = new Date(checkOutDate);
        if (isNaN(checkOutDateObj.getTime())) {
          return res.status(400).json({
            error: "Invalid date format for checkOutDate",
          });
        }
      }

      // Validate problems if provided
      if (problems) {
        if (!Array.isArray(problems)) {
          return res.status(400).json({
            error: "Problems must be an array",
          });
        }

        const validStatus = ["new", "resolved", "damage"];
        for (const problem of problems) {
          if (!problem.description) {
            return res.status(400).json({
              error: "Each problem must have a description",
            });
          }
          if (problem.status && !validStatus.includes(problem.status)) {
            return res.status(400).json({
              error: `Invalid problem status. Must be one of: ${validStatus.join(
                ", "
              )}`,
            });
          }
          if (problem.damage_cost && isNaN(parseFloat(problem.damage_cost))) {
            return res.status(400).json({
              error: "Damage cost must be a number",
            });
          }
        }
      }

      const checkOut = await _updateCheckOut(req.params.id, req.body);
      if (!checkOut) {
        return res.status(404).json({ error: "Check-out not found" });
      }
      res.json({
        message: "Check-out updated successfully",
        data: checkOut,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCheckOut(req, res) {
    try {
      const checkOut = await _deleteCheckOut(req.params.id);
      if (!checkOut) {
        return res.status(404).json({ error: "Check-out not found" });
      }
      res.json({
        message: "Check-out deleted successfully",
        data: checkOut,
      });
    } catch (error) {
      if (error.message.includes("Cannot delete")) {
        return res
          .status(400)
          .json({ error: "Cannot delete check-out with associated records" });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async updateProblemStatus(req, res) {
    try {
      const { problemId } = req.params;
      const { status, resolution_notes, damage_cost } = req.body;

      // Validate required fields
      if (!status) {
        return res.status(400).json({
          error: "Status is required",
        });
      }

      // Validate status
      const validStatus = ["new", "resolved", "damage"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatus.join(", ")}`,
        });
      }

      // Validate damage cost if provided
      if (damage_cost && isNaN(parseFloat(damage_cost))) {
        return res.status(400).json({
          error: "Damage cost must be a number",
        });
      }

      const problem = await _updateProblemStatus(
        problemId,
        status,
        resolution_notes,
        damage_cost
      );

      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      res.json({
        message: "Problem status updated successfully",
        data: problem,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CheckOutController();
