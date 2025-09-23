import express from 'express';
import IssueController from '../controllers/issue.controller.js';

const router = express.Router();

router.get('/', IssueController.getAllIssues);
router.post('/', IssueController.createIssue);
router.put('/:id', IssueController.updateIssue);

export default router;
