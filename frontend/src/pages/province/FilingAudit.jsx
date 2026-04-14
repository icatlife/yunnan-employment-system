import React, { useState, useEffect } from 'react';
import api from '../../api';

function FilingAudit() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchEnterprises();
  }, []);

  const fetchEnterprises = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/province/pending-enterprises');
      setEnterprises(response.data);
      setMessage('');
    } catch (error) {
      setMessage('获取待备案企业列表失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enterpriseId) => {
    try {
      setProcessingId(enterpriseId);
      await api.put(`/api/province/enterprises/${enterpriseId}/approve`);
      setMessage('企业备案已通过');
      fetchEnterprises(); // 刷新列表
    } catch (error) {
      setMessage('批准失败：' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (enterprise) => {
    setSelectedEnterprise(enterprise);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setMessage('请填写退回原因');
      return;
    }

    try {
      setProcessingId(selectedEnterprise.id);
      await api.put(`/api/province/enterprises/${selectedEnterprise.id}/reject`, {
        reason: rejectReason.trim()
      });
      setMessage('企业备案已退回');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedEnterprise(null);
      fetchEnterprises(); // 刷新列表
    } catch (error) {
      setMessage('退回失败：' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedEnterprise(null);
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
      <h2 style={{ marginBottom: '30px', color: '#333' }}>企业备案审批</h2>

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

      {enterprises.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p>暂无待备案企业</p>
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>组织机构代码</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>所属地市</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>所属区县</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>联系人</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>联系电话</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {enterprises.map((enterprise) => (
                <tr key={enterprise.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{enterprise.name}</td>
                  <td style={{ padding: '12px' }}>{enterprise.org_code}</td>
                  <td style={{ padding: '12px' }}>{enterprise.region_city}</td>
                  <td style={{ padding: '12px' }}>{enterprise.region_county}</td>
                  <td style={{ padding: '12px' }}>{enterprise.contact_person}</td>
                  <td style={{ padding: '12px' }}>{enterprise.contact_phone}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(enterprise.id)}
                        disabled={processingId === enterprise.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: processingId === enterprise.id ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processingId === enterprise.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => {
                          if (processingId !== enterprise.id) e.target.style.backgroundColor = '#1e7e34';
                        }}
                        onMouseOut={(e) => {
                          if (processingId !== enterprise.id) e.target.style.backgroundColor = '#28a745';
                        }}
                      >
                        {processingId === enterprise.id ? '处理中...' : '通过'}
                      </button>
                      <button
                        onClick={() => handleReject(enterprise)}
                        disabled={processingId === enterprise.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: processingId === enterprise.id ? '#6c757d' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processingId === enterprise.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => {
                          if (processingId !== enterprise.id) e.target.style.backgroundColor = '#c82333';
                        }}
                        onMouseOut={(e) => {
                          if (processingId !== enterprise.id) e.target.style.backgroundColor = '#dc3545';
                        }}
                      >
                        {processingId === enterprise.id ? '处理中...' : '退回'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 退回原因弹窗 */}
      {showRejectModal && selectedEnterprise && (
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
            <h3 style={{ marginBottom: '20px', color: '#333' }}>退回企业备案</h3>

            <div style={{ marginBottom: '15px' }}>
              <strong>企业名称：</strong> {selectedEnterprise.name}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>组织机构代码：</strong> {selectedEnterprise.org_code}
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
                disabled={processingId === selectedEnterprise.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: processingId === selectedEnterprise.id ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processingId === selectedEnterprise.id ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (processingId !== selectedEnterprise.id) e.target.style.backgroundColor = '#c82333';
                }}
                onMouseOut={(e) => {
                  if (processingId !== selectedEnterprise.id) e.target.style.backgroundColor = '#dc3545';
                }}
              >
                {processingId === selectedEnterprise.id ? '处理中...' : '确认退回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilingAudit;