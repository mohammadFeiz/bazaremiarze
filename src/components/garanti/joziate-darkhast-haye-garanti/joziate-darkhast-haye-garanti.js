import React,{Component,createRef} from 'react';
import GarantiCard from '../garanti-card/garanti-card'
import RVD from '../../../npm/react-virtual-dom/react-virtual-dom'
import appContext from '../../../app-context'
import SearchBox from '../../search-box';
import AIOInput from '../../../npm/aio-input/aio-input';
import {Icon} from '@mdi/react';
import noItemSrc from './../../../images/not-found.png';
import {mdiSort,mdiArrowDown,mdiArrowUp} from '@mdi/js'
export default class JoziateDarkhastHayeGaranti extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.dom = createRef();
        this.state = {
            searchValue:'',
            sortValue:false,
            sorts:[
                {text:'قدیمی ترین',value:'0',before:(<Icon path={mdiArrowUp} size={0.8}/>)},
                {text:'جدید ترین',value:'1',before:(<Icon path={mdiArrowDown} size={0.8}/>)},
                {text:'کمترین اقلام',value:'2',before:(<Icon path={mdiArrowUp} size={0.8}/>)},
                {text:'بیشترین اقلام',value:'3',before:(<Icon path={mdiArrowDown} size={0.8}/>)},
            ]
        }
    }
    sort(sortValue){
        let {guaranteeItems,SetState} = this.context;
        let res;
        if(sortValue === '0'){
            res = this.Sort(guaranteeItems,[
                {dir:'inc',active:true,field:({tarikh,saat})=>{
                    tarikh = tarikh.split('/');
                    if(tarikh[1].length === 1){tarikh[1] = '0' + tarikh[1]}
                    if(tarikh[2].length === 1){tarikh[2] = '0' + tarikh[2]}
                    saat = saat.split(':');
                    if(saat[0].length === 1){saat[0] = '0' + saat[0]}
                    if(saat[1].length === 1){saat[1] = '0' + saat[1]}
                    if(saat[2].length === 1){saat[2] = '0' + saat[2]}
                    let num = tarikh.join('') + saat.join('');
                    return +num
                }}
            ])
        }
        else if(sortValue === '1'){
            res = this.Sort(guaranteeItems,[
                {dir:'dec',active:true,field:({tarikh,saat})=>{
                    tarikh = tarikh.split('/');
                    if(tarikh[1].length === 1){tarikh[1] = '0' + tarikh[1]}
                    if(tarikh[2].length === 1){tarikh[2] = '0' + tarikh[2]}
                    saat = saat.split(':');
                    if(saat[0].length === 1){saat[0] = '0' + saat[0]}
                    if(saat[1].length === 1){saat[1] = '0' + saat[1]}
                    if(saat[2].length === 1){saat[2] = '0' + saat[2]}
                    let num = tarikh.join('') + saat.join('');
                    return +num
                }}
            ])
        }
        else if(sortValue === '2'){
            res = this.Sort(guaranteeItems,[
                {dir:'inc',active:true,field:({id})=>{
                    let {garanti_products_dic} = this.context;
                    let mahsoolat = garanti_products_dic[id] || []
                    return mahsoolat.length;
                }}
            ])
        }
        else if(sortValue === '3'){
            res = this.Sort(guaranteeItems,[
                {dir:'dec',active:true,field:({id})=>{
                    let {garanti_products_dic} = this.context;
                    let mahsoolat = garanti_products_dic[id] || []
                    return mahsoolat.length;
                }}
            ])
        }
        this.setState({sortValue})
        SetState({guaranteeItems:res})
    }
    Sort(model,sorts){
        return model.sort((a,b)=>{
          for (let i = 0; i < sorts.length; i++){
            let {field,dir,active} = sorts[i];
            if(!active){continue}
            let aValue = field(a),bValue = field(b);
            if ( aValue < bValue ){return -1 * (dir === 'dec'?-1:1);}
            if ( aValue > bValue ){return 1 * (dir === 'dec'?-1:1);}
            if(i === sorts.length - 1){return 0;}
          }
          return 0;
        });
    }
    render(){
        let {guaranteeItems,garanti_products_dic} = this.context;
        let {searchValue,sorts,sortValue} = this.state;
        return (
            <RVD
                layout={{
                    className:'theme-popup-bg',
                    attrs:{ref:this.dom},
                    column:[
                        {size:12},
                        {
                            show:guaranteeItems.length !== 0,className:'of-visible',
                            row:[
                                {
                                    className:'of-visible',
                                    flex:1,html:<SearchBox placeholder='جستجوی شماره درخواست' value={searchValue} onChange={(searchValue)=>{
                                        this.setState({searchValue})
                                    }}/>
                                },
                                {
                                    align:'vh',className:'of-visible',
                                    html:(
                                        <AIOInput
                                            text={sortValue === false?<Icon path={mdiSort} size={0.8}/>:undefined}
                                            before={sortValue === false?undefined:<Icon path={mdiSort} size={0.8}/>}
                                            type={'select'} caret={false}
                                            value={sortValue}
                                            style={{background:'none'}}
                                            options={sorts}
                                            optionClassName='"fs-12 theme-medium-font-color bold"'
                                            onChange={(value)=>this.sort(value)}
                                        />
                                    )
                                },
                                {size:12}
                            ]
                        },
                        {size:12},
                        {
                            flex:1,className:'ofy-auto',gap:12,show:guaranteeItems.length !== 0,
                            column:[
                                {
                                    gap:2,column:guaranteeItems.filter(({id})=>{
                                        if(!searchValue){return true}
                                        let mahsoolat = garanti_products_dic[id] || []
                    
                                        for(let i = 0; i < mahsoolat.length; i++){
                                            let {onvan} = mahsoolat[i];
                                            if(onvan.indexOf(searchValue) !== -1){return true}
                                        }
                                        return false;
                                    }).map((o,i)=>{
                                        return {
                                            html:(
                                                <GarantiCard 
                                                    isFirst={i === 0} 
                                                    isLast={i === guaranteeItems.length - 1}
                                                    shomare_darkhast={o.shomare_darkhast}
                                                    vaziat={o.vaziat}
                                                    tarikh={o.tarikh}
                                                    saat={o.saat}
                                                    org_object={o.org_object}
                                                    mahsoolat={garanti_products_dic[o.id] || []}
                                                />
                                            )
                                        }
                                    })
                                }
                            ]
                        },
                        {
                            show:guaranteeItems.length === 0,
                            style:{background:'#eee',opacity:0.5},
                            flex:1,className:'ofy-auto',gap:1,align:'vh',
                            column:[
                                {html:<img src={noItemSrc} alt='' width='128' height='128'/>},
                                {html:'سابقه ای موجود نیست',style:{color:'#858a95'}},
                                {size:60}
                            ]
                        }
                    ]
                }}
            />
        )
    }
}

