import {
  createOutstandingPayment as _createOutstandingPayment,
  getOutstandingPayments as _getOutstandingPayments,
  getOutstandingPaymentById as _getOutstandingPaymentById,
  updateOutstandingPayment as _updateOutstandingPayment,
  deleteOutstandingPayment as _deleteOutstandingPayment,
} from "../services/outstandingPaymentService.js";

const createOutstandingPayment = async (req, res) => {
  try {
    const payment = await _createOutstandingPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOutstandingPayments = async (req, res) => {
  try {
    const filters = req.query;
    const payments = await _getOutstandingPayments(filters);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOutstandingPaymentById = async (req, res) => {
  try {
    const payment = await _getOutstandingPaymentById(parseInt(req.params.id));
    if (!payment) {
      return res.status(404).json({ error: "Outstanding payment not found" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOutstandingPayment = async (req, res) => {
  try {
    const payment = await _updateOutstandingPayment(
      parseInt(req.params.id),
      req.body
    );
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOutstandingPayment = async (req, res) => {
  try {
    await _deleteOutstandingPayment(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createOutstandingPayment,
  getOutstandingPayments,
  getOutstandingPaymentById,
  updateOutstandingPayment,
  deleteOutstandingPayment,
};
