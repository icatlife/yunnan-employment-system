import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('profile');

  const handleMenuClick = (menuKey, path) => {
    setActiveMenu(menuKey);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // 简单重载页面回到登录
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
            <li style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: activeMenu === 'profile' ? '#ddd' : 'transparent'
            }} onClick={() => handleMenuClick('profile', '/profile')}>
              企业信息备案
            </li>
            <li style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: activeMenu === 'report-form' ? '#ddd' : 'transparent'
            }} onClick={() => handleMenuClick('report-form', '/report-form')}>
              月度数据填报
            </li>
            <li style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: activeMenu === 'report-list' ? '#ddd' : 'transparent'
            }} onClick={() => handleMenuClick('report-list', '/report-list')}>
              数据查询
            </li>
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
