const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// Helper function to verify province user
const getProvinceUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role.toLowerCase() !== 'province') {
    return null;
  }
  return user;
};

// --- Province Enterprise Filing API ---

// GET /api/province/pending-enterprises - Get pending enterprises for filing approval
router.get('/pending-enterprises', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const enterprises = await prisma.enterprise.findMany({
      where: {
        filing_status: 'PENDING'
      },
      orderBy: [
        { created_at: 'desc' }
      ]
    });

    res.json(enterprises);
  } catch (error) {
    console.error('Get pending enterprises error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/province/enterprises/:id/approve - Approve enterprise filing
router.put('/enterprises/:id/approve', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const enterpriseId = parseInt(req.params.id);

    // Check if enterprise exists and is pending
    const enterprise = await prisma.enterprise.findUnique({
      where: { id: enterpriseId }
    });

    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }

    if (enterprise.filing_status !== 'PENDING') {
      return res.status(400).json({ message: '企业状态不允许此操作' });
    }

    // Update enterprise status
    const updatedEnterprise = await prisma.enterprise.update({
      where: { id: enterpriseId },
      data: {
        filing_status: 'APPROVED',
        updated_at: new Date()
      }
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        user_id: req.user.userId,
        operation: 'PROVINCE_ENTERPRISE_APPROVE',
        target_type: 'ENTERPRISE',
        target_id: enterpriseId,
        description: `省审批通过企业备案：${enterprise.name}`,
        details: null
      }
    });

    res.json({
      message: '企业备案审批通过',
      enterprise: updatedEnterprise
    });
  } catch (error) {
    console.error('Approve enterprise error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/province/enterprises/:id/reject - Reject enterprise filing
router.put('/enterprises/:id/reject', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: '退回原因不能为空' });
    }

    const enterpriseId = parseInt(req.params.id);

    // Check if enterprise exists and is pending
    const enterprise = await prisma.enterprise.findUnique({
      where: { id: enterpriseId }
    });

    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }

    if (enterprise.filing_status !== 'PENDING') {
      return res.status(400).json({ message: '企业状态不允许此操作' });
    }

    // Update enterprise status
    const updatedEnterprise = await prisma.enterprise.update({
      where: { id: enterpriseId },
      data: {
        filing_status: 'REJECTED',
        updated_at: new Date()
      }
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        user_id: req.user.userId,
        operation: 'PROVINCE_ENTERPRISE_REJECT',
        target_type: 'ENTERPRISE',
        target_id: enterpriseId,
        description: `省审批退回企业备案：${enterprise.name}`,
        details: reason.trim()
      }
    });

    res.json({
      message: '企业备案审批退回',
      enterprise: updatedEnterprise
    });
  } catch (error) {
    console.error('Reject enterprise error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// --- Province Report Final Review API ---

// GET /api/province/reports - Get reports pending final review
router.get('/reports', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const reports = await prisma.monthlyReport.findMany({
      where: {
        report_status: 'CITY_APPROVED'
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
    console.error('Get province reports error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/province/reports/:id/approve - Final approve report
router.put('/reports/:id/approve', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const reportId = parseInt(req.params.id);

    // Check if report exists and is in correct status
    const report = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      include: { enterprise: true }
    });

    if (!report) {
      return res.status(404).json({ message: '报表不存在' });
    }

    if (report.report_status !== 'CITY_APPROVED') {
      return res.status(400).json({ message: '报表状态不允许此操作' });
    }

    // Update report status
    const updatedReport = await prisma.monthlyReport.update({
      where: { id: reportId },
      data: {
        report_status: 'PROVINCE_APPROVED',
        updated_at: new Date()
      }
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        user_id: req.user.userId,
        operation: 'PROVINCE_REPORT_APPROVE',
        target_type: 'MONTHLY_REPORT',
        target_id: reportId,
        description: `省终审通过报表：${report.enterprise.name} - ${report.report_period}`,
        details: null
      }
    });

    res.json({
      message: '报表终审通过',
      report: updatedReport
    });
  } catch (error) {
    console.error('Approve province report error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/province/reports/:id/reject - Final reject report
router.put('/reports/:id/reject', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: '退回原因不能为空' });
    }

    const reportId = parseInt(req.params.id);

    // Check if report exists and is in correct status
    const report = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      include: { enterprise: true }
    });

    if (!report) {
      return res.status(404).json({ message: '报表不存在' });
    }

    if (report.report_status !== 'CITY_APPROVED') {
      return res.status(400).json({ message: '报表状态不允许此操作' });
    }

    // Update report status
    const updatedReport = await prisma.monthlyReport.update({
      where: { id: reportId },
      data: {
        report_status: 'PROVINCE_REJECTED',
        updated_at: new Date()
      }
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        user_id: req.user.userId,
        operation: 'PROVINCE_REPORT_REJECT',
        target_type: 'MONTHLY_REPORT',
        target_id: reportId,
        description: `省终审退回报表：${report.enterprise.name} - ${report.report_period}`,
        details: reason.trim()
      }
    });

    res.json({
      message: '报表终审退回',
      report: updatedReport
    });
  } catch (error) {
    console.error('Reject province report error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// POST /api/province/reports/submit-to-ministry - Submit reports to ministry
router.post('/reports/submit-to-ministry', async (req, res) => {
  try {
    const user = await getProvinceUser(req.user.userId);
    if (!user) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const { report_period } = req.body;
    if (!report_period) {
      return res.status(400).json({ message: '调查期不能为空' });
    }

    // Update all PROVINCE_APPROVED reports for the period to SUBMITTED
    const result = await prisma.monthlyReport.updateMany({
      where: {
        report_period: report_period,
        report_status: 'PROVINCE_APPROVED'
      },
      data: {
        report_status: 'SUBMITTED',
        updated_at: new Date()
      }
    });

    if (result.count === 0) {
      return res.status(400).json({ message: '没有符合条件的报表可以上报' });
    }

    // Log operation
    await prisma.operationLog.create({
      data: {
        user_id: req.user.userId,
        operation: 'SUBMIT_TO_MINISTRY',
        target_type: 'REPORT_PERIOD',
        target_id: 0, // Use 0 for period-based operations
        description: `上报部委：${report_period} 调查期，共${result.count}个报表`,
        details: report_period
      }
    });

    res.json({
      message: `成功上报${result.count}个报表至部委`,
      report_period: report_period,
      submitted_count: result.count
    });
  } catch (error) {
    console.error('Submit to ministry error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;