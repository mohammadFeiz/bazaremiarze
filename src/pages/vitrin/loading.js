
import loadingsrc from './../../images/vitrin.png';
import './loading.css';
export default function Loading(){
    return (
        <div className="vitrinloading" style={{display:"flex",width:129}}>
            <img src={loadingsrc} className="vitrinloadingitem" style={{width: 30}}/>
            <img src={loadingsrc} className="vitrinloadingitem" style={{width: 15}}/>
            <img src={loadingsrc} className="vitrinloadingitem" style={{width: 15}}/>
            <img src={loadingsrc} className="vitrinloadingitem" style={{width: 15}}/>
            <img src={loadingsrc} className="vitrinloadingitem" style={{width: 17}}/>
            <img src={loadingsrc} className="vitrinloadingitem" style={{width: 37}}/>
        </div>
    )
}