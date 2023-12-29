import AIOChart,{
    Gauge as GAUGE,
    getFakeData as GetFakeData
} from './index';
//import AIOChart from 'aio-chart';
export default AIOChart;
export function getFakeData(x,y){return GetFakeData(x,y)}
export function Gauge(props){return <GAUGE {...props}/>}