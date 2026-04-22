import React, { useState, useEffect } from 'react';
import api from '../api';

function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/enterprise/monthly-report/list');
      setReports(response.data);
    } catch (error) {
      setMessage('获取报表列表失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'DRAFT': '草稿',
      'CITY_PENDING': '待市审',
      'CITY_APPROVED': '市通过',
      'CITY_REJECTED': '市退回',
      'PROVINCE_APPROVED': '省通过',
      'PROVINCE_REJECTED': '省退回',
      'SUBMITTED': '已上报'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'DRAFT': '#6c757d',
      'CITY_PENDING': '#ffc107',
      'CITY_APPROVED': '#28a745',
      'CITY_REJECTED': '#dc3545',
      'PROVINCE_APPROVED': '#007bff',
      'PROVINCE_REJECTED': '#dc3545',
      'SUBMITTED': '#17a2b8'
    };
    return colorMap[status] || '#6c757d';
  };

  const getReduceTypeText = (code) => {
    return reduceTypeMap[code] || code;
  };

  const getReduceReasonText = (code) => {
    return reduceReasonMap[code] || code;
  };

  const formatPeriodDisplay = (report) => {
    const [year, month] = report.report_period.split('-');
    if (report.report_type === 'half_month') {
      return `${year}年${parseInt(month)}月 ${report.half_type}`;
    } else {
      return `${year}年${parseInt(month)}月`;
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>月度数据查询</h2>

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

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p>暂无月度报表数据</p>
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>调查期</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>建档期就业人数</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>调查期就业人数</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>报表状态</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{formatPeriodDisplay(report)}</td>
                  <td style={{ padding: '12px' }}>{report.base_employment}</td>
                  <td style={{ padding: '12px' }}>{report.current_employment}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getStatusColor(report.report_status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(report.report_status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
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
              <strong>调查期：</strong> {formatPeriodDisplay(selectedReport)}
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
                backgroundColor: getStatusColor(selectedReport.report_status),
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {getStatusText(selectedReport.report_status)}
              </span>
            </div>

            {selectedReport.reduce_type_code && (
              <div style={{ marginBottom: '15px' }}>
                <strong>减少类型：</strong> {getReduceTypeText(selectedReport.reduce_type_code)}
              </div>
            )}

            {selectedReport.main_reason_code && (
              <div style={{ marginBottom: '15px' }}>
                <strong>主要减少原因：</strong> {getReduceReasonText(selectedReport.main_reason_code)}
              </div>
            )}

            {selectedReport.main_reason_desc && (
              <div style={{ marginBottom: '15px' }}>
                <strong>主要减少原因描述：</strong> {selectedReport.main_reason_desc}
              </div>
            )}

            {selectedReport.second_reason_code && (
              <div style={{ marginBottom: '15px' }}>
                <strong>次要减少原因：</strong> {getReduceReasonText(selectedReport.second_reason_code)}
              </div>
            )}

            {selectedReport.second_reason_desc && (
              <div style={{ marginBottom: '15px' }}>
                <strong>次要减少原因描述：</strong> {selectedReport.second_reason_desc}
              </div>
            )}

            {selectedReport.third_reason_code && (
              <div style={{ marginBottom: '15px' }}>
                <strong>第三减少原因：</strong> {getReduceReasonText(selectedReport.third_reason_code)}
              </div>
            )}

            {selectedReport.third_reason_desc && (
              <div style={{ marginBottom: '15px' }}>
                <strong>第三减少原因描述：</strong> {selectedReport.third_reason_desc}
              </div>
            )}

            {selectedReport.other_reason && (
              <div style={{ marginBottom: '15px' }}>
                <strong>其他原因：</strong> {selectedReport.other_reason}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong>创建时间：</strong> {new Date(selectedReport.created_at).toLocaleString('zh-CN')}
            </div>

            {selectedReport.submitted_at && (
              <div style={{ marginBottom: '15px' }}>
                <strong>提交时间：</strong> {new Date(selectedReport.submitted_at).toLocaleString('zh-CN')}
              </div>
            )}

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
    </div>
  );
}

export default ReportList;