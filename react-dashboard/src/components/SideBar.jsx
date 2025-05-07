import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Home, MapPin, Settings, User, LogOut, Shield } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/SideBar.css';


export default function SideBar({ onLinkClick }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const displayName = user?.name || user?.email || 'there';
  const namespace = 'https://api.pctparking.app/';
  const roles = user?.[namespace + 'roles'] || [];
  const isAdmin = roles.includes('Admin');

  const items = [
    { label: 'Dashboard',        icon: <Home size={20} />,    path: '/' },
    { label: 'Live Camera Feed', icon: <MapPin size={20} />,  path: '/live-feeds' },
    { label: 'Settings',         icon: <Settings size={20} />,path: '/settings' },
  ];
  if (isAdmin) {
    items.push({ label: 'Admin', icon: <Shield size={20} />, path: '/admin' });
  }

  return (
    <Nav className="sidebar d-flex flex-column text-white bg-secondary p-3">
      {/* Header */}
      <div className="sidebar-header mb-4">
        <h4 className="m-0">Parking Lot</h4>
      </div>

      {items.map(({ label, icon, path }) => (
        <Nav.Link
          as={NavLink}
          to={path}
          key={label}
          onClick={() => onLinkClick?.()}
          className="sidebar-item d-flex align-items-center mb-2 text-white"
          end={path === '/'}
        >
          <span className="me-2">{icon}</span>
          {label}
        </Nav.Link>
      ))}

      {isAuthenticated && (
        <Nav.Link
          onClick={() => {
            logout({ logoutParams: { returnTo: window.location.origin } });
            onLinkClick?.();
          }}
          className="sidebar-item d-flex align-items-center mb-2 text-white"
        >
          <span className="me-2"><LogOut size={20} /></span>
          Log out
        </Nav.Link>
      )}

      <div className="mt-auto"></div>

      <div className="d-md-none pt-3 border-top text-white d-flex align-items-center">
        {isLoading ? (
          <span>Loading...</span>
        ) : isAuthenticated ? (
          <>
            <User size={16} className="me-2" />
            <span>Hello, {displayName}</span>
          </>
        ) : null}
      </div>
    </Nav>
  );
}
