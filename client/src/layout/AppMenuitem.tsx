import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';
import React, { useEffect, useContext, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { MenuContext } from './context/menucontext';
import { AppMenuItemProps } from '../../types';

const AppMenuItem = (props: AppMenuItemProps) => {
    const location = useLocation(); // Se usa location.pathname
    const [searchParams] = useSearchParams();
    const { activeMenu, setActiveMenu } = useContext(MenuContext);

    const item = props.item;
    const key = props.parentKey ? `${props.parentKey}-${props.index}` : String(props.index);
    const isActiveRoute = item?.to && location.pathname === item.to;
    const active = activeMenu === key || activeMenu.startsWith(`${key}-`);

    const nodeRef = useRef(null); // Create ref for CSSTransition

    const onRouteChange = (url: string) => {
        if (item?.to && item.to === url) {
            setActiveMenu(key);
        }
    };

    useEffect(() => {
        onRouteChange(location.pathname);
    }, [location.pathname, searchParams]);

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
            nodeRef={nodeRef} // Attach nodeRef to CSSTransition
            timeout={{ enter: 1000, exit: 450 }}
            classNames="layout-submenu"
            in={props.root ? true : active}
            key={item.label}
        >
            <ul ref={nodeRef}> {/* Attach ref here */}
                {item.items.map((child, i) => (
                    <AppMenuItem
                        item={child}
                        index={i}
                        className={child.badgeClass}
                        parentKey={key}
                        key={child.label}
                    />
                ))}
            </ul>
        </CSSTransition>
    );

    return (
        <li className={classNames({ 'layout-root-menuitem': props.root, 'active-menuitem': active })}>
            {props.root && item?.visible !== false && <div className="layout-menuitem-root-text">{item.label}</div>}

            {/* Para items sin submenú y sin navegación */}
            {(!item?.to || item.items) && item?.visible !== false ? (
                <a href={item?.url} onClick={(e) => itemClick(e)} className={classNames(item?.class, 'p-ripple')} target={item?.target} tabIndex={0}>
                    <i className={classNames('layout-menuitem-icon', item?.icon)}></i>
                    <span className="layout-menuitem-text">{item?.label}</span>
                    {item?.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                    <Ripple />
                </a>
            ) : null}

            {/* Usar `Link` con `to` en React Router */}
            {item?.to && !item.items && item?.visible !== false ? (
                <Link to={item.to} replace={item.replaceUrl} target={item.target} onClick={(e) => itemClick(e)} className={classNames(item.class, 'p-ripple', { 'active-route': isActiveRoute })} tabIndex={0}>
                    <i className={classNames('layout-menuitem-icon', item.icon)}></i>
                    <span className="layout-menuitem-text">{item.label}</span>
                    {item.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                    <Ripple />
                </Link>
            ) : null}

            {subMenu}
        </li>
    );
};

export default AppMenuItem;
