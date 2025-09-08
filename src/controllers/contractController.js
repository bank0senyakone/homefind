import {
  createContract as _createContract,
  getAllContracts as _getAllContracts,
  getContractById as _getContractById,
  updateContract as _updateContract,
  deleteContract as _deleteContract,
} from "../services/contractService.js";

class ContractController {
  async createContract(req, res) {
    try {
      const contract = await _createContract(req.body);
      res.json(contract);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllContracts(req, res) {
    try {
      const contracts = await _getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getContractById(req, res) {
    try {
      const contract = await _getContractById(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateContract(req, res) {
    try {
      const contract = await _updateContract(req.params.id, req.body);
      res.json(contract);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteContract(req, res) {
    try {
      await _deleteContract(req.params.id);
      res.json({ message: "Contract deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ContractController();
