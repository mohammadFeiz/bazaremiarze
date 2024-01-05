
import loadingsrc from './../../images/bmloading.png';
import './bm-loading.css';
export default function Loading(){
    return (
        <div className="bmloading" style={{display:"flex",width:202}}>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 29}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 15}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 62}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 15}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bmloadingitem" style={{width: 28}}/>
        </div>
    )
}