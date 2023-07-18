import React,{Component} from 'react';
import Calendar from './calendar';
import AIContext from './context';
export default class DatePicker extends Component{
  static contextType = AIContext;
  render(){
    let {getProp} = this.context;
    let unit = getProp('unit','day');
    let onChange = getProp('onChange',()=>{});
    let calendarType = getProp('calendarType','gregorian');
    let disabled = getProp('disabled',false);
    let value = getProp('value');
    let onClear = getProp('onClear');
    let startYear = getProp('startYear');
    let endYear = getProp('endYear');
    let dateAttrs = getProp('dateAttrs');
    let theme = getProp('theme');
    let size = getProp('size');
    return (
      <Calendar 
        {...{
          unit,calendarType,disabled,value,onChange,
          onClear,startYear,endYear,
          theme,size,dateAttrs
        }}
      />
    )
  }
}