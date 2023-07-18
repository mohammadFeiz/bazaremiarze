import React,{Component,createContext} from 'react';
import AIODate from './../aio-date/aio-date';
import AIOButton from './aio-button';
import './datepicker.css';
var DPContext = createContext();
export default class DatePicker extends Component {
    constructor(props){
        super(props);
        let {calendarType = 'gregorian',unit = 'day',value} = props;
        if(!value){
            value = AIODate().getToday({calendarType})
        }
        let [year,month,day] = AIODate().convertToArray({date:value})
        let today = AIODate().getToday({calendarType});
        let months = AIODate().getMonths({calendarType})
        this.state = {
            activeYear:year,activeMonth:month,activeDay:day,years:this.getYears(),
            todayText:this.getTodayText(),
            today,
            todayWeekDay:AIODate().getWeekDay({date:today}).weekDay,
            months,
            thisMonthString:months[today[1] - 1],
        }
        
    }
    getYears(){
        let start,end;
        let {calendarType,startYear,endYear} = this.props;
        let today = AIODate().getToday({calendarType});
        if(typeof startYear === 'string' && startYear.indexOf('-') === 0){
          start = today[0] - parseInt(startYear.slice(1,startYear.length));
        }
        else{start = parseInt(startYear);}
        if(typeof endYear === 'string' && endYear.indexOf('+') === 0){
          end = today[0] + parseInt(endYear.slice(1,endYear.length));
        }
        else{end = parseInt(endYear);}
        let years = [];
        for(var i = start; i <= end; i++){years.push(i);}
        return years;
    }    
    getTodayText(){
      let {unit = 'day',calendarType = 'gregorian'} = this.props;
      return {
        hourjalali:'ساعت کنونی',hourgregorian:'This Hour',dayjalali:'امروز',daygregorian:'Today',monthjalali:'ماه جاری',
        monthgregorian:'This Month',yearjalali:'سال جاری',yeargregorian:'This Year'
      }[unit + (calendarType)];
    }
    getPopupStyle(){
        var {size,disabled,theme = []} = this.props;
        return {
            width:size,fontSize:size / 17,background:theme[1],color:theme[0],stroke:theme[0],
            cursor:disabled === true?'not-allowed':undefined,
        };
    }
    getContext(){
        return {
            ...this.props,...this.state,
            SetState:(obj)=>this.setState(obj),
            onChange:({year,month,day,hour})=>{
                let {onChange = ()=>{},calendarType,unit,value} = this.props;
                let {months} = this.state;
                let dateArray = [year,month,day,hour];
                let jalaliDateArray = calendarType === 'gregorian'?AIODate().toJalali({date:dateArray}):dateArray;
                let gregorianDateArray = calendarType === 'jalali'?AIODate().toGregorian({date:dateArray}):dateArray;
                let {weekDay,index:weekDayIndex} = unit === 'month'?{weekDay:null,index:null}:AIODate().getWeekDay({date:dateArray})
                let get2digit = (v)=>{
                    if(v === undefined){return}
                    v = v.toString();
                    return v.length === 1?`0${v}`:v 
                }
                let dateString;
                let splitter = typeof value === 'string'?AIODate().getSplitter(value):'/';
                if(unit === 'month'){dateString = `${year}${splitter}${get2digit(month)}`}
                else if(unit === 'day'){dateString = `${year}${splitter}${get2digit(month)}${splitter}${get2digit(day)}`}
                else if(unit === 'hour'){dateString = `${year}${splitter}${get2digit(month)}${splitter}${get2digit(day)}${splitter}${get2digit(hour)}`}
                let monthString = months[month - 1];
                let jalaliMonthString = calendarType === 'gregorian'?AIODate().getMonths({calendarType:'jalali'})[month - 1]:monthString;
                let gregorianMonthString = calendarType === 'jalali'?AIODate().getMonths({calendarType:'gregorian'})[month - 1]:monthString;
                let props = {
                    months,jalaliDateArray,gregorianDateArray,dateArray,weekDay,weekDayIndex,dateString,
                    year,month,day,hour,monthString,jalaliMonthString,gregorianMonthString,
                }
                onChange(props)
            }
        }
    }
    render(){
      return (
        <DPContext.Provider value={this.getContext()}>
          <div className='aio-input-datepicker' style={{display:'flex'}}>
            <div className='aio-input-datepicker-calendar' style={this.getPopupStyle()}>
              <DPHeader/>
              <DPBody/>
              <DPFooter/>
            </div>
            <DPToday/>
          </div>
        </DPContext.Provider>
      );
    }
  }
  DatePicker.defaultProps = {
    size:180,calendarType:'gregorian',disabled:false,
    startYear:'-10',endYear:'+20',unit:'day',
    setDisabled:()=>false
  }
  class DPToday extends Component{
    static contextType = DPContext;
    render(){
      let {calendarType = 'gregorian',size,unit = 'day',theme = [],todayText,today,todayWeekDay,thisMonthString} = this.context;
      return (
        <div className='aio-input-datepicker-today' style={{width:size / 2,color:theme[1],background:theme[0]}}>
          <div style={{fontSize:size / 13}}>{todayText}</div>
          {
            (unit === 'day' || unit === 'hour') &&
            <>
              <div style={{fontSize:size / 11}}>{calendarType === 'gregorian'?todayWeekDay.slice(0,3):todayWeekDay}</div>
              <div style={{fontSize:size / 12 * 4,height:size/12 * 4}}>{today[2]}</div>
              <div style={{fontSize:size / 11}}>{calendarType === 'gregorian'?thisMonthString.slice(0,3):thisMonthString}</div>
            </>
          }
          {unit === 'month' && <div style={{fontSize:size / 8}}>{calendarType === 'gregorian'?thisMonthString.slice(0,3):thisMonthString}</div>}
          <div style={{fontSize:size / 11}}>{today[0]}</div>
          {unit === 'hour' && <div style={{fontSize:size / 10}}>{today[3] + ':00'}</div>}
        </div>
      )
    }
  }
  class DPFooter extends Component{
    static contextType = DPContext;
    onToday(){
      var {unit = 'day',SetState,today} = this.context;
      var [year,month,day] = today;
      if(unit === 'month'){day = 1;}
      SetState({activeYear:year,activeMonth:month,activeDay:day});
    }
    render(){
      let {onClear,disabled,size,calendarType = 'gregorian',todayText} = this.context;
      if(disabled){return null}
      let buttonStyle = {padding:`${size / 20}px 0`};
      return (
        <div className='aio-input-datepicker-footer' style={{fontSize:size / 13}}>
          {
            onClear &&  
            <button className='aio-input-datepicker-button' style={buttonStyle} onClick={()=>onClear()}>
              {{'gregorian':'Clear','jalali':'حذف'}[calendarType]}
            </button>
          }
          <button className='aio-input-datepicker-button' style={buttonStyle} onClick={()=>this.onToday()}>{todayText}</button>
        </div>
      )
    }
  }
  class DPBody extends Component{
    static contextType = DPContext;
    getStyle(){
      let {size,calendarType = 'gregorian',unit = 'day'} = this.context;
      var columnCount = {hour:4,day:7,month:3}[unit];
      var rowCount = {hour:6,day:7,month:4}[unit]; 
      var padding = size / 18,fontSize = size / 15,
      a = (size - padding * 2) / columnCount;
      var rowHeight = {hour:size / 7,day:a,month:size / 6,year:size / 7}[unit];
      var gridTemplateColumns = '',gridTemplateRows = '';
      for(let i = 1; i <= columnCount; i++){
        gridTemplateColumns += a + 'px' + (i !== columnCount?' ':'')
      }
      for(let i = 1; i <= rowCount; i++){
        gridTemplateRows += (rowHeight) + 'px' + (i !== rowCount?' ':'')
      }
      let direction = calendarType === 'gregorian'?'ltr':'rtl';
      return{gridTemplateColumns,gridTemplateRows,direction,padding,fontSize}
    }
    render(){
      let {unit = 'day',activeYear,activeMonth,activeDay} = this.context;
      return (
        <div className='aio-input-datepicker-body' style={this.getStyle()}>
          {unit === 'hour' && new Array(24).fill(0).map((o,i)=><DPCell key={'cell' + i} dateArray={[activeYear,activeMonth,activeDay,i]}/>)}
          {unit === 'day' && <DPBodyDay/>}
          {unit === 'month' && new Array(12).fill(0).map((o,i)=><DPCell key={'cell' + i} dateArray={[activeYear,i + 1]}/>)}
        </div>
      )
    }
  }
  class DPBodyDay extends Component{
    static contextType = DPContext;
    render(){
      let {calendarType = 'gregorian',theme = [],activeYear,activeMonth} = this.context;
      let firstDayWeekDayIndex = AIODate().getWeekDay({date:[activeYear,activeMonth,1]}).index;
      var daysLength = AIODate().getMonthDaysLength({date:[activeYear,activeMonth]});
      let weekDays = AIODate().getWeekDays({calendarType});
      return (<>
        {weekDays.map((weekDay,i)=><DPCell_Weekday key={'weekday' + i} weekDay={weekDay}/>)}
        {new Array(firstDayWeekDayIndex).fill(0).map((o,i)=><div key={'space' + i} className='aio-input-datepicker-space aio-input-datepicker-cell' style={{background:theme[1]}}></div>)}
        {new Array(daysLength).fill(0).map((o,i)=><DPCell key={'cell' + i} dateArray={[activeYear,activeMonth,i + 1]}/>)}
        {new Array(42 - (firstDayWeekDayIndex + daysLength)).fill(0).map((o,i)=><div key={'endspace' + i} className='aio-input-datepicker-space aio-input-datepicker-cell' style={{background:theme[1]}}></div>)}
      </>)
    }
  }
  class DPCell_Weekday extends Component{
    static contextType = DPContext;
    render(){
      let {calendarType = 'gregorian',theme = []} = this.context;
      let {weekDay} = this.props;
      return (
        <div className='aio-input-datepicker-weekday aio-input-datepicker-cell' style={{background:theme[1],color:theme[0]}}>
          <span>{weekDay.slice(0,calendarType === 'gregorian'?2:1)}</span>
        </div>
      )
    }
  }
  class DPCell extends Component{
    static contextType = DPContext;
    getClassName(isActive,isToday,isDisabled,className){
      var str = 'aio-input-datepicker-cell';
      if(isDisabled){str += ' aio-input-datepicker-disabled'}
      if(isActive){str += ' aio-input-datepicker-active';}
      if(isToday){str += ' today';}
      if(className){str += ' className';}
      return str;
    }
    isActive(value,dateArray){
        let {isEqual} = AIODate();
        if(!value){return false}
        return isEqual(dateArray,value);
          
    }
    render(){
      let {unit = 'day',theme = [],onChange,dateAttrs,disabled,calendarType = 'gregorian',value} = this.context;
      let {dateArray} = this.props;
      let {isEqual,isMatch,getMonths,getToday} = AIODate();
      let isActive = this.isActive(value,dateArray);
      let isToday = isEqual(dateArray,getToday({calendarType}))
      let isDisabled = typeof disabled === 'boolean'?disabled:isMatch({date:dateArray,matchers:disabled})
      let attrs = {}
      if(dateAttrs){attrs = dateAttrs({dateArray,isToday,isDisabled,isActive,isMatch:(o)=>isMatch({date:dateArray,matchers:o})}) || {}}
      let className = this.getClassName(isActive,isToday,isDisabled,attrs.className);
      let onClick = isDisabled?undefined:()=>{onChange({year:dateArray[0],month:dateArray[1],day:dateArray[2],hour:dateArray[3]},true)};
      let style = {} 
      if(!isDisabled){style.background = theme[1];}
      if(className.indexOf('aio-input-datepicker-active') !== -1){
        style.background = theme[0];
        style.color = theme[1];
      }
      if(className.indexOf('today') !== -1){style.border = `1px solid ${theme[0]}`}
      style = {...style,...attrs.style}
      let text;
      if(unit === 'hour'){text = dateArray[3] + ':00'}
      else if(unit === 'day'){text = dateArray[2]}
      else if(unit === 'month'){
        let months = getMonths({calendarType});
        text = calendarType === 'gregorian'?months[dateArray[1] - 1].slice(0,3):months[dateArray[1] - 1]
      }
      return <div style={style} onClick={onClick} className={className}>{isDisabled?<del>{text}</del>:text}</div>
    }
  }
  class DPHeader extends Component{
    static contextType = DPContext;
    getYears(){
      let {activeYear,years,SetState} = this.context;
      let props = {value:activeYear,options:years,optionText:'option.toString()',optionValue:'option',
      onChange:(activeYear)=>{SetState({activeYear})}}
      return (<DPHeaderDropdown {...props}/>)
    }
    getMonths(){
      let {activeMonth,calendarType = 'gregorian',SetState,months} = this.context;
      let props = {value:activeMonth,options:months,optionText:calendarType === 'gregorian'?'option.slice(0,3)':'option',optionValue:'index + 1',
      onChange:(activeMonth)=>{SetState({activeMonth})}}
      return (<DPHeaderDropdown {...props}/>)
    }
    getDays(){
      let {activeYear,activeMonth,activeDay,SetState} = this.context;
      let daysLength = AIODate().getMonthDaysLength({date:[activeYear,activeMonth]});
      let options = new Array(daysLength).fill(0).map((o,i)=>{return {text:(i + 1).toString(),value:i + 1}})
      let props = {value:activeDay,options,onChange:(activeDay)=>SetState({activeDay})}    
      return (<DPHeaderDropdown {...props}/>)
    }
    getIcon(type){
      let {theme = []} = this.context;
      return {
        minus:(
          <svg style={{width:"24px",height:"24px"}} width={24} height={24} stroke={theme[0]}>
            <path fill="transparent" d="M13 8 L9 12 L13 16" strokeLinejoin="miter-clip" strokeLinecap="square" strokeWidth={2}></path>
          </svg>
        ),
        plus:(
          <svg style={{width:"24px",height:"24px"}} width={24} height={24} stroke={theme[0]}>
            <path fill="transparent" d="M11 8 L15 12 L11 16" strokeLinejoin="miter-clip" strokeLinecap="square" strokeWidth={2}></path>
          </svg>
        )
      }[type]
    }
    render(){
      let {unit = 'day',size,calendarType = 'gregorian'} = this.context;
      var sign = calendarType === 'gregorian'?1:-1;
      return (
        <div className='aio-input-datepicker-header' style={{height:size / 4}}>
          <DPArrow sign={-sign} icon={this.getIcon('minus')}/>
          <div className='aio-input-datepicker-select' style={{fontSize:Math.floor(size / 12)}}>
            {this.getYears()}
            {(unit === 'day' || unit === 'hour')?this.getMonths():null}
            {(unit === 'hour')?this.getDays():null}
          </div>
          <DPArrow sign={sign} icon={this.getIcon('plus')}/>
        </div>
      )
    }
  }

  class DPHeaderDropdown extends Component{
    static contextType = DPContext;
    render(){
      let {size,theme = []} = this.context;
      let props = {
        caret:false,type:'select',popupAttrs:{style:{maxHeight:size * 1.2}},
        style:{background:'none',color:'inherit',fontSize:'inherit',padding:'0 3px'},
        optionStyle:{height:size / 6,background:theme[1],color:theme[0]}
      }
      return (<AIOButton {...this.props} {...props}/>)
    }
  }
  class DPArrow extends Component{
    static contextType = DPContext;
    change(offset){
      let {unit = 'day',years,SetState,activeYear,activeMonth,activeDay} = this.context;
      let date = [activeYear,activeMonth,activeDay]
      let next = AIODate().getByOffset({date,offset,unit:{'hour':'day','day':'month','month':'year'}[unit]})
      if(next[0] > years[years.length - 1]){return}
      if(next[0] < years[0]){return}
      if(unit === 'month'){SetState({activeYear:next[0]})}
      if(unit === 'day'){SetState({activeYear:next[0],activeMonth:next[1]})}
      if(unit === 'hour'){SetState({activeYear:next[0],activeMonth:next[1],activeDay:next[2]})}
    }
    render(){
      let {size} = this.context,{icon,sign} = this.props;
      return (<div className='aio-input-datepicker-arrow' style={{width:size / 6,height:size / 6}} onClick={()=>this.change(sign)}>{icon}</div>)
    }
  }
  