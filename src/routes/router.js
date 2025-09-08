import express from "express";
import TenantController from "../controllers/refactoredTenantController.js";
import UserController from "../controllers/auth.controller.js";
import RoomController from "../controllers/roomController.js";
import checkInController from "../controllers/checkInController.js";
import checkOutController from "../controllers/checkOutController.js";
import contractController from "../controllers/contractController.js";
import meterReadingController from "../controllers/meterReadingController.js";
import outstandingPaymentController from "../controllers/outstandingPaymentController.js"
import paymentController from "../controllers/paymentController.js";
import utilityRateController from "../controllers/utilityRateController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

const tenant = "/tenant";
router.get(`${tenant}/selAll`, TenantController.SelectAll);
router.get(`${tenant}/selOne/:id`, TenantController.SelectOne);
router.post(`${tenant}/insert`, TenantController.Insert);
router.put(`${tenant}/update/:id`, TenantController.Update);
router.delete(`${tenant}/delete/:id`, TenantController.Delete);
router.get(`${tenant}/selByUserId/:userId`, TenantController.SelectByUserId);
router.get(`${tenant}/selByRoomId/:roomId`, TenantController.SelectByRoomId);
//user
const user = "/user";
router.post(`${user}/login`, UserController.login)
router.post(`${user}/login-username`, UserController.loginWithUsername)
router.post(`${user}/refresh-token`, UserController.refreshToken)
router.post(`${user}/forgot-password`,UserController.forgotPassword)
router.post(`${user}/reset-password`, UserController.resetPassword);
router.post(`${user}/register`,UserController.register);
router.put(`${user}/profile`, auth, UserController.updateProfile);
router.get(`${user}/users`, auth, UserController.getAllUsers);
router.delete(`${user}/users/:id`, UserController.deleteUser);
// room
const room = "/room";
router.get(`${room}/selAll`,RoomController.getAllRooms);
router.post(`${room}/insert`,RoomController.createRoom);
router.get(`${room}/selOne/:id`,RoomController.getRoomByIdOrNumber);
router.put(`${room}/update/:id`,RoomController.updateRoom);
router.delete(`${room}/delete/:id`,RoomController.deleteRoom);
// checkin
const checkin = "/checkin"
router.get(`${checkin}/selAll`, checkInController.getAllCheckIns);
router.get(`${checkin}/contract/:contractId`, checkInController.getCheckInByContractId);
router.get(`${checkin}/selOne/:id`, checkInController.getCheckInById);
router.post(`${checkin}/insert`, checkInController.createCheckIn);
router.put(`${checkin}/update/:id`, checkInController.updateCheckIn);
router.delete(`${checkin}/delete/:id`, checkInController.deleteCheckIn);
// checkout
const checkout = "/checkout"
router.post(`${checkout}/insert`, checkOutController.createCheckOut);
router.get(`${checkout}/selAll`, checkOutController.getAllCheckOuts);
router.get(`${checkout}/selOne/:id`, checkOutController.getCheckOutById);
router.get(`${checkout}/contract/:contractId`, checkOutController.getCheckOutByContractId);
router.put(`${checkout}/update/:id`, checkOutController.updateCheckOut);
router.delete(`${checkout}/delete/:id`, checkOutController.deleteCheckOut);
router.patch(`${checkout}/problems/:problemId`, checkOutController.updateProblemStatus);
// contract
const contract  = "/contract"
router.post(`${contract}/insert`, contractController.createContract);
router.get(`${contract}/selAll`, contractController.getAllContracts);
router.get(`${contract}/selOne/:id`,contractController.getContractById);
router.put(`${contract}/update/:id`,contractController.updateContract);
router.delete(`${contract}/delete/:id`,contractController.deleteContract);
// meterReading
const meterReading = "/meterReading"
router.post(`${meterReading}/insert`, meterReadingController.createMeterReading);
router.get(`${meterReading}/selAll`, meterReadingController.getAllMeterReadings);
router.get(`${meterReading}/room/:roomId`, meterReadingController.getMeterReadingsByRoom);
router.get(`${meterReading}/room/:roomId/latest`, meterReadingController.getLatestMeterReading);
router.get(`${meterReading}/selOne/:id`, meterReadingController.getMeterReadingById);
router.put(`${meterReading}/update/:id`, meterReadingController.updateMeterReading);
router.delete(`${meterReading}/delete/:id`, meterReadingController.deleteMeterReading);
// outstandingPay
const outstandingPay = "/outstandingPay"
router.post(`${outstandingPay}/insert`,outstandingPaymentController.createOutstandingPayment );
router.get(`${outstandingPay}/selAll`,outstandingPaymentController.getOutstandingPayments );
router.get(`${outstandingPay}/selOne/:id`,outstandingPaymentController.getOutstandingPaymentById );
router.put(`${outstandingPay}/update/:id`,outstandingPaymentController.updateOutstandingPayment );
router.delete(`${outstandingPay}/delete/:id`,outstandingPaymentController.deleteOutstandingPayment );
// payment
const payment = "/payment"
router.post(`${payment}/insert`,paymentController.createPayment );
router.get(`${payment}/selAll`,paymentController.getPayments );
router.get(`${payment}/selOne/:id`,paymentController.getPaymentById );
router.put(`${payment}/update/:id`,paymentController.updatePayment );
router.delete(`${payment}/delete/:id`,paymentController.deletePayment );
// utilityRate
const utilityRate = "/utilityRate"
router.post(`${utilityRate}/insert`,utilityRateController.createUtilityRate );
router.get(`${utilityRate}/selAll`,utilityRateController.getAllUtilityRates );
router.get(`${utilityRate}/current/:type`,utilityRateController.getCurrentUtilityRate );
router.get(`${utilityRate}/selOne/:id`,utilityRateController.getUtilityRateById );
router.put(`${utilityRate}/update/:id`,utilityRateController.updateUtilityRate );
router.delete(`${utilityRate}/delete/:id`,utilityRateController.deleteUtilityRate );

export default router;
