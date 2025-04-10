/* eslint-disable @next/next/no-img-element */
import { Link } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '../types';
import { LayoutContext } from './context/layoutcontext';
import { useUserStore } from '../stores/userStore'; // load userStore

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const { user, logout } = useUserStore(); // load user status and logout function

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    // Get the initial of the user's username
    const getUserInitial = () => {
        if (!user?.username) return null;
        return user.username.charAt(0).toUpperCase();
    };

    // handle logout
    const handleLogout = () => {
        logout();
        // redicrect to login page if needed
    };

    return (
        <div className="layout-topbar">
            <Link to="/" className="layout-topbar-logo">
                <img
                    src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`}
                    width="47.22px"
                    height={'35px'}
                    alt="logo"
                />
                <span>GAMING BACKLOG</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-calendar"></i>
                    <span>Calendar</span>
                </button>

                {/* user info */}
                {user ? (
                    <>
                        <button type="button" className="p-link layout-topbar-button">
                            <div className="user-avatar">
                                {getUserInitial()}
                            </div>
                            <span>{user.username}</span>
                        </button>
                        <button
                            type="button"
                            className="p-link layout-topbar-button"
                            onClick={handleLogout}
                        >
                            <i className="pi pi-sign-out"></i>
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <Link to="/login">
                        <button type="button" className="p-link layout-topbar-button">
                            <i className="pi pi-user"></i>
                            <span>Login</span>
                        </button>
                    </Link>
                )}

                <Link to="/documentation">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;