import prisma from '../prisma/prisma.js';

export default class IssueService {
  static async getIssues(filters) {
    const { status, category, roomId, priority } = filters;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (roomId) where.roomId = roomId;
    if (priority) where.priority = priority;

    return await prisma.issue.findMany({
      where,
      include: {
        room: {
          select: {
            roomNumber: true,
          },
        },
        tenant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async createIssue(issueData) {
    const { roomId, tenantId, category, description, priority, images } = issueData;
    return await prisma.issue.create({
      data: {
        roomId,
        tenantId,
        category,
        description,
        priority,
        images,
      },
    });
  }

  static async updateIssue(issueId, issueData) {
    const { status, resolution } = issueData;
    return await prisma.issue.update({
      where: { id: issueId },
      data: {
        status,
        resolutionNotes: resolution?.notes,
        resolvedDate: resolution?.resolvedDate,
        repairCost: resolution?.cost,
      },
    });
  }
}
