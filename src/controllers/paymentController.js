import {
  createPayment as _createPayment,
  getPayments as _getPayments,
  getPaymentById as _getPaymentById,
  updatePayment as _updatePayment,
  deletePayment as _deletePayment,
} from "../services/paymentService.js";

const createPayment = async (req, res) => {
  try {
    const payment = await _createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const filters = req.query;
    const payments = await _getPayments(filters);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await _getPaymentById(parseInt(req.params.id));
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await _updatePayment(parseInt(req.params.id), req.body);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    await _deletePayment(parseInt(req.params.id));
    res.status(204).send("payment delete");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
