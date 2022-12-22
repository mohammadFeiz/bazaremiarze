import React,{Component,createContext} from 'react';
import AIOButton from './../../npm/aio-button/aio-button';
import dateCalculator from './../../npm/aio-date/aio-date';
import './index.css';
export default class GAH extends Component{
  constructor(props){
    super(props);
    let {startYear,endYear} = this.props;
    this.state = {years:this.getYears(),prevStartYear:startYear,prevEndYear:endYear};
  }
  getYears(){
    let start,end;
    let {calendarType,startYear,endYear} = this.props;
    let today = dateCalculator().getToday(calendarType);
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
  validateValue(value){
    let {years} = this.state;
    let Value,{unit,calendarType} = this.props;
    let {getToday,getMonthDaysLength,getSplitter} = dateCalculator();
    let today = getToday(calendarType);
    let splitter = '/';
    if(typeof value === 'string' && value){
      splitter = getSplitter(value);
      Value = value.split(splitter).map((o)=>o)
      let [year = today[0],month = 1,day = 1,hour = 0] = Value
      year = +year; month = +month; day = +day; hour = +hour;
      year = isNaN(year)?today[0]:year;
      month = isNaN(month)?1:month;
      day = isNaN(day)?1:day;
      hour = isNaN(hour)?0:hour;
      Value = [+year,+month,+day,+hour];
    }
    else {Value = today;}  
    var [year,month,day,hour] = Value;
    if(year < years[0]){year = years[0];}
    if(year > years[years.length - 1]){year = years[years.length - 1];}
    if(month < 1){month = 1;}
    if(month > 12){month = 12;}
    if(unit === 'day' || unit === 'hour'){
      var daysLength = getMonthDaysLength([year,month],calendarType);
      if(day > daysLength){day = daysLength;}
      if(day < 1){day = 1;}
      if(unit === 'hour'){
        if(hour > 23){hour = 23}
        if(hour < 0){hour = 0}
      }
      else {
        hour = undefined;
      }
    }
    else if(unit === 'month'){day = undefined; hour = undefined;}
    return {year,month,day,hour,splitter};
  }
  render(){
    let {type,startYear,endYear} = this.props;
    let {years,prevStartYear,prevEndYear} = this.state;
    if(startYear !== prevStartYear || endYear !== prevEndYear){
      setTimeout(()=>this.setState({years:this.getYears(),prevStartYear:startYear,prevEndYear:endYear}),0)
    }
    let props = {years,validateValue:this.validateValue.bind(this)}
    return <GAHBase {...this.props} {...props}/>
  }
}
GAH.defaultProps = {
  size:180,calendarType:'gregorian',disabled:false,
  startYear:'-10',endYear:'+20',unit:'day',translate:(text)=>text,
  setDisabled:()=>false
}
class GAHBase extends Component{
  constructor(props){
    super(props);
    var {value,validateValue} = this.props;
    this.state = {prevValue:JSON.stringify(value),...validateValue(value)};
  }
  getDateDetails(o = [],unit = this.props.unit){
    let {splitter} = this.state;
    let [year = this.state.year,month = this.state.month || 1,day = this.state.day || 1,hour = this.state.hour || 0] = o;
    var {calendarType,years} = this.props;
    let {getWeekDay,getToday,getWeekDays,getMonths,jalaliToGregorian,isLess,isGreater,isEqual,isBetween} = dateCalculator();
    var {weekDay,index:weekDayIndex} = getWeekDay([year,month,day],calendarType);
    var {weekDay:monthFirstDayWeekDay} = getWeekDay([year,month,1],calendarType);
    var today = getToday(calendarType,unit);
    var {weekDay:todayWeekDay,index:todayWeekDayIndex} = getWeekDay(today,calendarType);
    var extra = {};
    var months = getMonths(calendarType);
    if(calendarType === 'jalali'){
      let gregorian = jalaliToGregorian([year,month,unit === 'month'?1:day])
      let todayGregorian = jalaliToGregorian(today);
      let weekDayGregorian = getWeekDay(gregorian,'gregorian').weekDay;
      let monthStringGregorian = getMonths('gregorian')[gregorian[1] - 1];
      extra = {gregorian,todayGregorian,weekDayGregorian,monthStringGregorian};
    }
    let dateString = year + splitter + month;
    if(unit === 'month'){dateString = year + splitter + month}
    else if(unit === 'day'){dateString = year + splitter + month + splitter + day}
    else if(unit === 'hour'){dateString = year + splitter + month + splitter + day + splitter + hour}
    return {
      year,month,day,hour,weekDay,weekDayIndex,monthFirstDayWeekDay,
      year2Digit:year.toString().slice(2,4),month2Digit:month < 10?'0' + month:month.toString(),
      day2Digit:day < 10?'0' + day:day.toString(),
      weekDays:getWeekDays(calendarType),
      monthString:months[month - 1],
      todayMonthString:months[today[1] - 1],
      startYear:years[0],endYear:years[years.length - 1],
      dateString,
      fullDateString:year + splitter + month + splitter + day + ' ' + weekDay,
      today,todayWeekDay,todayWeekDayIndex,...extra,
      isLess:(o)=>isLess([year,month,day,hour],o),
      isGreater:(o)=>isGreater([year,month,day,hour],o),
      isEqual:(o)=>isEqual([year,month,day,hour],o),
      isBetween:(a,b)=>isBetween([year,month,day,hour],[a,b]),
    }
  }
  SetState(obj,sendChanges){
    var {onChange,type} = this.props;
    let callback = ()=>{};
    if(sendChanges && onChange){
      callback = ()=>onChange(this.details)
    }
    this.setState(obj,callback);
  }
  componentDidUpdate(){
    if(this.update){
      let {value,validateValue} = this.props;
      let obj = validateValue(value);
      this.setState({...obj,activeYear:obj.year,activeMonth:obj.month,activeDay:obj.day})
    }
  }
  getPopup(){
    return (
        <GAHDatePickerPopup 
          {...this.props} {...this.state}
          SetState={this.SetState.bind(this)}
          details={this.details}
          getDateDetails={this.getDateDetails.bind(this)}
        />
      
    )
  }
  swipe(dy){
    if(this.lastSwipe !== undefined && dy === this.lastSwipe){return}
    this.lastSwipe = dy;
    var {calendarType,unit,disabled} = this.props;
    let {getByOffset,isMatch} = dateCalculator();
    if(!this.startSwipe){
      let {year,month,day,hour} = this.state;
      this.startSwipe = [year,month,day,hour]
    }
    let [year,month,day,hour] = getByOffset({date:this.startSwipe,offset:dy,unit,calendarType});
    if(isMatch([year,month,day,hour],disabled,calendarType)){return}
    this.setState({year,month,day,hour})
  }
  getValue(){
    let {calendarType,unit,value,placeHolder,editValue = (text)=>text} = this.props;
    let {splitter,year,month,day,hour} = this.state;
    if(!value){
      if(placeHolder){return placeHolder}
      return calendarType === 'gregorian'?'Select Date':'انتخاب تاریخ'; 
    }
    if(unit === 'hour'){return editValue(year + splitter + month + splitter + day + ' ' + hour + ':00')}
    if(unit === 'day'){return editValue(year + splitter + month + splitter + day)}
    if(unit === 'month'){return editValue(dateCalculator().getMonths(calendarType)[month - 1] + ' ' + year);}
  }
  render(){
    this.update = false;
    var {calendarType,className,icon,onChange = ()=>{},justCalendar,swipe} = this.props;
    if(JSON.stringify(this.props.value) !== this.state.prevValue){
      this.state.prevValue = JSON.stringify(this.props.value);
      this.update = true;
    }
    this.details = this.getDateDetails();
    if(justCalendar){
      return this.getPopup()
    }
    return (
        <AIOButton 
          {...this.props}
          onSwipe={swipe?(dx,dy)=>this.swipe(Math.floor(dy / 6)):undefined}
          onSwipeEnd={swipe?()=>{
            this.lastSwipe = undefined;
            this.startSwipe = undefined;
            onChange(this.details);
          }:undefined}
          disabled={false}
          before={icon?icon:undefined}
          type='button'
          className={'gah' + (className?' ' + className:'')}
          text={this.getValue()}
          rtl={calendarType === 'jalali'}
          popupAttrs={{style:{border:'none'},className:'gah-popup-container'}}
          popOver={()=>this.getPopup()}
        />
    )
  }
}
var GAHContext = createContext();
class GAHDatePickerPopup extends Component {
  getTodayText(){
    let {unit,calendarType} = this.props;
    return {
      hourjalali:'ساعت کنونی',hourgregorian:'This Hour',dayjalali:'امروز',daygregorian:'Today',monthjalali:'ماه جاری',
      monthgregorian:'This Month',yearjalali:'سال جاری',yeargregorian:'This Year'
    }[unit + (calendarType)];
  }
  getPopupStyle(){
    var {size,disabled,theme = []} = this.props;
    return {width:size,fontSize:size / 17,cursor:disabled === true?'not-allowed':undefined,background:theme[1],color:theme[0],stroke:theme[0]};
  }
  log(){
      console.log(this.props)
  }
  render(){
    var {details,activeYear = details.year,activeMonth = details.month,activeDay = details.day,details} = this.props;
    var context = {...this.props,todayText:this.getTodayText()}
    let active = [activeYear,activeMonth,activeDay];
    return (
      <GAHContext.Provider value={context}>
        <div className='gah-popup' style={{display:'flex'}} onDoubleClick={()=>this.log()}>
          <div className='gah-calendar' style={this.getPopupStyle()}>
            <GAHHeader active={active}/>
            <GAHBody active={active}/>
            <GAHFooter/>
          </div>
          <GAHToday details={details}/>
        </div>
      </GAHContext.Provider>
    );
  }
}
class GAHToday extends Component{
  static contextType = GAHContext;
  render(){
    let {calendarType,size,unit,theme = [],todayText} = this.context;
    let {details} = this.props;
    let month = details.todayMonthString;
    let week = details.todayWeekDay;
    let today = details.today;
    return (
      <div className='gah-today' style={{width:size / 2,color:theme[1],background:theme[0]}}>
        <div style={{fontSize:size / 13}}>{todayText}</div>
        {
          (unit === 'day' || unit === 'hour') &&
          <>
            <div style={{fontSize:size / 11}}>{calendarType === 'gregorian'?week.slice(0,3):week}</div>
            <div style={{fontSize:size / 12 * 4,height:size/12 * 4}}>{today[2]}</div>
            <div style={{fontSize:size / 11}}>{calendarType === 'gregorian'?month.slice(0,3):month}</div>
          </>
        }
        {unit === 'month' && <div style={{fontSize:size / 8}}>{calendarType === 'gregorian'?month.slice(0,3):month}</div>}
        <div style={{fontSize:size / 11}}>{today[0]}</div>
        {unit === 'hour' && <div style={{fontSize:size / 10}}>{today[3] + ':00'}</div>}
      </div>
    )
  }
}
class GAHFooter extends Component{
  static contextType = GAHContext;
  onToday(){
    var {unit,calendarType,SetState} = this.context;
    var [year,month,day] = dateCalculator().getToday(calendarType);
    if(unit === 'month'){day = 1;}
    SetState({activeYear:year,activeMonth:month,activeDay:day});
  }
  render(){
    let {onClear,disabled,size,calendarType,todayText} = this.context;
    if(disabled){return null}
    let buttonStyle = {padding:`${size / 20}px 0`};
    return (
      <div className='gah-footer' style={{fontSize:size / 13}}>
        {
          onClear &&  
          <button className='gah-button' style={buttonStyle} onClick={()=>onClear()}>
            {{'gregorian':'Clear','jalali':'حذف'}[calendarType]}
          </button>
        }
        <button className='gah-button' style={buttonStyle} onClick={()=>this.onToday()}>{todayText}</button>
      </div>
    )
  }
}
class GAHBody extends Component{
  static contextType = GAHContext;
  getStyle(){
    let {size,calendarType,unit} = this.context;
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
    let {unit} = this.context;
    let {active} = this.props;
    return (
      <div className='gah-body' style={this.getStyle()}>
        {unit === 'hour' && new Array(24).fill(0).map((o,i)=><GAHCell key={'cell' + i} dateArray={[active[0],active[1],active[2],i]}/>)}
        {unit === 'day' && <GAHBodyDay active={active}/>}
        {unit === 'month' && new Array(12).fill(0).map((o,i)=><GAHCell key={'cell' + i} dateArray={[active[0],i + 1]}/>)}
      </div>
    )
  }
}
class GAHBodyDay extends Component{
  static contextType = GAHContext;
  render(){
    let {calendarType,theme = []} = this.context;
    let {active} = this.props;
    let firstDayWeekDayIndex = dateCalculator().getWeekDay([active[0],active[1],1],calendarType).index;
    var daysLength = dateCalculator().getMonthDaysLength([active[0],active[1]],calendarType);
    let weekDays = dateCalculator().getWeekDays(calendarType);
    return (<>
      {weekDays.map((name,i)=><GAHCell_Weekday key={'weekday' + i} name={name}/>)}
      {new Array(firstDayWeekDayIndex).fill(0).map((o,i)=><div key={'space' + i} className='gah-space gah-cell' style={{background:theme[1]}}></div>)}
      {new Array(daysLength).fill(0).map((o,i)=><GAHCell key={'cell' + i} dateArray={[active[0],active[1],i + 1]}/>)}
      {new Array(42 - (firstDayWeekDayIndex + daysLength)).fill(0).map((o,i)=><div key={'endspace' + i} className='gah-space gah-cell' style={{background:theme[1]}}></div>)}
    </>)
  }
}
class GAHCell_Weekday extends Component{
  static contextType = GAHContext;
  render(){
    let {calendarType,theme = []} = this.context;
    let {name} = this.props;
    return (
      <div className='gah-weekday gah-cell' style={{background:theme[1],color:theme[0]}}>
        <span>{name.slice(0,calendarType === 'gregorian'?2:1)}</span>
      </div>
    )
  }
}
class GAHCell extends Component{
  static contextType = GAHContext;
  getClassName(isActive,isToday,isDisabled,className){
    var str = 'gah-cell';
    if(isDisabled){str += ' gah-disabled'}
    if(isActive){str += ' gah-active';}
    if(isToday){str += ' today';}
    if(className){str += ' className';}
    return str;
  }
  render(){
    let {unit,SetState,theme = [],onChange,dateAttrs,disabled,calendarType,getDateDetails,year,month,day,hour,value} = this.context;
    let {dateArray} = this.props;
    let {isEqual,isMatch,getMonths,getToday} = dateCalculator();
    let isActive = !value?false:isEqual(dateArray,[year,month,day,hour])
    let isToday = isEqual(dateArray,getToday(calendarType))
    let isDisabled = isMatch(dateArray,disabled)
    let attrs = {}
    if(dateAttrs){attrs = dateAttrs({...getDateDetails(dateArray),isToday,isDisabled,isActive,isMatch:(o)=>isMatch(dateArray,o)}) || {}}
    let className = this.getClassName(isActive,isToday,isDisabled,attrs.className);
    let onClick = isDisabled || !onChange?undefined:()=>{SetState({year:dateArray[0],month:dateArray[1],day:dateArray[2],hour:dateArray[3]},true)};
    let style = {} 
    if(!isDisabled){style.background = theme[1];}
    if(className.indexOf('gah-active') !== -1){
      style.background = theme[0];
      style.color = theme[1];
    }
    if(className.indexOf('today') !== -1){style.border = `1px solid ${theme[0]}`}
    style = {...style,...attrs.style}
    let text;
    if(unit === 'hour'){text = dateArray[3] + ':00'}
    else if(unit === 'day'){text = dateArray[2]}
    else if(unit === 'month'){
      let months = getMonths(calendarType);
      text = calendarType === 'gregorian'?months[dateArray[1] - 1].slice(0,3):months[dateArray[1] - 1]
    }
    return <div style={style} onClick={onClick} className={className}>{isDisabled?<del>{text}</del>:text}</div>
  }
}
class GAHHeader extends Component{
  static contextType = GAHContext;
  getYears([activeYear,activeMonth,activeDay]){
    let {years,SetState} = this.context;
    let props = {value:activeYear,options:years,optionText:'option.toString()',optionValue:'option',
    onChange:(activeYear)=>{SetState({activeYear})}}
    return (<GAHHeaderDropdown {...props}/>)
  }
  getMonths([activeYear,activeMonth,activeDay]){
    let {calendarType,SetState} = this.context;
    let props = {value:activeMonth,options:dateCalculator().getMonths(calendarType),optionText:calendarType === 'gregorian'?'option.slice(0,3)':'option',optionValue:'index + 1',
    onChange:(activeMonth)=>{SetState({activeMonth})}}
    return (<GAHHeaderDropdown {...props}/>)
  }
  getDays([activeYear,activeMonth,activeDay]){
    let {calendarType,SetState} = this.context;
    let daysLength = dateCalculator().getMonthDaysLength([activeYear,activeMonth],calendarType);
    let options = new Array(daysLength).fill(0).map((o,i)=>{return {text:(i + 1).toString(),value:i + 1}})
    let props = {value:activeDay,options,onChange:(activeDay)=>SetState({activeDay})}    
    return (<GAHHeaderDropdown {...props}/>)
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
    let {unit,size,calendarType} = this.context;
    let {active} = this.props;
    var sign = calendarType === 'gregorian'?1:-1;
    return (
      <div className='gah-header' style={{height:size / 4}}>
        <GAHHeaderArrow sign={-sign} icon={this.getIcon('minus')} active={active}/>
        <div className='gah-select' style={{fontSize:Math.floor(size / 12)}}>
          {this.getYears(active)}
          {(unit === 'day' || unit === 'hour')?this.getMonths(active):null}
          {(unit === 'hour')?this.getDays(active):null}
        </div>
        <GAHHeaderArrow sign={sign} icon={this.getIcon('plus')} active={active}/>
      </div>
    )
  }
}
class GAHHeaderDropdown extends Component{
  static contextType = GAHContext;
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
class GAHHeaderArrow extends Component{
  static contextType = GAHContext;
  change(offset,[activeYear,activeMonth,activeDay]){
    let {unit,calendarType,years,SetState} = this.context;
    let date = [activeYear,activeMonth,activeDay]
    let next = dateCalculator().getByOffset({date,offset,unit:{'hour':'day','day':'month','month':'year'}[unit],calendarType})
    if(next[0] > years[years.length - 1]){return}
    if(next[0] < years[0]){return}
    if(unit === 'month'){SetState({activeYear:next[0]})}
    if(unit === 'day'){SetState({activeYear:next[0],activeMonth:next[1]})}
    if(unit === 'hour'){SetState({activeYear:next[0],activeMonth:next[1],activeDay:next[2]})}
  }
  render(){
    let {size} = this.context,{icon,sign,active} = this.props;
    return (<div className='gah-arrow' style={{width:size / 6,height:size / 6}} onClick={()=>this.change(sign,active)}>{icon}</div>)
  }
}
