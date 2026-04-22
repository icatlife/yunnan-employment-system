import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
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
        <li key="profile" className={`app-menu-item ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => handleMenuClick('profile', '/profile')}>
          企业信息备案
        </li>,
        <li key="report-form" className={`app-menu-item ${activeMenu === 'report-form' ? 'active' : ''}`} onClick={() => handleMenuClick('report-form', '/report-form')}>
          月度数据填报
        </li>,
        <li key="report-list" className={`app-menu-item ${activeMenu === 'report-list' ? 'active' : ''}`} onClick={() => handleMenuClick('report-list', '/report-list')}>
          数据查询
        </li>
      );
    } else if (user.role === 'city') {
      menuItems.push(
        <li key="audit" className={`app-menu-item ${activeMenu === 'audit' ? 'active' : ''}`} onClick={() => handleMenuClick('audit', '/city/audit')}>
          数据审核
        </li>
      );
    } else if (user.role === 'province') {
      menuItems.push(
        <li key="filing-audit" className={`app-menu-item ${activeMenu === 'filing-audit' ? 'active' : ''}`} onClick={() => handleMenuClick('filing-audit', '/province/filing-audit')}>
          企业备案审批
        </li>,
        <li key="report-audit" className={`app-menu-item ${activeMenu === 'report-audit' ? 'active' : ''}`} onClick={() => handleMenuClick('report-audit', '/province/report-audit')}>
          报表终审
        </li>,
        <li key="summary" className={`app-menu-item ${activeMenu === 'summary' ? 'active' : ''}`} onClick={() => handleMenuClick('summary', '/province/summary')}>
          数据汇总
        </li>
      );
    }

    return menuItems;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="切换菜单"
          >
            ☰
          </button>
          <h1 className="app-title">企业就业失业数据采集系统</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          退出登录
        </button>
      </header>

      <div className="app-body">
        <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="app-menu-list">
            {renderMenuItems()}
          </ul>
        </aside>

        {isMobileMenuOpen && <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />}

        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
