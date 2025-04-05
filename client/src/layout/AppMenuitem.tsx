import React, { useEffect, useContext, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';
import { CSSTransition } from 'react-transition-group';
import { MenuContext } from './context/menucontext';
import { AppMenuItemProps } from '../types';

const AppMenuitem = (props: AppMenuItemProps) => {
    const location = useLocation();
    const pathname = location.pathname;
    const search = location.search;
    const nodeRef = useRef(null); // Add this ref for CSSTransition

    const { activeMenu, setActiveMenu } = useContext(MenuContext);
    const item = props.item;
    const key = props.parentKey ? `${props.parentKey}-${props.index}` : String(props.index);
    const isActiveRoute = item?.to && pathname === item.to;
    const active = activeMenu === key || activeMenu.startsWith(`${key}-`);

    const onRouteChange = (url: string) => {
        if (item?.to && item.to === url) {
            setActiveMenu(key);
        }
    };

    useEffect(() => {
        onRouteChange(pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, search]);

    const itemClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (item?.disabled) {
            event.preventDefault();
            return;
        }

        if (item?.command) {
            item.command({ originalEvent: event, item });
        }

        if (item?.items) {
            setActiveMenu(active ? (props.parentKey as string) : key);
        } else {
            setActiveMenu(key);
        }
    };

    const subMenu = item?.items && item.visible !== false && (
        <CSSTransition 
            nodeRef={nodeRef} // Add the nodeRef here
            timeout={{ enter: 1000, exit: 450 }} 
            classNames="layout-submenu" 
            in={props.root ? true : active} 
            key={item.label}
        >
            <ul ref={nodeRef}> {/* Attach the ref to the element */}
                {item.items.map((child, i) => (
                    <AppMenuitem item={child} index={i} className={child.badgeClass} parentKey={key} key={child.label} />
                ))}
            </ul>
        </CSSTransition>
    );

    return (
        <li className={classNames({ 'layout-root-menuitem': props.root, 'active-menuitem': active })}>
            {props.root && item?.visible !== false && <div className="layout-menuitem-root-text">{item.label}</div>}

            {/* Non-routing or expandable menu items */}
            {(!item?.to || item.items) && item.visible !== false && (
                <a href={item.url} onClick={(e) => itemClick(e)} className={classNames(item.class, 'p-ripple')} target={item.target} tabIndex={0}>
                    <i className={classNames('layout-menuitem-icon', item.icon)}></i>
                    <span className="layout-menuitem-text">{item.label}</span>
                    {item.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                    <Ripple />
                </a>
            )}

            {/* Link-based menu item */}
            {item?.to && !item.items && item.visible !== false && (
                <Link
                    to={item.to}
                    target={item.target}
                    onClick={(e) => itemClick(e)}
                    className={classNames(item.class, 'p-ripple', { 'active-route': isActiveRoute })}
                    tabIndex={0}
                    replace={item.replaceUrl}
                >
                    <i className={classNames('layout-menuitem-icon', item.icon)}></i>
                    <span className="layout-menuitem-text">{item.label}</span>
                    <Ripple />
                </Link>
            )}

            {subMenu}
        </li>
    );
};

export default AppMenuitem;