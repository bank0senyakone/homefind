import {
  createTenant as _createTenant,
  getAllTenants as _getAllTenants,
  getTenantById as _getTenantById,
  updateTenant as _updateTenant,
  deleteTenant as _deleteTenant,
  getTenantsByUserId as _getTenantsByUserId,
  getTenantsByRoomId as _getTenantsByRoomId,
} from "../services/tenantService.js";

class TenantController {
  async createTenant(req, res) {
    try {
      const { user_id, profile, name, phone, email, idcard, address, Census } =
        req.body;

      // Validate required fields
      if (!user_id || !name || !phone || !email || !idcard || !address) {
        return res.status(400).json({
          error:
            "Required fields: user_id, name, phone, email, idcard, address",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Invalid email format",
        });
      }

      const tenant = await _createTenant(req.body);
      res.status(201).json(tenant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllTenants(req, res) {
    try {
      const tenants = await _getAllTenants();
      res.json(tenants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTenantById(req, res) {
    try {
      const tenant = await _getTenantById(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTenant(req, res) {
    try {
      const { profile, name, phone, email, idcard, address, Census } = req.body;

      // Validate if any field is provided
      if (
        !name &&
        !phone &&
        !email &&
        !idcard &&
        !address &&
        !profile &&
        !Census
      ) {
        return res.status(400).json({
          error: "At least one field must be provided for update",
        });
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            error: "Invalid email format",
          });
        }
      }

      const tenant = await _updateTenant(req.params.id, req.body);
      res.json({
        message: "Tenant updated successfully",
        data: tenant,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTenant(req, res) {
    try {
      await _deleteTenant(req.params.id);
      res.json({ message: "Tenant deleted successfully" });
    } catch (error) {
      if (error.message.includes("active contracts")) {
        return res.status(400).json({
          error: "Cannot delete tenant with active contracts",
        });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async getTenantsByUserId(req, res) {
    try {
      const tenants = await _getTenantsByUserId(req.params.userId);
      res.json(tenants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTenantsByRoomId(req, res) {
    try {
      const tenants = await _getTenantsByRoomId(req.params.roomId);
      res.json(tenants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  // Helper method to format error messages
  formatError(error) {
    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return "A tenant with this email already exists";
    }
    if (error.code === "P2003") {
      return "Referenced user does not exist";
    }
    return error.message;
  }
}

export default new TenantController();
