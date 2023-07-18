import React,{Component} from 'react';
import {Icon} from '@mdi/react';
import {mdiClose,mdiPlusThick} from '@mdi/js';
import AIOInput from './aio-input';
import AITableContext from './table-context';
import './table.css';

export default class Table extends Component{
    constructor(props){
      super(props);
      let {columns = []} = props;
      this.state = {columns:columns.map((o)=>{return {...o,_id:'aitc' + Math.round(Math.random() * 1000000)}})}
    }
    getDynamics(key,row,column,def){
      if(key === undefined){return def}
      if(typeof key === 'function'){return key({row,column})}
      let result = key;
      if(typeof key === 'string'){
        let {getValue = {}} = this.props;
        if(getValue[key]){result = getValue[key]({row,column})}
        else if(key.indexOf('row.') !== -1){
          try {
            let evalText = `result = ${key}`;
            eval(evalText);
          }
          catch{result = ''}
        }
      }
      if(result === undefined){result = def}
      return result;
    }
    add(){
      let {rows,onChange,add} = this.props;
      if(typeof add === 'function'){add();}
      else if(add !== undefined){onChange([add,...rows]);} 
    }
    remove(row,index){
      let {rows,onChange,remove} = this.props;
      if(typeof remove === 'function'){remove(row);}
      else if(remove === true){onChange(rows.filter((o,i)=>{
        if(Array.isArray(o)){return i !== index}
        if(typeof o === 'object'){return o._id !== row._id}
        return row !== o
      }));} 
    }
    isAddable(){
      let {onChange,add} = this.props;
      if(typeof add === 'function'){
        return true
      }
      else{
        return add !== undefined && typeof onChange === 'function'   
      }
    }
    isRemovable(){
      let {remove} = this.props;
      if(typeof remove === 'function'){return true}
      return remove === true; 
    }
    change(value,field,row){
      let {onChange,rows} = this.props;
      row = JSON.parse(JSON.stringify(row));
      let evalText = `${field} = value`;
      eval(evalText);
      onChange(rows.map((o)=>o._id !== row._id?o:row))
    }
    dragStart(e,row){
      this.start = row;
    }
    dragOver(e,row){
      e.preventDefault();
    }
    getIndexById(id){
      let {rows} = this.props;
      for(let i = 0; i < rows.length; i++){
        if(rows[i]._id === id){return i}
      }
    }
    drop(e,row){
      if(this.start.id === undefined){return}
      if(this.start.id === row._id){return}
      let {onChange,rows} = this.props;
      let newRows = rows.filter((o)=>o._id !== this.start.id);
      let placeIndex = this.getIndexById(row._id);
      newRows.splice(placeIndex,0,this.start)
      onChange(newRows)
    }
    getContext(){
      let {onChange} = this.props;
      let {columns} = this.state;
      let context = {
        columns,getDynamics:this.getDynamics.bind(this)
      }
      if(this.isAddable()){context.add = this.add.bind(this) }
      if(this.isRemovable()){context.remove = this.remove.bind(this)}
      if(typeof onChange === 'function'){
        context = {
          ...context,
          change:this.change.bind(this),
          dragStart:this.dragStart.bind(this),
          dragOver:this.dragOver.bind(this),
          drop:this.drop.bind(this)
        }
      }
      return context
    }
    
    render(){
      let {rows,header,style} = this.props;
      let Toolbar = <TableToolbar header={header}/>;
      let Header = <TableHeader/>;
      let Rows = <TableRows rows={rows}/>;
      return (
        <AITableContext.Provider value={this.getContext()}>
          <div className='aio-input-table' style={style}>
            {Toolbar}
            <div className='aio-input-table-unit'>
              {Header}
            
              {Rows}
            </div>
          </div>  
        </AITableContext.Provider>
      )
    }
  }
  class TableRows extends Component{
    static contextType = AITableContext;
    getRows(){
      let {rows} = this.props;
      return rows.map((o,i)=>{
        let {_id = 'ailr' + Math.round(Math.random() * 10000000)} = o;
        o._id = _id;
        let isLast = i === rows.length - 1;
        return <TableRow key={_id} row={o} rowIndex={i} isLast={isLast}/>
      })
    }
    render(){
      let Rows = this.getRows()
      return <div className='aio-input-table-rows'>{Rows}</div>
    }
  }
  class TableToolbar extends Component{
    static contextType = AITableContext;
    render(){
      let {add} = this.context;
      let {header} = this.props;
      if(!add && !header){return null}
      return (
        <>
          <div className='aio-input-table-toolbar'>
            <div className='aio-input-table-toolbar-header'>{header}</div>
            {
              !!add &&
              <div className='aio-input-table-toolbar-add' onClick={()=>add()}>
                <Icon path={mdiPlusThick} size={0.8}/>
              </div>
            }  
          </div>
          <div className='aio-input-table-border-h'></div>
        </>
      )
    }
  }
  class TableHeader extends Component{
    static contextType = AITableContext;
    getTitles(columns){
      return columns.map((o,i)=><TableTitle key={o._id} column={o} isLast={i === columns.length - 1}/>)
    }
    getRemoveTitle(remove){
      if(!remove){return null}
      return <button className='aio-input-table-remove'></button>
    }
    render(){
      let {remove,columns} = this.context;
      let Titles = this.getTitles(columns);
      let RemoveTitle = this.getRemoveTitle(remove);
      return (
        <>
          <div className='aio-input-table-header'>{Titles}{RemoveTitle}</div>
          <div className='aio-input-table-border-h'></div>
        </>
      )
    }
  }
  class TableTitle extends Component{
    static contextType = AITableContext;
    render(){
      let {getDynamics} = this.context;
      let {column,isLast} = this.props;
      let size = getDynamics(column.size);
      let title = getDynamics(column.title,undefined,undefined,'');
      let justify = getDynamics(column.justify);
      let minSize = getDynamics(column.minSize);
      return (
        <>
          <div 
            className={'aio-input-table-title' + (justify?' aio-input-table-title-justify':'')} 
            style={{width:size?size:undefined,flex:size?undefined:1,minWidth:minSize}}
          >{title}</div>
          {!isLast && <div className='aio-input-table-border-v'></div>}
        </>
      )
    }
  }
  class TableRow extends Component{
    static contextType = AITableContext;
    getCells(columns,row){
      let {change,getDynamics} = this.context;
      return columns.map((column,i)=>{
        let {size,minSize,cellAttrs,justify,template,subtext,before,after,type,options} = column;
        let GetDynamics = (key,def)=>getDynamics(key,row,column,def);
        let value = GetDynamics(column.value);
        let onChange;
        if(column.onChange){onChange = (value)=>column.onChange({value,row,column})}
        else if(change){onChange = (value)=>change(value,column.value,row)}
        let key = row._id + ' ' + column._id;
        return (
          <TableCell 
            {...column}
            options={GetDynamics(options)}
            size={GetDynamics(size)}
            minSize={GetDynamics(minSize)}
            type={GetDynamics(type,'text')}
            attrs={GetDynamics(cellAttrs,{})}
            justify={GetDynamics(justify)}
            template={GetDynamics(template)}
            subtext={GetDynamics(subtext)}
            before={GetDynamics(before)}
            after={GetDynamics(after)}
            onChange={onChange}
            key={key}  
            row={row} column={column} value={value}
            isLast={i === columns.length - 1}
          />
        )
      })
    }
    getRemoveCell(row){
      let {remove} = this.context;
      if(!remove){return null}
      return <button className='aio-input-table-remove' onClick={()=>remove(row)}><Icon path={mdiClose} size={0.8}/></button>
    }
    getProps(row){
      let {dragStart,dragOver,drop} = this.context;
      let props = {
        className:'aio-input-table-row'
      }
      if(!!dragStart){
        props = {
          ...props,
          draggable:true,
          onDragStart:(e)=>dragStart(e,row),
          onDragOver:(e)=>dragOver(e,row),
          onDrop:(e)=>drop(e,row)
        }
      }
      return props;
    }
    render(){
      let {columns} = this.context;
      let {row,isLast} = this.props;
      let cells = this.getCells(columns,row);
      let removeCell = this.getRemoveCell(row);
      let props = this.getProps(row);
      return (
        <>
          <div {...props}>{cells}{removeCell}</div>
          {!isLast && <div className='aio-input-table-border-h'></div>}
        </>
      )
    }
  }
  class TableCell extends Component{
    static contextType = AITableContext;
    getProps(){
      let {size,minSize,attrs,justify,isLast} = this.props;
      return {
        ...attrs,isLast,
        className:'aio-input-table-cell' + (justify?' aio-input-table-cell-justify':'') + (attrs.className?' ' + attrs.className:''),
        style:{width:size?size:undefined,flex:size?undefined:1,...attrs.style,minWidth:minSize},
      }
    }
    getInputProps(){
      let {value,onChange,subtext,before,after,type,options,row} = this.props;
      return {
        ...this.props,
        subtext,before,after,type,value,onChange,options
      }
    }
    getContent(){
      let {column,template} = this.props;
      if(template !== undefined){return template}
      let inputProps = this.getInputProps(column);
      return <AIOInput {...inputProps}/>
    }
    render(){
      let props = this.getProps();
      return (
        <>
          <div {...props} >
            {this.getContent()}    
          </div>
          {!props.isLast && <div className='aio-input-table-border-v'></div>}
        </>
      )
    }
  }
  