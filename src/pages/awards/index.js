import React, { Component } from 'react';
import getSvg from './../../utils/getSvg';
import ChanceMachin from './../../components/chance-machin/index';
import { Icon } from '@mdi/react';
import appContext from '../../app-context';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOInput from '../../npm/aio-input/aio-input';
import { mdiClose, mdiChevronRight, mdiChevronLeft } from '@mdi/js';
import './index.css';
export default class Awards extends Component {
  static contextType = appContext
  constructor(props) {
    super(props);
    this.iconDictionary = {
      '1':'aw1',//
      '2':'aw2','3':'aw3','4':'aw4','5':'aw5','6':'aw1','7':'aw2','8':'aw3','9':'aw4'
    }
    this.state = {
      chanceResult:false,//false, winner or looser
      chanceIndex:false,//reward index that user win it
      showUserAwards:false,
      awardIndex: 0,
      awards: [],
      userAwards:[
        
      ]
    }

  }
  async getUserAwards(){
    let {apis} = this.context;
    return await apis.request({api:'gardoone.get_user_awards'});
  }
  async componentDidMount(){
    let {apis} = this.context;
    let awards = await apis.request({api:'gardoone.get_all_awards'});
    let userAwards = await this.getUserAwards();
    this.mounted = true;
    this.setState({userAwards,awards:awards.map((o)=>{
      return {...o,icon:this.iconDictionary[o.id.toString()],subtitle:o.shortDescription}
    })})
  }
  async getChanceResult(result,index){
    let {apis} = this.context;
    this.setState({chanceResult:result?'winner':'looser',chanceIndex:index});
    let {awards} = this.state;
    let res = await apis.request({api:'gardoone.save_catched_chance',parameter:{award:awards[index],result}});
    if(res){
      let userAwards = await this.getUserAwards();
      this.setState({userAwards})
    }
  }
  render() {
    if(!this.mounted){return null;}
    let { awards,chanceResult,chanceIndex,showUserAwards,userAwards } = this.state;
    let {onClose} = this.props;
    let {SetState} = this.context;
    
    return (
      <>
        <RVD
        layout={{
          className: 'award-page',
          column: [
            {html:<AnimeBG/>},
            {
              size: 96, align: 'v',className: 'award-page-header' ,
              row: [
                { flex: 1 },
                { size: 36, html: <Icon path={mdiClose} size={1} />, align: 'vh' ,attrs:{onClick:()=>onClose()}}
              ]
            },
            { html: 'جایزه روزانه', align: 'vh',style: { fontSize: 40 }},
            { size: 48, html: 'هر روز یک شانس برای برنده شدن دارید', align: 'vh',style: { fontSize: 16 } },
            { flex: 1 },
            { 
              html: (
                <ChanceMachin 
                  items={awards.map(({ icon }) => getSvg(icon))} 
                  getResult={(result,index)=>this.getChanceResult(result,index)}
                  showIndex={true}
                  manipulate={[44,60,77,4,50]}
                />
              ), 
              style: { padding: '0 24px' }, align: 'h'
            },
            { flex: 1 },
            { size: 48, html: 'جایزه ها', align: 'vh',style: { fontSize: 24 } },
            {html:<AwardsPreview awards={awards} onClick={()=>this.setState({showUserAwards:true})}/>},
            { size: 36 }
          ]
        }}
      />
      {
        chanceResult !== false &&
        <div className='award-page-popup-container'>
          <RVD
            layout={{
              className:'award-page-popup',
              column:[
                {
                  size:48,
                  row:[
                    {flex:1},
                    {
                      size:36,align:'v',
                      html:<Icon path={mdiClose} size={1} />,
                      attrs:{onClick:()=>this.setState({chanceResult:false})}
                    }
                  ]
                },
                {html:getSvg(chanceResult === 'winner'?9:10),align:'h'},
                {
                  size:48,
                  html:chanceResult === 'winner'?'شما برنده شدید':'متاسفانه برنده نشدید',
                  align:'vh',
                  style:{color:chanceResult === 'winner'?'#107C10':'#A4262C',fontSize:24,fontWeight:'bold'}
                },
                {
                  align:'h',size:96,
                  html:'فردا دوباره شانس خود را امتحان کنید'
                },
                {
                  show:chanceResult === 'winner',
                  html:<AwardCard {...awards[chanceIndex]} icon={getSvg(awards[chanceIndex].icon)}/> 
                },
                {
                  html:<button onClick={()=>onClose()}>بازگشت به خانه</button>
                },
                {
                  show:chanceResult === 'winner',
                  html:<button>خرید</button>
                },
                {
                  show:chanceResult === 'winner',size:48,align:'vh',style:{fontSize:14},
                  html:'جایزه شما به مدت 30 روز در بروکس من قابل دریافت است'
                },
                {size:24}
              ]
            }}
          />
        </div>        
      }
      {
        showUserAwards &&
        <UserAwards items={userAwards} onClose={()=>this.setState({showUserAwards:false})}/>
      }
      </>
    )
  }
}

class AwardsPreview extends Component{
  state = {activeIndex:0}
  changeAward(dir) {
    let { activeIndex } = this.state;
    let { awards } = this.props;
    activeIndex = activeIndex + dir;
    if(activeIndex < 0){activeIndex = awards.length - 1}
    if(activeIndex > awards.length - 1){activeIndex = 0}
    this.setState({activeIndex})
  }
  render(){
    let {activeIndex} = this.state;
    let {awards,onClick = ()=>{}} = this.props;
    let visibleAward = awards[activeIndex];
    return (
      <RVD
        layout={{
          style: { padding: '0 12px' },
          row: [
            {
              size: 30, html: <Icon path={mdiChevronRight} />,
              attrs: { onClick: () => this.changeAward(-1) }
            },
            {
              flex: 1,
              attrs:{onClick:()=>onClick(activeIndex)},
              html: (
                <AwardCard
                  title={visibleAward.title}
                  subtitle={visibleAward.subtitle}
                  icon={getSvg(visibleAward.icon)}
                />
              )
            },
            {
              size: 30, html: <Icon path={mdiChevronLeft} />,
              attrs: { onClick: () => this.changeAward(1) }
            },
          ]
        }}
      />
    )
  }
}
class AwardCard extends Component {
  render() {
    let { icon, title, subtitle } = this.props;
    return (
      <RVD
        layout={{
          className: 'award-card' ,
          gap: 16,
          row: [
            { html: icon, align: 'vh' },
            {
              style: { padding: '8px 0' },
              column: [
                { show: !!title, html: () => title, flex: 1,style: { fontSize: 13,color:'#fff' } } ,
                { show: !!subtitle, html: subtitle, flex: 1, align: 'v',style: { fontSize: 12, fontWeight: 'bold',color:'#fff' } },

              ]
            }
          ]
        }}
      />
    )
  }
}
class UserAwards extends Component{
  render(){
    let {items,onClose} = this.props;
    let usedItems = [];
    let unusedItems = [];
    for(let i = 0; i < items.length; i++){
      let {used} = items[i];
      if(used){
        usedItems.push(items[i])
      }
      else {
        unusedItems.push(items[i])
      }
    }
    return (
      <RVD
        layout={{
          className:'user-rewards',style:{direction:'rtl'},
          column:[
            {
              size:60,style:{borderBottom:'1px solid #ccc'},
              row:[
                {size:60,html:<Icon path={mdiChevronRight} size={1}/>,align:'vh',attrs:{onClick:()=>onClose()}},
                {html:'جایزه ها',align:'v',style:{fontSize:20}}
              ]
            },
            {size:40,align:'vh',html:'مهلت استفاده از جایزه برنده شده 30 روز می باشد'},
            {
              style:{padding:'0 24px'},size:36,align:'v',
              gap:12,
              row:[
                {html:'مرتب سازی بر اساس : '},
                {flex:1,html:(
                  <AIOInput
                    style={{fontFamily:'inherit',width:'100%',border:'1px solid #ddd',height:24}} 
                    rtl={true}
                    popover={{fitHorizontal:true}}
                    type='select'
                    value='2'
                    options={[
                      {text:'ارزش',value:'1'},
                      {text:'زمان باقیمانده',value:'2'},
                      
                    ]}
                  />
                )}

              ]
            },
            {
              flex:1,className:'ofy-auto',
              column:unusedItems.concat(usedItems).map(({title = '',subtitle = '',used,date,code,remaining})=>{
                
                return {
                    size:93,
                    className:'user-reward-item' + (used?' used':''),
                    row:[
                      {
                        flex:1,
                        style:{padding:12},
                        column:[
                          {
                            flex:1,align:'v',
                            row:[
                              {html:title + ' ' + subtitle,align:'v'},
                              {flex:1},
                              {html:date,style:{fontSize:12},align:'v'}
                            ]
                          },
                          {size:18},
                          {
                            flex:1,align:'v',
                            row:[
                              {html:code,align:'v',style:{fontSize:12}},
                              {flex:1},
                              {show:remaining !== undefined,html:'انقضا' + ' ' + remaining + ' ' + 'روز',align:'v',style:{fontSize:12,color:remaining < 7?'red':undefined}}
                            ]
                          }
                        ]
                      },
                      {
                        size:68,align:'vh',
                        className:'user-reward-item-label',
                        html:!used?'استفاده':'استفاده نشده'
                      },
                    ]
                }
              })
            }
          ]
        }}
      />
      
    )
  }
}




class AnimeBG extends Component{
  render(){
      return (
          <div className='anime-bg-container'>
          <div className='anime-bg-1'>
              <div className='anime-bg-item-1'></div>
          </div>
          <div className='anime-bg-2'>
              <div className='anime-bg-item-2'></div>
          </div>
          <div className='anime-bg-3'>
              <div className='anime-bg-item-3'></div>
          </div>
          <div className='anime-bg-4'>
              <div className='anime-bg-item-4'></div>    
          </div>
          <div className='anime-bg-gloss'></div>
          </div>
      )
  }
}