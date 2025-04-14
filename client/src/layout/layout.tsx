import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <div className="layout-topbar">
        <div className="layout-topbar-logo">
          <Link to="/" className="logo-link">
            <img src="/layout/images/logo-dark.svg" alt="Logo" />
            <span>Backlog App</span>
          </Link>
        </div>
        <div className="layout-topbar-menu">
          <Link to="/login" className="topbar-button">Login</Link>
        </div>
      </div>
      <div className="layout-main-container">
        <div className="layout-sidebar">
          <ul className="layout-menu">
            <li>
              <Link to="/catalog" className="menu-link">Catalog</Link>
            </li>
            <li>
              <Link to="/charts" className="menu-link">Charts</Link>
            </li>
          </ul>
        </div>
        <div className="layout-main">
          {children}
        </div>
      </div>
      <div className="layout-footer">
        <p>© 2025 Backlog App</p>
      </div>
    </div>
  );
};

export default Layout;
