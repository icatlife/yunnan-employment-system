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
  if (!user || user.role.toLowerCase() !== 'enterprise' || !user.enterprise_id) {
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

        const { report_period, report_type = 'full_month', half_type, base_employment, current_employment, reduce_type_code, main_reason_code } = req.body;

        // Check if report already exists
        const existingReport = await prisma.monthlyReport.findUnique({
            where: {
                enterprise_id_report_period_report_type_half_type: {
                    enterprise_id: enterpriseId,
                    report_period: report_period,
                    report_type: report_type,
                    half_type: half_type,
                },
            },
        });

        let report;
        if (existingReport) {
            // Update existing report
            report = await prisma.monthlyReport.update({
                where: {
                    enterprise_id_report_period_report_type_half_type: {
                        enterprise_id: enterpriseId,
                        report_period: report_period,
                        report_type: report_type,
                        half_type: half_type,
                    },
                },
                data: {
                    base_employment,
                    current_employment,
                    reduce_type_code,
                    main_reason_code,
                    report_status: 'DRAFT',
                },
            });
        } else {
            // Create new report
            report = await prisma.monthlyReport.create({
                data: {
                    enterprise_id: enterpriseId,
                    report_period,
                    report_type,
                    half_type,
                    base_employment,
                    current_employment,
                    reduce_type_code,
                    main_reason_code,
                    report_status: 'DRAFT',
                },
            });
        }

        res.status(201).json({ message: '报表已保存为草稿', report });
    } catch (error) {
        console.error('Save report error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// PUT /api/enterprise/monthly-report/:id/submit - Submit a report
router.put('/monthly-report/:id/submit', async (req, res) => {
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

        const { period, report_type, half_type } = req.query;
        const whereClause = { enterprise_id: enterpriseId };

        // If period is specified, filter by period
        if (period) {
            whereClause.report_period = period;
        }
        if (report_type) {
            whereClause.report_type = report_type;
        }
        if (half_type) {
            whereClause.half_type = half_type;
        }

        const reports = await prisma.monthlyReport.findMany({
            where: whereClause,
            orderBy: { report_period: 'desc' },
        });

        res.json(reports);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// GET /api/enterprise/monthly-report/list - Get list of reports for enterprise
router.get('/monthly-report/list', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const reports = await prisma.monthlyReport.findMany({
            where: { enterprise_id: enterpriseId },
            orderBy: { report_period: 'desc' },
            include: {
                enterprise: {
                    select: {
                        name: true,
                        org_code: true
                    }
                }
            }
        });

        res.json(reports);
    } catch (error) {
        console.error('Get reports list error:', error);
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

// PUT /api/enterprise/monthly-report/:id - Update a monthly report
router.put('/monthly-report/:id', async (req, res) => {
    try {
        const enterpriseId = await getEnterpriseId(req.user.userId);
        if (!enterpriseId) {
            return res.status(403).json({ message: '无权访问此资源' });
        }

        const reportId = parseInt(req.params.id, 10);
        const { report_period, report_type, half_type, ...reportData } = req.body;

        // Check if report exists and belongs to the enterprise
        const existingReport = await prisma.monthlyReport.findUnique({
            where: { id: reportId },
        });

        if (!existingReport || existingReport.enterprise_id !== enterpriseId) {
            return res.status(404).json({ message: '未找到报表或无权操作' });
        }

        // Update the report
        const report = await prisma.monthlyReport.update({
            where: { id: reportId },
            data: {
                ...reportData,
                ...(report_type && { report_type }),
                ...(half_type !== undefined && { half_type }),
                report_status: 'DRAFT', // Always save as draft when updating
            },
        });

        res.json({ message: '报表已更新', report });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});


module.exports = router;
