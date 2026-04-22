import React, { useState, useEffect } from 'react';
import api from '../api';

function ReportForm() {
  const [formData, setFormData] = useState({
    period: '',
    baselineEmployment: '',
    currentEmployment: '',
    reductionType: '',
    reductionReason: ''
  });
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [existingData, setExistingData] = useState(null);

  const currentYear = 2026;
  const periods = [];
  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString().padStart(2, '0');
    if (month <= 3) {
      periods.push(`${currentYear}-${monthStr}-上旬`);
      periods.push(`${currentYear}-${monthStr}-下旬`);
    } else {
      periods.push(`${currentYear}-${monthStr}`);
    }
  }

  const formatPeriodDisplay = (period) => {
    if (period.includes('-上旬')) {
      const [year, month] = period.split('-');
      return `${year}年${parseInt(month)}月 上旬`;
    } else if (period.includes('-下旬')) {
      const [year, month] = period.split('-');
      return `${year}年${parseInt(month)}月 下旬`;
    } else {
      const [year, month] = period.split('-');
      return `${year}年${parseInt(month)}月`;
    }
  };

  const getReportParams = (period) => {
    if (period.includes('-上旬')) {
      return {
        report_period: period.split('-').slice(0, 2).join('-'),
        report_type: 'half_month',
        half_type: '上旬'
      };
    } else if (period.includes('-下旬')) {
      return {
        report_period: period.split('-').slice(0, 2).join('-'),
        report_type: 'half_month',
        half_type: '下旬'
      };
    } else {
      return {
        report_period: period,
        report_type: 'full_month',
        half_type: null
      };
    }
  };

  const reductionTypes = [
    { value: 'CLOSE_BANKRUPT', label: '关闭破产' },
    { value: 'SUSPEND_RECTIFY', label: '停业整顿' },
    { value: 'ECONOMIC_LAYOFF', label: '经济性裁员' },
    { value: 'BUSINESS_TRANSFER', label: '业务转移' },
    { value: 'NATURAL_ATTRITION', label: '自然减员' },
    { value: 'CONTRACT_TERMINATION', label: '正常解除或终止劳动合同' },
    { value: 'INTERNATIONAL_FACTOR', label: '国际因素变化影响' },
    { value: 'NATURAL_DISASTER', label: '自然灾害' },
    { value: 'MAJOR_EVENT', label: '重大事件影响' },
    { value: 'OTHER', label: '其他' }
  ];

  const reductionReasons = {
    CLOSE_BANKRUPT: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    SUSPEND_RECTIFY: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    ECONOMIC_LAYOFF: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    BUSINESS_TRANSFER: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    NATURAL_ATTRITION: [
      { value: 'RETIRE', label: '退休' },
      { value: 'RESIGN', label: '退职' },
      { value: 'DEATH', label: '死亡' },
      { value: 'NATURAL_ATTRITION_REASON', label: '自然减员' }
    ],
    CONTRACT_TERMINATION: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    INTERNATIONAL_FACTOR: [
      { value: 'INTERNATIONAL_FACTOR_REASON', label: '国际因素变化' }
    ],
    NATURAL_DISASTER: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    MAJOR_EVENT: [
      { value: 'IND_ADJUST', label: '产业结构调整' },
      { value: 'TECH_REFORM', label: '重大技术改革' },
      { value: 'ENERGY_SAVING', label: '节能减排、淘汰落后产能' },
      { value: 'ORDER_SHORT', label: '订单不足' },
      { value: 'RAW_MATERIAL_UP', label: '原材料涨价' },
      { value: 'COST_UP', label: '工资、社保等用工成本上升' },
      { value: 'FUND_DIFFICULT', label: '经营资金困难' },
      { value: 'TAX_CHANGE', label: '税收政策变化' },
      { value: 'SEASONAL', label: '季节性用工' },
      { value: 'OTHER_REASON', label: '其他' }
    ],
    OTHER: [
      { value: 'SELF_QUIT', label: '自行离职' },
      { value: 'JOB_TRANSFER', label: '工作调动、企业内部调剂' },
      { value: 'LABOR_TRANSFER', label: '劳动关系转移、劳务派遣' },
      { value: 'HIRING_DIFFICULT', label: '招不上人来' },
      { value: 'OTHER_REASON', label: '其他' }
    ]
  };

  useEffect(() => {
    if (formData.period) {
      loadExistingData(formData.period);
    }
  }, [formData.period]);

  const loadExistingData = async (period) => {
    try {
      const { report_period, report_type, half_type } = getReportParams(period);
      const params = new URLSearchParams();
      params.append('period', report_period);
      params.append('report_type', report_type);
      if (half_type !== null) {
        params.append('half_type', half_type);
      } else {
        params.append('half_type', 'null');
      }
      const response = await api.get(`/api/enterprise/monthly-report?${params.toString()}`);
      if (response.data && response.data.length > 0) {
        const report = response.data[0]; // 假设返回数组，取第一个
        setExistingData(report);
        setReportId(report.id);
        setFormData({
          period: report.report_type === 'half_month' ? `${report.report_period}-${report.half_type}` : report.report_period,
          baselineEmployment: report.base_employment?.toString() || '',
          currentEmployment: report.current_employment?.toString() || '',
          reductionType: report.reduce_type_code || '',
          reductionReason: report.main_reason_code || ''
        });
      } else {
        setExistingData(null);
        setReportId(null);
      }
    } catch (error) {
      // 如果没有数据，不显示错误
      setExistingData(null);
      setReportId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 如果改变了减少类型，清空减少原因
    if (name === 'reductionType') {
      setFormData(prev => ({
        ...prev,
        reductionType: value,
        reductionReason: ''
      }));
    }
  };

  const validateForm = () => {
    const baseline = parseInt(formData.baselineEmployment);
    const current = parseInt(formData.currentEmployment);

    if (!formData.period) {
      setMessage('请选择调查期');
      return false;
    }

    if (isNaN(baseline) || baseline < 0) {
      setMessage('建档期就业人数必须是大于等于0的数字');
      return false;
    }

    if (isNaN(current) || current < 0) {
      setMessage('调查期就业人数必须是大于等于0的数字');
      return false;
    }

    // 如果调查期就业人数小于建档期就业人数，则减少类型和减少原因必填
    if (current < baseline) {
      if (!formData.reductionType) {
        setMessage('调查期就业人数小于建档期就业人数时，减少类型为必填项');
        return false;
      }
      if (!formData.reductionReason) {
        setMessage('请选择减少原因');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const { report_period, report_type, half_type } = getReportParams(formData.period);
      const dataToSend = {
        report_period,
        report_type,
        half_type,
        base_employment: parseInt(formData.baselineEmployment),
        current_employment: parseInt(formData.currentEmployment),
        reduce_type_code: formData.reductionType || null,
        main_reason_code: formData.reductionReason || null
      };

      let response;
      if (reportId) {
        // 更新现有报表
        response = await api.put(`/api/enterprise/monthly-report/${reportId}`, dataToSend);
      } else {
        // 创建新报表
        response = await api.post('/api/enterprise/monthly-report', dataToSend);
        if (response.data && response.data.report && response.data.report.id) {
          setReportId(response.data.report.id);
        }
      }

      setMessage('数据暂存成功！');
    } catch (error) {
      setMessage('暂存失败：' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!reportId) {
      setMessage('请先暂存数据后再提交');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const { report_period, report_type, half_type } = getReportParams(formData.period);
      const dataToSend = {
        report_period,
        report_type,
        half_type,
        base_employment: parseInt(formData.baselineEmployment),
        current_employment: parseInt(formData.currentEmployment),
        reduce_type_code: formData.reductionType || null,
        main_reason_code: formData.reductionReason || null
      };

      await api.put(`/api/enterprise/monthly-report/${reportId}/submit`, dataToSend);
      setMessage('数据提交成功，等待市级审核！');
    } catch (error) {
      setMessage('提交失败：' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const showReductionFields = parseInt(formData.currentEmployment) < parseInt(formData.baselineEmployment);
  const availableReasons = formData.reductionType ? reductionReasons[formData.reductionType] || [] : [];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>月度数据填报</h2>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: message.includes('成功') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <form>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            调查期：
          </label>
          <select
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">请选择调查期</option>
            {periods.map(period => (
              <option key={period} value={period}>{formatPeriodDisplay(period)}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            建档期就业人数：
          </label>
          <input
            type="number"
            name="baselineEmployment"
            value={formData.baselineEmployment}
            onChange={handleInputChange}
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            调查期就业人数：
          </label>
          <input
            type="number"
            name="currentEmployment"
            value={formData.currentEmployment}
            onChange={handleInputChange}
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {showReductionFields && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                减少类型：
              </label>
              <select
                name="reductionType"
                value={formData.reductionType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">请选择减少类型</option>
                {reductionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {formData.reductionType && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  减少原因：
                </label>
                <select
                  name="reductionReason"
                  value={formData.reductionReason}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">请选择减少原因</option>
                  {availableReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: submitting ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? '处理中...' : '暂存'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: submitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? '处理中...' : '提交'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportForm;