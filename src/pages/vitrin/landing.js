import React,{useContext} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import image_src from './../../images/vitrin-landing.png';
import vitlan1 from './../../images/vitrin-landing-1.png';
import vitlan2 from './../../images/vitrin-landing-2.png';
import appContext from "../../app-context";
export default function Landing(){
    let { vitrin } = useContext(appContext), { started } = vitrin;
    return (
        <RVD
            layout={{
                className: 'page-bg ofy-auto', style: { background: '#fff' },
                column: [
                    { html: (<img src={image_src} alt='' width='240' height='259' />), align: 'vh' },
                    { size: 12 },
                    { html: 'زودتر از سفارشات با خبر شو!', className: 'theme-dark-font-color fs-24 bold', align: 'h' },
                    { size: 8 },
                    {
                        html: 'همین الان ویترین خودت رو بچین تا هیچ سفارشی رو از دست ندی!',
                        className: 'theme-medium-font-color fs-16 p-h-24', align: 'h'
                    },
                    { size: 36 },

                    {
                        show: started === false, align: 'vh', className: 'p-h-24',
                        html: (<button style={{ width: '100%', borderRadius: 24, height: 48 }} className="button-2" onClick={() => this.start()}>شروع کن</button>)
                    },
                    { html: <img src={vitlan2} width='100%' alt='' /> },
                    { size: 24 },
                    { html: <img src={vitlan1} width='100%' alt='' /> },
                    { size: 24 }
                ]
            }}
        />
    )
}
