import IssueService from '../services/issue.service.js';
import { EMessage, SMessage } from '../services/message.js';
import { SendCreate, SendError, SendSuccess } from '../services/response.js';

export default class IssueController {
  static async getAllIssues(req, res) {
    try {
      const issues = await IssueService.getIssues(req.query);
      if (!issues || issues.length === 0) {
        return SendError(res, 404, EMessage.NotFound, 'issues');
      }

      const responseData = {
        issues: issues.map(issue => ({
          id: issue.id,
          roomNumber: issue.room.roomNumber,
          tenantName: `${issue.tenant.firstName} ${issue.tenant.lastName}`,
          category: issue.category,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          reportDate: issue.reportDate,
        })),
      };

      return SendSuccess(res, SMessage.SelectAll, responseData);
    } catch (error) {
      console.error(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async createIssue(req, res) {
    try {
      const issue = await IssueService.createIssue(req.body);
      return SendCreate(res, SMessage.Insert, issue);
    } catch (error) {
      console.error(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async updateIssue(req, res) {
    try {
      const issueId = req.params.id;
      const updatedIssue = await IssueService.updateIssue(issueId, req.body);
      if (!updatedIssue) {
        return SendError(res, 404, EMessage.NotFound, 'issue');
      }
      return SendSuccess(res, SMessage.Update, updatedIssue);
    } catch (error) {
      console.error(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }
}
