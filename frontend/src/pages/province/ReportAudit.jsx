import React, { useState, useEffect } from 'react';
import api from '../../api';

function ReportAudit() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [submitPeriod, setSubmitPeriod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 减少类型映射
  const reduceTypeMap = {
    'CLOSE_BANKRUPT': '关闭破产',
    'SUSPEND_RECTIFY': '停业整顿',
    'ECONOMIC_LAYOFF': '经济性裁员',
    'BUSINESS_TRANSFER': '业务转移',
    'NATURAL_ATTRITION': '自然减员',
    'CONTRACT_TERMINATION': '正常解除或终止劳动合同',
    'INTERNATIONAL_FACTOR': '国际因素变化影响',
    'NATURAL_DISASTER': '自然灾害',
    'MAJOR_EVENT': '重大事件影响',
    'OTHER': '其他'
  };

  // 减少原因映射
  const reduceReasonMap = {
    'IND_ADJUST': '产业结构调整',
    'TECH_REFORM': '重大技术改革',
    'ENERGY_SAVING': '节能减排、淘汰落后产能',
    'ORDER_SHORT': '订单不足',
    'RAW_MATERIAL_UP': '原材料涨价',
    'COST_UP': '工资、社保等用工成本上升',
    'FUND_DIFFICULT': '经营资金困难',
    'TAX_CHANGE': '税收政策变化',
    'SEASONAL': '季节性用工',
    'OTHER_REASON': '其他',
    'INTERNATIONAL_FACTOR_REASON': '国际因素变化',
    'SELF_QUIT': '自行离职',
    'JOB_TRANSFER': '工作调动、企业内部调剂',
    'LABOR_TRANSFER': '劳动关系转移、劳务派遣',
    'HIRING_DIFFICULT': '招不上人来',
    'RETIRE': '退休',
    'RESIGN': '退职',
    'DEATH': '死亡',
    'NATURAL_ATTRITION_REASON': '自然减员'
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/province/reports');
      setReports(response.data);
      setMessage('');
    } catch (error) {
      setMessage('获取待终审报表列表失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getReduceTypeText = (code) => {
    return reduceTypeMap[code] || code;
  };

  const getReduceReasonText = (code) => {
    return reduceReasonMap[code] || code;
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleApprove = async (reportId) => {
    try {
      setProcessingId(reportId);
      await api.put(`/api/province/reports/${reportId}/approve`);
      setMessage('报表已终审通过');
      fetchReports(); // 刷新列表
    } catch (error) {
      setMessage('批准失败：' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setMessage('请填写退回原因');
      return;
    }

    try {
      setProcessingId(selectedReport.id);
      await api.put(`/api/province/reports/${selectedReport.id}/reject`, {
        reason: rejectReason.trim()
      });
      setMessage('报表已终审退回');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedReport(null);
      fetchReports(); // 刷新列表
    } catch (error) {
      setMessage('退回失败：' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedReport(null);
  };

  const handleSubmitToMinistry = async () => {
    if (!submitPeriod) {
      setMessage('请选择调查期');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/api/province/reports/submit-to-ministry', {
        report_period: submitPeriod
      });
      setMessage(`成功上报${response.data.submitted_count}个报表至部委`);
      setSubmitPeriod('');
      fetchReports(); // 刷新列表
    } catch (error) {
      setMessage('上报失败：' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>报表终审</h2>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: message.includes('成功') || message.includes('已') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') || message.includes('已') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('成功') || message.includes('已') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* 上报部委区域 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>上报部委</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>调查期：</label>
            <input
              type="month"
              value={submitPeriod}
              onChange={(e) => setSubmitPeriod(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={handleSubmitToMinistry}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              backgroundColor: submitting ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (!submitting) e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              if (!submitting) e.target.style.backgroundColor = '#007bff';
            }}
          >
            {submitting ? '上报中...' : '上报部委'}
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p>暂无待终审报表</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>企业名称</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>所属地市</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>调查期</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>建档期就业人数</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>调查期就业人数</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{report.enterprise_name}</td>
                  <td style={{ padding: '12px' }}>{report.region_city}</td>
                  <td style={{ padding: '12px' }}>{report.report_period}</td>
                  <td style={{ padding: '12px' }}>{report.base_employment}</td>
                  <td style={{ padding: '12px' }}>{report.current_employment}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleViewDetails(report)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                      >
                        查看详情
                      </button>
                      <button
                        onClick={() => handleApprove(report.id)}
                        disabled={processingId === report.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: processingId === report.id ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processingId === report.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => {
                          if (processingId !== report.id) e.target.style.backgroundColor = '#1e7e34';
                        }}
                        onMouseOut={(e) => {
                          if (processingId !== report.id) e.target.style.backgroundColor = '#28a745';
                        }}
                      >
                        {processingId === report.id ? '处理中...' : '通过'}
                      </button>
                      <button
                        onClick={() => handleReject(report)}
                        disabled={processingId === report.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: processingId === report.id ? '#6c757d' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processingId === report.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => {
                          if (processingId !== report.id) e.target.style.backgroundColor = '#c82333';
                        }}
                        onMouseOut={(e) => {
                          if (processingId !== report.id) e.target.style.backgroundColor = '#dc3545';
                        }}
                      >
                        {processingId === report.id ? '处理中...' : '退回'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 详情弹窗 */}
      {showModal && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>报表详情</h3>

            <div style={{ marginBottom: '15px' }}>
              <strong>企业名称：</strong> {selectedReport.enterprise_name}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>所属地市：</strong> {selectedReport.region_city}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>调查期：</strong> {selectedReport.report_period}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>建档期就业人数：</strong> {selectedReport.base_employment}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>调查期就业人数：</strong> {selectedReport.current_employment}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>报表状态：</strong>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#17a2b8',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                待省终审
              </span>
            </div>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退回原因弹窗 */}
      {showRejectModal && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>退回报表</h3>

            <div style={{ marginBottom: '15px' }}>
              <strong>企业名称：</strong> {selectedReport.enterprise_name}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>调查期：</strong> {selectedReport.report_period}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                退回原因：<span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请填写退回原因..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                disabled={processingId === selectedReport.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: processingId === selectedReport.id ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processingId === selectedReport.id ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (processingId !== selectedReport.id) e.target.style.backgroundColor = '#c82333';
                }}
                onMouseOut={(e) => {
                  if (processingId !== selectedReport.id) e.target.style.backgroundColor = '#dc3545';
                }}
              >
                {processingId === selectedReport.id ? '处理中...' : '确认退回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportAudit;