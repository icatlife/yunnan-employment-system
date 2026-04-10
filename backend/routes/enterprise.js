const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// Helper function to get enterpriseId from logged-in user
const getEnterpriseId = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.role !== 'enterprise' || !user.enterprise_id) {
    return null;
  }
  return user.enterprise_id;
};


// --- Profile & Filing API ---

// GET /api/enterprise/profile - Get current enterprise's profile
router.get('/profile', async (req, res) => {
  try {
    const enterpriseId = await getEnterpriseId(req.user.userId);
    if (!enterpriseId) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const enterprise = await prisma.enterprise.findUnique({
      where: { id: enterpriseId },
    });

    if (!enterprise) {
      return res.status(404).json({ message: '未找到企业信息' });
    }
    res.json(enterprise);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// PUT /api/enterprise/profile - Update enterprise's basic info
router.put('/profile', async (req, res) => {
  try {
    const enterpriseId = await getEnterpriseId(req.user.userId);
    if (!enterpriseId) {
      return res.status(403).json({ message: '无权访问此资源' });
    }

    const { org_code, ...updateData } = req.body; // org_code cannot be changed

    const updatedEnterprise = await prisma.enterprise.update({
      where: { id: enterpriseId },
      data: updateData,
    });

    res.json({ message: '企业信息更新成功', enterprise: updatedEnterprise });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// POST /api/enterprise/filing - Submit for filing
router.post('/filing', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const enterprise = await prisma.enterprise.update({
            where: { id: enterpriseId },
            data: { filing_status: 'PENDING' },
        });

        res.json({ message: '备案已提交', enterprise });
    } catch (error) {
        console.error('Filing submission error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});


// --- Monthly Report API ---

// POST /api/enterprise/monthly-report - Create/Update a monthly report (draft)
router.post('/monthly-report', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const { report_period, ...reportData } = req.body;

        // Upsert: update if exists, create if not
        const report = await prisma.monthlyReport.upsert({
            where: {
                enterprise_id_report_period: {
                    enterprise_id: enterpriseId,
                    report_period: report_period,
                },
            },
            update: {
                ...reportData,
                report_status: 'DRAFT', // Always save as draft
            },
            create: {
                ...reportData,
                report_period: report_period,
                enterprise_id: enterpriseId,
                report_status: 'DRAFT',
            },
        });

        res.status(201).json({ message: '报表已保存为草稿', report });
    } catch (error) {
        console.error('Save report error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// POST /api/enterprise/monthly-report/submit - Submit a report
router.post('/monthly-report/submit', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const { reportId } = req.body;
        if (!reportId) {
            return res.status(400).json({ message: '缺少报表ID' });
        }

        const report = await prisma.monthlyReport.findUnique({
            where: { id: reportId },
        });

        // Authorization check
        if (!report || report.enterprise_id !== enterpriseId) {
            return res.status(404).json({ message: '未找到报表或无权操作' });
        }

        // Validation check
        if (report.current_employment < report.base_employment) {
            if (!report.reduce_type_code || !report.main_reason_code) {
                return res.status(400).json({ message: '调查期就业人数小于建档期时，减少类型和主要原因必填' });
            }
        }

        const updatedReport = await prisma.monthlyReport.update({
            where: { id: reportId },
            data: { 
                report_status: 'CITY_PENDING',
                submitted_at: new Date(),
            },
        });

        res.json({ message: '报表已提交至市级审核', report: updatedReport });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// GET /api/enterprise/monthly-report - Get list of historical reports
router.get('/monthly-report', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const reports = await prisma.monthlyReport.findMany({
            where: { enterprise_id: enterpriseId },
            orderBy: { report_period: 'desc' },
        });

        res.json(reports);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// GET /api/enterprise/monthly-report/:id - Get a single report by ID
router.get('/monthly-report/:id', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const reportId = parseInt(req.params.id, 10);
        const report = await prisma.monthlyReport.findUnique({
            where: { id: reportId },
        });

        // Authorization check
        if (!report || report.enterprise_id !== enterpriseId) {
            return res.status(404).json({ message: '未找到报表或无权操作' });
        }

        res.json(report);
    } catch (error) {
        console.error('Get single report error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});


module.exports = router;
