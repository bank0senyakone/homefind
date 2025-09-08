import { EMessage, SMessage } from "../services/message.js";
import { SendCreate, SendError, SendSuccess } from "../services/response.js";
import { ValidateData } from "../services/validate.js";
import refactoredTenantService from "../services/refactoredTenantService.js";

export default class TenantController {
  static async SelectAll(req, res) {
    try {
      const data = await refactoredTenantService.selectAllTenants();
      if (!data || data.length === 0) {
        return SendError(res, 404, EMessage.NotFound, "tenants");
      }
      return SendSuccess(res, SMessage.SelectAll, data);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async SelectOne(req, res) {
    try {
      const tenantId = req.params.id;
      // if (isNaN(tenantId)) {
      //   return SendError(res, 400, EMessage.BadRequest, "Invalid Tenant ID");
      // }
      const data = await refactoredTenantService.selectTenantById(tenantId);
      if (!data) {
        return SendError(res, 404, EMessage.NotFound, "tenant");
      }
      return SendSuccess(res, SMessage.SelectOne, data);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async Insert(req, res) {
    try {
      const { user_id, name, phone, email, idcard, address } = req.body;
      const validate = await ValidateData({
        user_id,
        name,
        phone,
        email,
        idcard,
        address,
      });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest, validate.join(", "));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return SendError(res, 400, EMessage.BadRequest, "Invalid email format");
      }

      const data = await refactoredTenantService.insertTenant(req.body);
      if (!data) {
        return SendError(res, 400, EMessage.ErrInsert);
      }
      return SendCreate(res, SMessage.Insert, data);
    } catch (error) {
      console.log(error);
      if (error.code === "P2002") {
        return SendError(
          res,
          400,
          EMessage.BadRequest,
          "A tenant with this email already exists"
        );
      }
      if (error.code === "P2003") {
        return SendError(
          res,
          400,
          EMessage.BadRequest,
          "Referenced user does not exist"
        );
      }
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async Update(req, res) {
    try {
      const tenantId = req.params.id;
      // if (isNaN(tenantId)) {
      //   return SendError(res, 400, EMessage.BadRequest, "Invalid Tenant ID");
      // }

      const { name, phone, email, idcard, address, profile, Census } = req.body;
      if (
        !name &&
        !phone &&
        !email &&
        !idcard &&
        !address &&
        !profile &&
        !Census
      ) {
        return SendError(
          res,
          400,
          EMessage.BadRequest,
          "At least one field must be provided for update"
        );
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return SendError(
            res,
            400,
            EMessage.BadRequest,
            "Invalid email format"
          );
        }
      }

      const data = await refactoredTenantService.updateTenant(tenantId, req.body);
      if (!data) {
        return SendError(res, 404, EMessage.ErrUpdate);
      }
      return SendSuccess(res, SMessage.Update, data);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async Delete(req, res) {
    try {
      const tenantId = req.params.id;
      // if (isNaN(tenantId)) {
      //   return SendError(res, 400, EMessage.BadRequest, "Invalid Tenant ID");
      // }

      const result = await refactoredTenantService.deleteTenant(tenantId);
      return SendSuccess(res, SMessage.Delete, result);
    } catch (error) {
      console.log(error);
      if (error.message.includes("active contracts")) {
        return SendError(
          res,
          400,
          EMessage.BadRequest,
          "Cannot delete tenant with active contracts"
        );
      }
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async SelectByUserId(req, res) {
    try {
      const userId = req.params.userId;
      // if (isNaN(userId)) {
      //   return SendError(res, 400, EMessage.BadRequest, "Invalid User ID");
      // }
      const data = await refactoredTenantService.selectTenantsByUserId(userId);
      if (!data || data.length === 0) {
        return SendError(res, 404, EMessage.NotFound, "tenants for this user");
      }
      return SendSuccess(res, SMessage.SelectBy, data);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async SelectByRoomId(req, res) {
    try {
      const roomId = req.params.roomId;
      // if (isNaN(roomId)) {
      //   return SendError(res, 400, EMessage.BadRequest, "Invalid Room ID");
      // }
      const data = await refactoredTenantService.selectTenantsByRoomId(roomId);
      if (!data || data.length === 0) {
        return SendError(res, 404, EMessage.NotFound, "tenants for this room");
      }
      return SendSuccess(res, SMessage.SelectBy, data);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }
}
