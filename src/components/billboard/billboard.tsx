import React, { useContext, useEffect, useState, useCallback } from 'react';
import ACS from '../../npm/aio-content-slider/aio-content-slider';
import RVD from '../../npm/react-virtual-dom/react-virtual-dom';
import deficonsrc from './../../images/deficon.png';
import defbillboardsrc from './../../images/defbillboard.png';
import appContext from '../../app-context';
import { I_app_state, I_backOffice_content } from '../../types';

type I_Billboard = { renderIn: 'buy' | 'home' }
type I_Billboard_item = { name?: string, billboard: any, icon?: any, onClick?: any }

export default function Billboard(props: I_Billboard) {
    let { backOffice, b1Info, Shop, actionClass }: I_app_state = useContext(appContext);
    let { renderIn } = props;
    let [items, setItems] = useState<I_Billboard_item[]>([]);
    let [loading, setLoading] = useState(false);

    //DataPushLayer
    function pushToDataLayer(data: any) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(data);
    }

    useEffect(() => { getItems() }, [])

    const getItems = useCallback(() => {
        let items: I_Billboard_item[] = [];
        if (renderIn === 'buy') {
            for (let shopId in Shop) {
                let ShopClass = Shop[shopId]
                if (shopId === 'Regular' || !ShopClass.active) { continue }
                let { billboard, icon, shopName } = ShopClass;
                items.push({
                    name: shopName, billboard, icon, 
                    onClick: async () => {
                        // Data push layer call
                        pushToDataLayer({
                            event: 'page_view',
                            page_title: `جشنواره ${shopName}`,
                            page_url: `/burux_shop/campain/${shopName}`
                        });
                        //console.log(`Opening category for ${shopName}`);
                        setLoading(true);
                        await ShopClass.openCategory();
                        setLoading(false);
                    }
                })
            }
        }
        else if (renderIn === 'home') {
            let { homeContent = [] } = backOffice;
            let homeBillboards: I_backOffice_content[] = homeContent.filter((o) => o.type === 'billboard');
            for (let i = 0; i < homeBillboards.length; i++) {
                let { linkTo, url } = homeBillboards[i];
                let onClick = linkTo ? async () => {
                    console.log(`Opening link to ${linkTo}`);
                    setLoading(true);
                    await actionClass.openLink(linkTo);
                    setLoading(false);
                } : undefined;
                items.push({ billboard: url, onClick })
            }
        }
        setItems(items)
    }, [Shop, backOffice, actionClass, renderIn])

    function billboards_layout() {
        let billboards = items.map(({ billboard, onClick }, i) =>
            <img
                key={i}
                src={billboard || defbillboardsrc}
                alt="" width='100%'
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }} // Makes the image appear clickable
            />)
        return { html: <ACS items={billboards} /> }
    }

    function icons_layout() {
        if (renderIn !== 'buy') { return false }
        if (!items.length) { return false }
        let icons = items.map((o: I_Billboard_item) => icon_layout(o))
        return {
            column: [
                { html: 'جشنواره ها', className: 'fs-14 bold theme-dark-font-color p-h-24', size: 36, align: 'v' },
                { row: icons },
                { size: 12 }
            ]
        }
    }

    function icon_layout(p: I_Billboard_item) {
        let { name, icon, onClick } = p;
        return {
            flex: 1, align: 'h', onClick, gap: 3,
            column: [
                { html: <img src={icon || deficonsrc} width={54} height={54} alt='' style={{ borderRadius: 16 }} /> },
                { html: name, className: 'fs-12 bold theme-dark-font-color' }
            ]
        }
    }

    const loaderStyle: React.CSSProperties = {
        border: "4px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "4px solid #3498db",
        width: "30px",
        height: "30px",
        animation: "spin 2s linear infinite",
    };

    const overlayStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Ensure it covers the rest of the content
    };

    const spinKeyframes = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    return (
        <div style={{ width: '100%', maxWidth: 600 }}>
            <style>{spinKeyframes}</style>
            {loading && (
                <div style={overlayStyle}>
                    <div style={loaderStyle}></div>
                </div>
            )}
            <RVD layout={{ style: { width: '100%' }, column: [billboards_layout(), icons_layout()] }} />
        </div>
    )
}
