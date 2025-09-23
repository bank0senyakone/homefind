import * as BillService from "../services/BillGenerateService.js";
import { SendSuccess, SendError } from "../services/response.js";

export default class BillController {
    static async generateMonthlyBillForRoom(req, res) {
        try {
            const { roomId } = req.params;
            const { month, year } = req.body;
            if (!month || !year) {
                return SendError(res, 400, "month and year are required in the request body.");
            }

            const result = await BillService.generateMonthlyBillForRoom({ 
                roomId: roomId, // Removed parseInt
                month, 
                year 
            });
            SendSuccess(res, "Bill generated successfully for room", result);
        } catch (error) {
            SendError(res, 500, "Error generating bill for room", error.message);
        }
    }

    static async generateMonthlyBillsForMultipleRooms(req, res) {
        try {
            const data = req.body; // { roomIds, month, year }
            if (!data.roomIds || !data.month || !data.year) {
                return SendError(res, 400, "roomIds, month, and year are required.");
            }
            const result = await BillService.generateMonthlyBillsForMultipleRooms(data);
            SendSuccess(res, "Bills generated for multiple rooms", result);
        } catch (error) {
            SendError(res, 500, "Error generating bills for multiple rooms", error.message);
        }
    }

    static async generateMonthlyBillsForAllActiveRooms(req, res) {
        try {
            const data = req.body; // { month, year }
             if (!data.month || !data.year) {
                return SendError(res, 400, "month and year are required.");
            }
            const result = await BillService.generateMonthlyBillsForAllActiveRooms(data);
            SendSuccess(res, "Bills generated for all active rooms", result);
        } catch (error) {
            SendError(res, 500, "Error generating bills for all active rooms", error.message);
        }
    }

    static async getMonthlyBillByRoom(req, res) {
        try {
            const { roomId, month, year } = req.query;
            if (!roomId || !month || !year) {
                return SendError(res, 400, "roomId, month, and year are required query parameters.");
            }
            const result = await BillService.getMonthlyBillByRoom(roomId, parseInt(month), parseInt(year)); // Removed parseInt for roomId
            SendSuccess(res, "Bill retrieved successfully", result);
        } catch (error) {
            SendError(res, 500, "Error retrieving bill", error.message);
        }
    }

    static async getMonthlyBillStatistics(req, res) {
        try {
            const { month, year } = req.query;
            if (!month || !year) {
                return SendError(res, 400, "month and year are required query parameters.");
            }
            const result = await BillService.getMonthlyBillStatistics(parseInt(month), parseInt(year));
            SendSuccess(res, "Bill statistics retrieved successfully", result);
        } catch (error) {
            SendError(res, 500, "Error retrieving bill statistics", error.message);
        }
    }
}