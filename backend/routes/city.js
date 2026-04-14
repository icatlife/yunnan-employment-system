const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// Helper function to verify city user based on token + db record
const getCityUser = async (authUser) => {
  if (!authUser || String(authUser.role).toLowerCase() !== 'city') {
    return { user: null, error: '仅市级用户可访问此资源' };
  }

  const userId = Number(authUser.userId);
  if (!Number.isInteger(userId)) {
    return { user: null, error: '无效的用户身份信息' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
      city: true,
      status: true,
    },
  });

  if (!user) {
    return { user: null, error: '用户不存在' };
  }
  if (user.status !== 'ENABLED') {
    return { user: null, error: '账户已禁用' };
  }
  if (String(user.role).toLowerCase() !== 'city') {
    return { user: null, error: '用户角色不是市级账号' };
  }
  if (!user.city || !user.city.trim()) {
    return { user: null, error: '市级账号未配置所属地市' };
  }

  return { user, error: null };
};

// Helper function to verify report belongs to user's city
const verifyReportOwnership = async (reportId, cityName) => {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: parseInt(reportId) },
    include: {
      enterprise: true
    }
  });

  if (!report) {
    return { valid: false, error: '报表不存在' };
  }

  if (report.enterprise.region_city !== cityName) {
    return { valid: false, error: '无权操作此报表' };
  }

  return { valid: true, report };
};

// --- City Review API ---

// GET /api/city/reports - Get reports from enterprises in the city
router.get('/reports', async (req, res) => {
  try {
    const { user, error } = await getCityUser(req.user);
    if (!user) {
      return res.status(403).json({ message: error || '无权访问此资源' });
    }

    const reports = await prisma.monthlyReport.findMany({
      where: {
        enterprise: {
          region_city: user.city
        },
        report_status: {
          in: ['CITY_PENDING', 'CITY_APPROVED', 'CITY_REJECTED']
        }
      },
      include: {
        enterprise: {
          select: {
            name: true,
            org_code: true,
            region_city: true,
            region_county: true
          }
        }
      },
      orderBy: [
        { report_period: 'desc' },
        { updated_at: 'desc' }
      ]
    });

    // Format response
    const formattedReports = reports.map(report => ({
      id: report.id,
      enterprise_name: report.enterprise.name,
      enterprise_code: report.enterprise.org_code,
      region_city: report.enterprise.region_city,
      region_county: report.enterprise.region_county,
      report_period: report.report_period,
      base_employment: report.base_employment,
      current_employment: report.current_employment,
      report_status: report.report_status,
      submitted_at: report.submitted_at,
      updated_at: report.updated_at
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error('Get city reports error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/city/reports/:id/approve - Approve a report
router.put('/reports/:id/approve', async (req, res) => {
  try {
    const { user, error } = await getCityUser(req.user);
    if (!user) {
      return res.status(403).json({ message: error || '无权访问此资源' });
    }

    const { id } = req.params;
    const ownershipCheck = await verifyReportOwnership(id, user.city);
    if (!ownershipCheck.valid) {
      return res.status(403).json({ message: ownershipCheck.error });
    }

    const report = ownershipCheck.report;

    // Update report status
    const updatedReport = await prisma.monthlyReport.update({
      where: { id: parseInt(id) },
      data: {
        report_status: 'CITY_APPROVED',
        updated_at: new Date()
      }
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        userId: user.id,
        username: user.username,
        operationType: 'CITY_APPROVE',
        targetType: 'MONTHLY_REPORT',
        targetId: parseInt(id),
        reason: null
      }
    });

    res.json({
      message: '报表审核通过',
      report: updatedReport
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/city/reports/:id/reject - Reject a report
router.put('/reports/:id/reject', async (req, res) => {
  try {
    const { user, error } = await getCityUser(req.user);
    if (!user) {
      return res.status(403).json({ message: error || '无权访问此资源' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: '退回原因不能为空' });
    }

    const ownershipCheck = await verifyReportOwnership(id, user.city);
    if (!ownershipCheck.valid) {
      return res.status(403).json({ message: ownershipCheck.error });
    }

    const report = ownershipCheck.report;

    // Update report status
    const updatedReport = await prisma.monthlyReport.update({
      where: { id: parseInt(id) },
      data: {
        report_status: 'CITY_REJECTED',
        updated_at: new Date()
      }
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        userId: user.id,
        username: user.username,
        operationType: 'CITY_REJECT',
        targetType: 'MONTHLY_REPORT',
        targetId: parseInt(id),
        reason: reason.trim()
      }
    });

    res.json({
      message: '报表审核退回',
      report: updatedReport
    });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;