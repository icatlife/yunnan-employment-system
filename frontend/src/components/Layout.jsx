import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 从localStorage获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  const handleMenuClick = (menuKey, path) => {
    setActiveMenu(menuKey);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // 简单重载页面回到登录
  };

  const renderMenuItems = () => {
    if (!user) return null;

    const menuItems = [];

    if (user.role === 'enterprise') {
      menuItems.push(
        <li key="profile" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'profile' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('profile', '/profile')}>
          企业信息备案
        </li>,
        <li key="report-form" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'report-form' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('report-form', '/report-form')}>
          月度数据填报
        </li>,
        <li key="report-list" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'report-list' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('report-list', '/report-list')}>
          数据查询
        </li>
      );
    } else if (user.role === 'city') {
      menuItems.push(
        <li key="audit" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'audit' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('audit', '/city/audit')}>
          数据审核
        </li>
      );
    } else if (user.role === 'province') {
      menuItems.push(
        <li key="filing-audit" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'filing-audit' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('filing-audit', '/province/filing-audit')}>
          企业备案审批
        </li>,
        <li key="report-audit" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'report-audit' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('report-audit', '/province/report-audit')}>
          报表终审
        </li>,
        <li key="summary" style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: activeMenu === 'summary' ? '#ddd' : 'transparent'
        }} onClick={() => handleMenuClick('summary', '/province/summary')}>
          数据汇总
        </li>
      );
    }

    return menuItems;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 顶部导航栏 */}
      <header style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>企业就业失业数据采集系统</h1>
        <button onClick={handleLogout} style={{
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          cursor: 'pointer'
        }}>
          退出登录
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* 左侧侧边栏 */}
        <aside style={{
          width: '200px',
          backgroundColor: '#f0f0f0',
          padding: '20px 0',
          borderRight: '1px solid #ddd'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {renderMenuItems()}
          </ul>
        </aside>

        {/* 右侧内容区域 */}
        <main style={{
          flex: 1,
          backgroundColor: 'white',
          padding: '20px'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
