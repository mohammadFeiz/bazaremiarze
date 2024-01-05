
import loadingsrc from './../../images/bazargahh.png';
import './loading.css';
export default function Loading(){
    return (
        <div className="bazargahloading" style={{display:"flex",width:124}}>
            <img src={loadingsrc} className="bazargahloadingitem" style={{width: 29}}/>
            <img src={loadingsrc} className="bazargahloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bazargahloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bazargahloadingitem" style={{width: 14}}/>
            <img src={loadingsrc} className="bazargahloadingitem" style={{width: 27}}/>
            <img src={loadingsrc} className="bazargahloadingitem" style={{width: 30}}/>
        </div>
    )
}