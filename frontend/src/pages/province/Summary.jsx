import React, { useState, useEffect } from 'react';
import api from '../../api';

function Summary() {
  const [reportPeriod, setReportPeriod] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Generate available report periods (last 12 months)
  const getAvailablePeriods = () => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      periods.push(period);
    }
    return periods;
  };

  const fetchSummary = async () => {
    if (!reportPeriod) {
      setMessage('请选择调查期');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const response = await api.get('/api/province/summary', {
        params: { report_period: reportPeriod }
      });
      setSummaryData(response.data);
    } catch (error) {
      setMessage('获取汇总数据失败：' + (error.response?.data?.message || error.message));
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>数据汇总</h2>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: message.includes('成功') || message.includes('请选择') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') || message.includes('请选择') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('成功') || message.includes('请选择') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* 调查期选择区域 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>选择调查期</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>调查期：</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="">请选择调查期</option>
              {getAvailablePeriods().map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchSummary}
            disabled={loading || !reportPeriod}
            style={{
              padding: '8px 16px',
              backgroundColor: loading || !reportPeriod ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !reportPeriod ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (!loading && reportPeriod) e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              if (!loading && reportPeriod) e.target.style.backgroundColor = '#007bff';
            }}
          >
            {loading ? '查询中...' : '查询汇总'}
          </button>
        </div>
      </div>

      {/* 汇总数据显示区域 */}
      {summaryData && (
        <>
          {/* 全省汇总卡片 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>全省汇总 ({reportPeriod})</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', color: '#007bff', marginBottom: '10px' }}>
                  📊
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {formatNumber(summaryData.province_summary.total_enterprises)}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>企业总数</div>
              </div>

              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', color: '#28a745', marginBottom: '10px' }}>
                  👥
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {formatNumber(summaryData.province_summary.total_base_employment)}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>建档期就业总人数</div>
              </div>

              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', color: '#17a2b8', marginBottom: '10px' }}>
                  👥
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {formatNumber(summaryData.province_summary.total_current_employment)}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>调查期就业总人数</div>
              </div>

              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  color: summaryData.province_summary.total_job_change >= 0 ? '#28a745' : '#dc3545',
                  marginBottom: '10px'
                }}>
                  {summaryData.province_summary.total_job_change >= 0 ? '📈' : '📉'}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: summaryData.province_summary.total_job_change >= 0 ? '#28a745' : '#dc3545'
                }}>
                  {summaryData.province_summary.total_job_change >= 0 ? '+' : ''}{formatNumber(summaryData.province_summary.total_job_change)}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>岗位变化总数</div>
              </div>
            </div>
          </div>

          {/* 各地市汇总表格 */}
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>各地市汇总</h3>
            {summaryData.city_summaries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                <p>暂无数据</p>
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
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>地市名称</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>企业数</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>建档期就业人数</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>调查期就业人数</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>岗位变化</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.city_summaries.map((city, index) => (
                      <tr key={city.city_name} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{city.city_name}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(city.enterprise_count)}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(city.total_base_employment)}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatNumber(city.total_current_employment)}</td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'right',
                          color: city.total_job_change >= 0 ? '#28a745' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {city.total_job_change >= 0 ? '+' : ''}{formatNumber(city.total_job_change)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Summary;