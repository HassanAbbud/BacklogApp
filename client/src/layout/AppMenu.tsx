/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '../types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        
        {
            label: 'Pages',
            items: [                
                { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/charts' },
                { label: 'Catalog', icon: 'pi pi-fw pi-pencil', to: '/catalog' }
            ]
        },
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}                
            </ul>
        </MenuProvider>
    );
    
};

export default AppMenu;
