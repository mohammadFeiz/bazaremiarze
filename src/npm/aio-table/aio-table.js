import React,{Component,createContext,createRef} from 'react';
import {Icon} from '@mdi/react';
import {mdiChevronLeft,mdiChevronRight,mdiChevronDown,mdiClose,mdiMagnify,mdiEye,mdiFilter,mdiFilterMenu,mdiSort,mdiArrowDown,mdiArrowUp,mdiFileTree,mdiFileExcel,
mdiChevronDoubleRight,mdiChevronDoubleLeft,mdiCircleMedium} from '@mdi/js';
import AIOButton from './../../npm/aio-button/aio-button';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import $ from 'jquery';
import './index.css';
let TableContext = createContext();
let TableCLS = {
  row:'row',header:'table-header',title:'table-title',resizeHandle:'title-resize-handle',rows:'rows',table:'aio-table',toolbarIconButton:'toolbar-icon',searchBox:'aio-table-search',
  toolbar:'table-toolbar',rowToggle:'table-toggle',cellBefore:'cell-before',cellAfter:'cell-after',cellContent:'cell-content',cellSubtext:'cell-subtext',cell:'aio-table-cell',
  filterPopup:'table-filter-popup',loading:'table-loading',addFilter:'table-filter-add',filterOperator:'table-filter-operator',filterItem:'table-filter-item',
  filterValue:'table-filter-value',filterRemove:'table-filter-remove',groupRow:'table-group-row',inlineEditInput:'table-inline-edit-input',
  freezeContainer:'table-freeze-container',unfreezeContainer:'table-unfreeze-container',splitter:'table-splitter',paging:'table-paging',
  toolbarPopupHeader:'toolbar-popup-header',rowTemplate:'row-template',toolbarItem:'table-toolbar-item'
}
export default class Table extends Component {
  constructor(props) {
    super(props);
    this.dom = createRef();
    $('body').on('focus','.' + TableCLS.inlineEditInput,(e)=>{$(e.target).select()})
    this.getSearchs = functions.getSearchs.bind(this);
    this.getFilterResult = functions.getFilterResult.bind(this);
    this.isRowOpen = functions.isRowOpen.bind(this);
    this.onScroll = functions.onScroll.bind(this);
    let openDictionary = {};
    if(props.getRowId && props.tableId){
      openDictionary = localStorage.getItem('tableopendic' + props.tableId);
      if(!openDictionary || openDictionary === null){
        localStorage.setItem('tableopendic' + props.tableId,'{}')
      }
      else{
        openDictionary = JSON.parse(openDictionary)
      }
    }
    this.state = {
      openDictionary,filters:[],searchText:'',touch:'ontouchstart' in document.documentElement,
      groupsOpen:{},rowHeight:props.rowHeight,freezeSize:240,paging:props.paging,
      getValueByField:functions.getValueByField,
      Excel:Excel(()=>this.props),
      Sort:Sort(()=>this.props,()=>this.state,this.setColumns.bind(this)),
      Group:Group(()=>this.props,()=>this.state,this.setColumns.bind(this)),
      columns:(props.columns || []).map((c)=>{return {...c}}),
      prevColumns:JSON.stringify(props.columns),
      saveColumnInStorage:this.saveColumnInStorage.bind(this),
      setColumn:this.setColumn.bind(this)
    }
    this.updateColumnsByStorageKey()
  }
  translate(text){
    let {translate = (o)=>o,lang} = this.props;
    if(lang){
      if(lang === 'farsi'){
        text = {
          'Search':'جستجو','Contain':'شامل','Not Contain':'غیر شامل','Equal':'برابر','Not Equal':'مخالف','Greater Than':'بزرگتر از','Less Than':'کوچکتر از',
          'and':'و','or':'یا','Add':'افزودن','Inter Excel File Name':'نام فایل اکسل را وارد کنید','Sort By':'مرتب سازی بر اساس','Show Columns':'نمایش ستون ها',
          'Group By':'گروه بندی بر اساس',
        }[text];
      }
      else if(lang === 'english'){}
      else {console.error('aio-table => lang props should be "english" or "farsi"');}
    }
    return translate(text) || text;
  }
  updateColumnsByStorageKey(){
    let {columns = []} = this.state;
    for(let i = 0; i < columns.length; i++){
      let column = columns[i];
      let {storageKey} = column;
      if(!storageKey){continue}
      let storageObj = localStorage.getItem('tablecolumnstorage' + storageKey) || '{}';
      storageObj = JSON.parse(storageObj);
      if(!column.group){storageObj.group = undefined}
      if(!column.sort){storageObj.sort = undefined}
      if(!column.toggle){storageObj.show = undefined}
      if(!column.resizable){storageObj.width = undefined}
      localStorage.setItem('tablecolumnstorage' + storageKey,JSON.stringify(storageObj));
      this.setColumn(column,{_storageObj:storageObj})
      for(let prop in storageObj){column[prop] = storageObj[prop]}
    }
  }
  saveColumnInStorage(column,key,value){
    if(!column.storageKey){return}
    let storageObj = {...column._storageObj};
    storageObj[key] = value;
    this.setColumn(column,{_storageObj:storageObj})
    localStorage.setItem('tablecolumnstorage' + column.storageKey,JSON.stringify(column._storageObj));
  }
  setColumns(columns){
    this.setState({columns})
  }
  setColumn(column,obj){
    for(let prop in obj){column[prop] = obj[prop];}
  }
  getRowById(id){
    return {...this.rows_object[id],_detail:this.details_object[id]}
  }
  getRowDetailById(id){
    if(id === undefined){return false}
    return this.details_object[id]
  }
  getRowDetailsByColumns(row,id){
    let {columns = [],getValueByField} = this.state;
    let cells = [];
    let freezeCells = [];
    let unfreezeCells = [];
    let values = {};
    let json = {}
    for(let j = 0; j < columns.length; j++){
      let column = columns[j];
      if(column.show === false){continue}
      let value = getValueByField(row,column);
      values[column.dataColumnId] = value;
      json[column.title] = value === undefined?'':value;
      let cell = (striped)=>{
        let {_show} = this.getRowDetailById(id);
        if(_show === false){return null}
        if(!this.isRowOpen(id)){return null}
        let {width,flex,minWidth = 3,dataColumnId} = column;
        let {hide_xs,hide_sm,hide_md,hide_lg,show_xs,show_sm,show_md,show_lg} = column;
        if(width === undefined && flex === undefined){flex = 1;}
        return {
          html:<Cell striped={striped} key={id + dataColumnId + column.freeze} colId={j} rowId={id} column={column} value={value}/>,
          size:width,flex,minWidth,attrs:{'data-column-id':dataColumnId},
          hide_xs,hide_sm,hide_md,hide_lg,show_xs,show_sm,show_md,show_lg
        }
      };
      if(column.freeze){this.freezeMode = true; freezeCells.push(cell)}
      else{unfreezeCells.push(cell)}  
      cells.push(cell);
    }
    return {cells,freezeCells,unfreezeCells,values,json}
  }
  getRowId(row){
    if(row._id === undefined){
      let {getRowId} = this.props;
      if(getRowId){
        let {getValueByField} = this.state;
        return getValueByField(row,undefined,getRowId)
      }
      else {return 'row' + Math.random()}
    }
    else{return row._id;}
  }
  getModelDetails_req(model = [], parents) {
    let {rowChilds} = this.props;
    let {getValueByField} = this.state;
    for (let i = 0; i < model.length; i++) {
      let detail = {};
      let row = model[i];
      let id = this.getRowId(row);  
      row._id = id;
      detail._id = id;
      let {cells,freezeCells,unfreezeCells,values,json} = this.getRowDetailsByColumns(row,id)
      detail._json = json;
      detail._cells = cells;
      detail._freezeCells = freezeCells;
      detail._unfreezeCells = unfreezeCells;
      detail._values = values;
      detail._show = this.getFilterResult(row,detail);
      this.rows_object[id] = row;
      this.rows_array.push(row);
      this.details_object[id] = detail;
      if(rowChilds){
        let childs = getValueByField(row,undefined,rowChilds) || [];
        detail._childs = childs;
        detail._parentIds = parents.map((o)=>o._id);
        detail._parentId = detail._parentIds[detail._parentIds.length - 1]
        if(detail._show){
          for(let j = 0; j < detail._parentIds.length; j++){
            let parentId = detail._parentIds[j];
            let parentRowDetail = this.details_object[parentId];
            if(parentRowDetail._show === false){parentRowDetail._show = 'relative'}
          }
        }
        if (childs.length) {this.getModelDetails_req(childs, parents.concat(row));}
      }
    }
  }
  getTreeDetails(model = [],level,parents,nestedIndex) {
    let childIndex = 0;
    let {openDictionary} = this.state;
    for (let i = 0; i < model.length; i++) {
      let row = model[i];
      let detail = this.details_object[row._id];
      let parentDetail = this.details_object[detail._parentId];
      detail._level = level;
      detail._open = openDictionary[row._id] === undefined?true:openDictionary[row._id];
      detail._nestedIndex = nestedIndex.concat(i);
      detail._getParents = () => parents;
      detail._isLastChild = ()=>{
        let detail = this.details_object[row._id];
        let {_parentId,_id} = detail;
        let res = false;
        if(_parentId !== undefined){
          let {_lastChildId} = this.details_object[_parentId];
          res = _lastChildId === _id;
        }
        return res;
      }
      if(detail._show !== false){
        detail._childIndex = childIndex;
        detail._isFirstChild = ()=> detail._childIndex === 0;
        childIndex++;
        detail._renderIndex = this.rowRenderIndex;
        this.rowRenderIndex++;
        if(parentDetail){
          parentDetail._lastChildId = detail._id;
        }
      }
      if (detail._childs.length) {
        this.getTreeDetails(detail._childs,level + 1,parents.concat(row),detail._nestedIndex);
      }
    }
  }
  getModelDetails(model) {
    let {paging,Group} = this.state;
    let {rowChilds} = this.props;
    if(paging){
      let {number = 1,sizes = [1,5,10,15,20,30,40,50,70,100,150,200],size = sizes[0],length = model.length,onChange} = paging;
      let pages = Math.ceil(length / size);
      paging.sizes = sizes;
      paging.pages = pages;
      paging.size = size;
      paging.number = number;
      if(!onChange){
        let start = (paging.number - 1) * paging.size;
        let end = start + paging.size;
        if(end > length){end = length;}
        model = model.slice(start,end);
      }
    }
    this.details_object = {};
    this.rows_object = {};
    this.rows_array = [];
    this.getModelDetails_req(model, []);
    this.rowRenderIndex = 0;
    if(rowChilds){this.getTreeDetails(model, 0, [], []);}
    this.groups = Group.get();
    if(this.groups.length){this.rows_array = Group.groupBy(this.rows_array.filter((o)=>this.details_object[o._id]._show),this.groups.filter((o)=>o.active))}
  }
  toggleRow(id){
    let {getRowId,tableId} = this.props;
    let {openDictionary} = this.state;
    if(this.details_object[id]._show === 'relative'){return }
    openDictionary[id] = openDictionary[id] === undefined?true:openDictionary[id];  
    openDictionary[id] = !openDictionary[id];
    this.setState({openDictionary})
    if(getRowId && tableId){
      localStorage.setItem('tableopendic' + tableId,JSON.stringify(openDictionary))
    }
  }
  toggle_layout(id,gap){
    let icon;
    let {getToggleIcon,rtl,indent} = this.props;
    let {_childs,_open,_show} = this.details_object[id];
    if(getToggleIcon){icon = getToggleIcon(!!_open)}
    else if(!_childs.length){icon = <Icon path={mdiCircleMedium} size={0.8}/>}
    else {icon=<Icon path={_open?mdiChevronDown:(rtl?mdiChevronLeft:mdiChevronRight)} size={0.8}/>}
    return {
      row:[
        {
          size:indent,className:TableCLS.rowToggle,html:icon,align:'v',
          style:{cursor:_show === 'relative'?'not-allowed':'pointer',background:'rgba(0,0,0,0.03)',height:'100%'},
          attrs:{
            onClick:()=>{
              if(_show === 'relative'){return}
              this.toggleRow(id)
            }
          }
        },
        {size:6}
      ]
    }
  }
  indent_layout(rowId){
    let {indent,rowGap,rowHeight,indentColor = 'lightblue'} = this.props;
    let detail = this.getRowDetailById(rowId);
    if(!detail._level){return false}
    let getPath = () => {
      let dasharray = [1,3];
      let {_level:level,_parentIds,_isLastChild} = detail;
      let isLastChild = _isLastChild();
      let x0 = (indent * (level - 1)) + (indent / 2),x1 = x0 + indent / 2,y0 = 0,y1 = rowHeight / 2 + rowGap,y2 = rowHeight + rowGap;
      let pathes = [];
      pathes.push(<path d={`M${x0} ${y0} L${x0} ${isLastChild?y1:y2} Z`} stroke={indentColor} strokeWidth={1} strokeDasharray={dasharray}></path> )
      pathes.push(<path d={`M${x0} ${y1} L${x1} ${y1} Z`} stroke={indentColor} strokeWidth={1} strokeDasharray={dasharray}></path> )
      for(let i = 1; i < _parentIds.length; i++){
        let {_isLastChild} = this.getRowDetailById(_parentIds[i]);
        if(_isLastChild()){continue}
        let x = ((i - 0.5) * indent);
        pathes.push(<path d={`M${x} ${y0} L${x} ${y2} Z`} stroke={indentColor} strokeWidth={1} strokeDasharray={dasharray}></path>)
      }
      return pathes
    }
    return {
      size:detail._level * indent,style:{height:'100%'},className:'of-visible',
      html:(
        <div style={{width:detail._level * indent,height:'100%',position:'relative'}}>
          <svg width={20} height={20} style={{height:`calc(100% + ${rowGap}px)`,width:'100%',position:'absolute',top:-rowGap}}>
            {getPath(indent,detail)}
          </svg>
        </div>
      )
    }     
  }
  getContext(){
    let {details_object,rows_object,rows_array} = this;
    let {openDictionary} = this.state;
    return {
      ...this.props,openDictionary,
      state:this.state,
      details_object,rows_object,rows_array,
      getRowById:this.getRowById.bind(this),
      getRowDetailById:this.getRowDetailById.bind(this),
      isRowOpen:this.isRowOpen.bind(this),
      SetState:(obj)=>this.setState(obj),
      setColumns:this.setColumns.bind(this),
      getSearchs:this.getSearchs.bind(this),
      toggleRow:this.toggleRow.bind(this),
      indent_layout:this.indent_layout.bind(this),
      toggle_layout:this.toggle_layout.bind(this),
      translate:this.translate.bind(this),
      groups:this.groups
    }
  }
  keyDown(e){
    if(e.keyCode === 27){
      $('.' + TableCLS.inlineEditInput).blur();
    }
    //else if([37,38,39,40].indexOf(e.keyCode) !== -1){this.arrow(e);}
  }
  arrow(e){
    var container = $(this.dom.current);
    var {rtl} = this.context;
    let inputs = container.find('.' + TableCLS.inlineEditInput);
    if(inputs.length === 0){return;}
    let focusedInput = inputs.filter(':focus');
    if(!focusedInput.length){
      inputs.eq(1).focus().select();      
      return;
    }      
    let rowId = focusedInput.attr('data-row-id');
    let colId = focusedInput.attr('data-col-id');
    if(e.keyCode === 40 || e.keyCode === 38){
      let sign = e.keyCode === 40?'next':'prev';
      e.preventDefault();
      let next = inputs[sign](`[data-col-id='${colId}']`);
      if(next.length){next.focus().select();}
    }
    else if(e.keyCode === 39 || e.keyCode === 37){
      e.preventDefault();
      let sign = ((e.keyCode === 37?-1:1) * (rtl?-1:1)) === 1?'next':'prev';
      let next = focusedInput[sign](`[data-row-id='${rowId}']`);
      if(next.length){next.focus().select();}
    }
  }
  toolbar_layout(){return {html:<Toolbar/>}}
  async componentDidMount(){
    this.state.Sort.set()
  }
  units_layout(){
    let {columns} = this.state;
    if(this.freezeMode){
      let {freezeSize} = this.state;
      return {
        flex:1,gap:8,
        row:[
          {
            gapAttrs:{className:TableCLS.splitter},
            size:freezeSize,
            onResize:(freezeSize)=>this.setState({freezeSize}),
            html:<TableUnit onScroll={()=>this.onScroll(0)} cellsType='freezeCells' columns={columns.filter(({freeze})=>freeze)}/>
          },
          {flex:1,html:<TableUnit cellsType='unfreezeCells' columns={columns.filter(({freeze})=>!freeze)} onScroll={()=>this.onScroll(1)}/>}
        ]
      }
    }
    return {flex:1,html:<TableUnit cellsType='cells' columns={columns} onScroll={(e)=>this.onScroll()}/>}
  }
  async changePaging(type,value){
    let {paging} = this.state;
    let {pages,number,size,onChange} = paging;
    let newNumber = number;
    let newSize = size;
    if(type === 'prev'){newNumber = number - 1}
    else if(type === 'next'){newNumber = number + 1}
    else if(type === 'first'){newNumber = 1}
    else if(type === 'last'){newNumber = pages}
    else if(type === 'size'){newSize = value}
    if(newNumber < 1){newNumber = 1}
    if(newNumber > pages){newNumber = pages}
    let newPaging = {...paging,number:newNumber,size:newSize};
    if(onChange){
      let res = await onChange(newPaging);
      if(res !== false){this.setState({paging:newPaging})}
    }
    else {this.setState({paging:newPaging})}
    
  }
  paging_layout(){
    let {paging} = this.state;
    if(!paging){return false}
    let {rtl,model} = this.props;
    let {number = 1,sizes = [1,5,10,15,20,30,40,50,70,100,150,200],size = sizes[0],length = model.length} = paging;
    let pages = Math.ceil(length / size);
    paging.sizes = sizes;
    paging.pages = pages;
    paging.size = size;
    paging.number = number;
    return {
      className:TableCLS.paging,style:{direction:'ltr'},
      row:[
        {flex:1},
        {
          html:<button className={TableCLS.toolbarIconButton}><Icon path={mdiChevronDoubleLeft} size={0.8}/></button>,
          attrs:{onClick:()=>this.changePaging(rtl?'last':'first')}
        },
        {
          html:<button className={TableCLS.toolbarIconButton}><Icon path={mdiChevronLeft} size={0.8}/></button>,
          attrs:{onClick:()=>this.changePaging(rtl?'next':'prev')}
        },
        {html:rtl?pages + ' / ' + number:number + ' / ' + pages,style:{fontSize:12,padding:'0 12px'},align:'vh'},
        {
          html:<button className={TableCLS.toolbarIconButton}><Icon path={mdiChevronRight} size={0.8}/></button>,
          attrs:{onClick:()=>this.changePaging(rtl?'prev':'next')}
        },
        {
          html:<button className={TableCLS.toolbarIconButton}><Icon path={mdiChevronDoubleRight} size={0.8}/></button>,
          attrs:{onClick:()=>this.changePaging(rtl?'first':'last')}
        },
        {
          html:(
            <AIOButton 
              className={TableCLS.toolbarIconButton} type='select' options={sizes} optionValue='option' optionText='option' search={false} caret={false} text={size} optionStyle='{height:24}'
              onChange={(value)=>this.changePaging('size',value)}
            />
          )
        },
        {flex:1}
      ]
    }
  }
  setColumnIds(){
    let {columns = []} = this.state;
    for(let i = 0; i < columns.length; i++){
      if(!columns[i].dataColumnId){
        columns[i].dataColumnId = 'col' + Math.random()
      }
    }
  }
  render() {
    let {model,columns,className,style} = this.props;
    let {prevColumns} = this.state;
    let columnsStr = JSON.stringify(columns);
    if(columnsStr !== prevColumns){
      setTimeout(()=>this.setState({columns,prevColumns:columnsStr},()=>this.updateColumnsByStorageKey()),0)
    }
    this.setColumnIds()
    //پیجینگ را زود تر می سازیم که دیفالت هاش محاسبه بشه
    let pagingLayout = this.paging_layout();
    this.getModelDetails(model)
    let context = this.getContext();
    return (
      <TableContext.Provider value={context}>
        <RVD 
          layout={{
            className:TableCLS.table + (className?' ' + className:''),attrs:{ref:this.dom,onKeyDown:(e)=>this.keyDown(e)},
            style,
            column:[
              this.toolbar_layout(),
              this.units_layout(),
              pagingLayout
            ],
          }}
        />  
      </TableContext.Provider>
    );
  }
}
Table.defaultProps = {
  indent:16,columnGap:1,rowGap:1,headerHeight:48
}
class TableUnit extends Component{
  static contextType = TableContext;
  constructor(props){
    super(props);
    this.rowsRef = createRef();

    this.resizeDown = functions.resizeDown;
    this.resizeMove = functions.resizeMove;
    this.resizeUp = functions.resizeUp;
    this.getClient = functions.getClient;
  }
  
  title_layout(column,setFlex){
    if(column.show === false){return false}
    let resizable = column.resizable !== false && column.width && !column.flex;
    let {rowHeight,headerHeight} = this.context;
    let {width,flex,minWidth = 3,titleAttrs = {}} = column;
    let {hide_xs,hide_sm,hide_md,hide_lg,show_xs,show_sm,show_md,show_lg} = column;
    if(setFlex){width = undefined; flex = 1}
    if(width === undefined && flex === undefined){flex = 1;}
    return {
      hide_xs,hide_sm,hide_md,hide_lg,show_xs,show_sm,show_md,show_lg,
      size:width,align:'vh',flex,style:{minWidth,height:headerHeight || rowHeight,...titleAttrs.style},
      attrs:{
        ...titleAttrs,'data-column-id':column.dataColumnId,className:undefined,style:undefined,
        draggable:column.swap !== false,
        onDragStart:(e)=>{
          if(this.downOnResizeHandle){e.stopPropagation(); e.preventDefault();}
          this.startColumnSwap = column
        },
        onDragOver:(e)=>{e.preventDefault();},
        onDrop:()=>{
          this.endColumnSwap = column;
          let {setColumns,state} = this.context;
          let {columns} = state;
          if(column.swap === false){return;}
          if(this.startColumnSwap === undefined || this.startColumnSwap.dataColumnId === this.endColumnSwap.dataColumnId){return;}
          let newColumns = columns.map((c,j)=>{
            if(c.dataColumnId === this.startColumnSwap.dataColumnId){return this.endColumnSwap}
            if(c.dataColumnId === this.endColumnSwap.dataColumnId){return this.startColumnSwap}
            return c; 
          })
          setColumns(newColumns);
        }
      },
      className:TableCLS.title + (titleAttrs.className?' ' + titleAttrs.className:''),

      row:[
        this.resize_layout(column,resizable,'start'),
        {html:column.title || '',flex:1,align:column.titleJustify !== false?'h':undefined},
        this.filter_layout(column),
        this.resize_layout(column,resizable,'end')
      ]
    }
  }
  resize_layout(column,resizable,type){
    if(!resizable){return {size:12}}
    return {
      size:12,className:TableCLS.resizeHandle,style:{cursor:'col-resize',height:'100%'},
      attrs:{onMouseDown:(e)=>this.resizeDown(e,column,type),onTouchStart:(e)=>this.resizeDown(e,column,type),draggable:false}
    }
  }
  filter_layout(column){
    let {translate,rtl,state,setColumns} = this.context;
    let {setColumn} = state;
    let {filter,type = 'text'} = column;
    if(!filter){return false}
    if(filter === true){
      filter = {}; 
      setColumn(column,{filter:{}})
    }
    let {items = [],booleanType = 'or',add,operators,valueOptions} = filter;
    
    return {
      html:(
        <AIOButton
          style={{background:'none',color:'inherit'}}
          type='button' rtl={rtl} caret={false} text={<Icon path={items.length?mdiFilterMenu:mdiFilter} size={0.6}/>}
          popOver={()=>{
            let {columns} = this.props;
            return (
              <AIOTableFilterPopup 
                title={column.title}
                translate={translate} type={type} items={items} booleanType={booleanType} add={add} operators={operators} valueOptions={valueOptions}
                onChangeBooleanType={(booleanType)=>{
                  let {filter} = column;
                  filter.booleanType = booleanType;
                  setColumn(column,{filter})
                  state.saveColumnInStorage(column,'filter',column.filter)
                  setColumns(columns);
                  if(column.onChangeFilter){column.onChangeFilter(column)}
                }}
                onChange={async (items)=>{
                  let {filter} = column;
                  filter.items = items;
                  setColumn(column,{filter})
                  state.saveColumnInStorage(column,'filter',column.filter)
                  setColumns(columns);
                  if(column.onChangeFilter){column.onChangeFilter(column)}
                }}
              />
            )
          }}
        />
      )
    }
  }
  group_layout(o){
    let {groupHeight,rowHeight,indent,rtl,editGroupName = (o)=>o} = this.context;
    let {cellsType} = this.props;
    return {
      style:{[rtl?'right':'left']:0,height:groupHeight || rowHeight},
      className:TableCLS.groupRow,
      row:cellsType === 'unfreezeCells'?[{flex:1}]:[
        {size:12},
        {size:o.groupLevel * indent},
        this.groupToggle_layout(o),
        {html:editGroupName(o.value),align:'v'}
      ]
    }
  }
  getGroupToggleIcon(open){
    let {getToggleIcon,rtl} = this.context;
    if(getToggleIcon){return getToggleIcon(!!open)}
    return <Icon path={open?mdiChevronDown:(rtl?mdiChevronLeft:mdiChevronRight)} size={0.8}/>
  }
  groupToggle_layout(o){
    let {state,SetState} = this.context;
    let {groupsOpen} = state;
    return {
      align:'vh',
      row:[
        {
          className:TableCLS.rowToggle,html:this.getGroupToggleIcon(o.groupOpen),align:'vh',
          attrs:{onClick:()=>SetState({groupsOpen:{...groupsOpen,[o.id]:!groupsOpen[o.id]}})}
        },
        {size:6}
      ]
    }
  }
  row_layout(rowId,striped){
    let {isRowOpen,getRowDetailById,columnGap,rowTemplate,getRowById,toggleRow,rowChilds,indent_layout,toggle_layout,rowHeight} = this.context;
    if(!isRowOpen(rowId)){return false}
    let rowDetail = getRowDetailById(rowId);
    if(rowDetail._show === false){return false}
    if(rowTemplate){
      let row = getRowById(rowId);
      if(rowChilds){
        return {
          className:'of-visible',size:rowHeight,
          row:[
            indent_layout(rowId),
            toggle_layout(rowId,false),
            {flex:1,html:rowTemplate(row,rowDetail),className:TableCLS.rowTemplate + ' of-visible'},
            {size:6}
          ]
        }
      }
      return {
        html:rowTemplate(row,rowDetail,()=>toggleRow(rowId))
      }
    }
    let {cellsType} = this.props;
    let cells = rowDetail['_' + cellsType];
    let isThereAnyFlex = false;
    return {
      className:TableCLS.row + ' of-visible' + (rowDetail._show === 'relative'?' row-relative-filter':''),
      gap:columnGap,
      row:cells.map((cell,i)=>{
        let res = cell(striped);
        let {html,size,flex,minWidth = 3,attrs,hide_xs,hide_sm,hide_md,hide_lg,show_xs,show_sm,show_md,show_lg} = res;
        if(size === undefined && flex === undefined){flex = 1;}
        if(flex !== undefined){isThereAnyFlex = true}
        if(i === cells.length - 1 && !isThereAnyFlex){
          size = undefined; flex = 1
        }
        return {
          style:{height:'100%',minWidth},
          html,size,flex,attrs,className:'of-visible',
          hide_xs,hide_sm,hide_md,hide_lg,show_xs,show_sm,show_md,show_lg
        }
      })
    }
  }
  onSwap(f,t){
  }
  render(){
    let {rowGap} = this.context,{cellsType,onScroll} = this.props;
    let headerLayout = this.header_layout();
    let rowsLayout = this.rows_layout()
    let className = TableCLS.rows;
    className += ' of-auto';
    if(cellsType === 'freezeCells'){className += ' ' + TableCLS.freezeContainer}
    else if(cellsType === 'unfreezeCells'){className += ' ' + TableCLS.unfreezeContainer}
    return (
      <RVD 
        onSwap={(f,t)=>this.onSwap(f,t)}
        layout={{
          className,
          column:[headerLayout,...rowsLayout],
          gap:rowGap,flex:1,
          attrs:{onScroll:()=>onScroll(),ref:this.rowsRef}
        }}
      />
    )
  }
  header_layout(){
    let {rowTemplate,columnGap,showHeader} = this.context;
    let {columns = []} = this.props;
    if(rowTemplate || showHeader === false){return false}
    let isThereAnyFlex = false;
    return {
      gap:columnGap,className:TableCLS.header,hide_xs:showHeader === 'hide_xs',
      row:columns.map((column,i)=>{
        let {width,flex} = column;
        if(width === undefined && flex === undefined){flex = 1;}
        if(flex !== undefined){isThereAnyFlex = true}
          let setFlex = false
          if(i === columns.length - 1 && !isThereAnyFlex){setFlex = true;}
          return this.title_layout(column,setFlex)
        })
      }
  }
  
  
  rows_layout(){
    let {rows_array,striped} = this.context;
    let index = -1;
    return rows_array.map((o,i)=>{
      if(o._isGroup_){return this.group_layout(o)}
      index++;
      return this.row_layout(o._id,index % 2 === 0?striped:undefined)
    })
  }
}
class Toolbar extends Component{
  static contextType = TableContext;
  state = {searchText:''}
  changeSearch(value,time = 1000){
    clearTimeout(this.searchTimeout);
    this.setState({searchText:value});
    this.searchTimeout = setTimeout(()=>this.context.SetState({searchText:value}),time);
  }
  getSearchbox(){
    let {translate,getSearchs} = this.context;
    let searchs = getSearchs()
    let {searchText} = this.state;
    if(!searchs.length){return false}
    return (
      <div className={TableCLS.searchBox} key='search'>
        <input type='text' value={searchText} placeholder={translate('Search')} onChange={(e)=>this.changeSearch(e.target.value)}/>
        <Icon path={searchText?mdiClose:mdiMagnify} size={0.7} onClick={()=>{if(!searchText){return} this.changeSearch('',0)}}/>
      </div>
    )
  }
  getToggleButton(){
    let {state,translate} = this.context;
    let {columns,setColumn} = state;
    if(!columns || !columns.length){return false}
    let options = columns.filter(({toggle})=>toggle).map((column)=>{
      return {column,text:column.title,checked:column.show !== false}
    })
    if(!options.length){return false}
    return (
      <AIOButton
        popupHeader={<div className={TableCLS.toolbarPopupHeader}>{translate('Show Columns')}</div>}
        key='togglebutton' caret={false} type='select' options={options} className={TableCLS.toolbarIconButton}
        text={<Icon path={mdiEye} size={0.7}/>}
        onChange={(value,obj)=>{
          let {state,setColumns} = this.context;
          let {columns} = state;
          let {column} = obj.option;
          let {show = true} = column;
          setColumn(column,{show:!show})
          state.saveColumnInStorage(column,'show',obj.option.column.show)
          setColumns(columns)
        }}
      />
    )
  }
  getSortButton(){
    let {state,model = [],translate} = this.context;
    let sorts = state.Sort.get();
    if(!sorts.length || !model.length){return false}
    let options = sorts.map((sort,i)=>{
      return {
        text:sort.title,checked:!!sort.active,
        after:(
          <Icon 
            path={sort.dir === 'dec'?mdiArrowDown:mdiArrowUp} size={0.8}
            onClick={(e)=>{
              e.stopPropagation();
              sorts[i].dir = sort.dir === 'dec'?'inc':'dec';
              state.Sort.set(sorts)
            }} 
          />
        )
      }
    })
    return (
      <AIOButton
        popupHeader={<div className={TableCLS.toolbarPopupHeader}>{translate('Sort By')}</div>}
        key='sortbutton' caret={false} type='select' options={options} className={TableCLS.toolbarIconButton}
        text={<Icon path={mdiSort} size={0.7}/>}
        onChange={(value,obj)=>{
          sorts[obj.realIndex].active = !sorts[obj.realIndex].active;
          state.Sort.set(sorts)
        }}
        onSwap={(from,to,swap)=>state.Sort.set(swap(sorts,from,to))}
      />
    )
  }
  getExcelButton(){
    let {state,rows_array,getRowDetailById} = this.context;
    return (
      <AIOButton
        key='excelbutton' caret={false} type='button' className={TableCLS.toolbarIconButton}
        text={<Icon path={mdiFileExcel} size={0.7}/>}
        onClick={()=>state.Excel.export(rows_array.filter(({_isGroup_})=>!_isGroup_).map(({_id})=>getRowDetailById(_id)._json))}
      />
    )
  }
  getGroupButton(){
    var {model,state,groups,translate} = this.context;
    if(!groups.length || !model.length){return false}
    let options = groups.map((group)=>{
      return {
        text:group.title,checked:!!group.active
      }
    })
    return (
      <AIOButton
        popupHeader={<div className={TableCLS.toolbarPopupHeader}>{translate('Group By')}</div>}
        key='groupbutton' caret={false} type='select' options={options} className={TableCLS.toolbarIconButton}
        text={<Icon path={mdiFileTree} size={0.7}/>}
        onChange={(value,obj)=>{
          groups[obj.realIndex].active = !groups[obj.realIndex].active;
          state.Group.set(groups)
        }}
        onSwap={(from,to,swap)=>state.Group.set(swap(groups,from,to))}
      />
    )
  }
  getToolbarItems(){
    var {toolbar} = this.context;
    if(!toolbar){return []}
    return [toolbar()]
  }
  getItems(){
    let {excel} = this.context;
    let items = [];
    let searchBox = this.getSearchbox();
    if(searchBox){items.push(searchBox)}
    let toggleButton = this.getToggleButton();
    if(toggleButton){items.push(toggleButton)}
    let sortButton = this.getSortButton();
    if(sortButton){items.push(sortButton)}
    let groupButton = this.getGroupButton();
    if(groupButton){items.push(groupButton)}
    if(excel){items.push(this.getExcelButton())}
    let toolbarItems = this.getToolbarItems();
    items = items.concat(toolbarItems)
    return items;
  }
  render(){
    let {toolbarAttrs = {}} = this.context;
    let {className} = toolbarAttrs;
    let items = this.getItems();
    if(!items.length){return null}
    return (
      <div {...toolbarAttrs} className={TableCLS.toolbar + (className?' ' + className:'')}>
        {items}
      </div>
    )
  }
}
class Cell extends Component{
  static contextType = TableContext;
  constructor(props){
    super(props)
    this.dataUniqId = 'cell' + Math.random()
  }
  getContent(row,column,value){ 
    let {rows_object,details_object,verticalTabIndex} = this.context;
    let {rowId,colId} = this.props;
    if(this.inlineEdit){
      if(this.inlineEdit.type === 'text' || this.inlineEdit.type === 'number'){
        let props = {
          type:column.type,className:TableCLS.inlineEditInput,defaultValue:value,tabIndex:verticalTabIndex?colId:0,
          style:{textAlign:column.justify?'center':undefined},'data-col-id':colId,'data-row-id':rowId,
          onBlur:(e)=>this.onChange(e.target.value)
        }
        return <input {...props}/>
      }
      if(this.inlineEdit.type === 'select'){
        return (
          <AIOButton
            attrs={{'data-col-id':colId,'data-row-id':rowId,tabIndex:verticalTabIndex?colId:0}}
            {...{popupAttrs:{style:{maxHeight:360}},...this.inlineEdit}} className={TableCLS.inlineEditInput}
            onChange={(value)=>this.onChange(value)}
            value={value}
          />
        )
      }
      if(this.inlineEdit.type === 'checkbox'){
        return (
          <AIOButton
            attrs={{'data-col-id':colId,'data-row-id':rowId,tabIndex:verticalTabIndex?colId:0}}
            {...this.inlineEdit} className={TableCLS.inlineEditInput}
            value={value}
            style={{padding:0}}
            onChange={(value)=>this.onChange(!value)}
          />
        )
      }
    }
    let {templates = {}} = this.context;
    if(column.template && templates[column.template]){
      return templates[column.template](rows_object[rowId],details_object[rowId])
    }
    else{return value;}
  }
  async onChange(value){
    let {column,rowId} = this.props;
    let {rows_object,setModel = ()=>{}} = this.context;
    let row = rows_object[rowId];
    this.setState({loading:true})
    if(this.inlineEdit.type === 'number' && !isNaN(+value)){value = +value}
    if(this.inlineEdit.onChange){await this.inlineEdit.onChange(row,value)}
    else {setModel(this.setCellValue(row,column.field,value))}
    this.setState({loading:false})
  }
  setCellValue(row,field,value){//row is used in eval
    let {model} = this.context;
    let evalText;
    if(typeof value === 'string'){evalText = `${field} = "${value}"`;}
    else{evalText = field + ' = ' + JSON.stringify(value);}
    eval(evalText);
    return model;
  }
  
  getInlineEdit(row,column){
    let inlineEdit = typeof column.inlineEdit === 'function'?column.inlineEdit(row):column.inlineEdit;
    if(!inlineEdit){return false}
    if(inlineEdit === true){inlineEdit = {}}
    let {disabled = ()=>false,type = column.type || 'text'} = inlineEdit;
    if(disabled(row)){return false}
    return {...inlineEdit,type};
  }
  render(){
    let {getRowById,rowHeight} = this.context;
    let {column,rowId,value,striped} = this.props;
    let row = getRowById(rowId);
    let attrs = {},style = {};
    if(column.cellAttrs){
      attrs = column.cellAttrs(row) || {}
      if(attrs.style){style = attrs.style}
    }
    if(rowHeight){
      style.height = rowHeight;
    }
    if(typeof striped === 'string'){
      style.background = striped;
    }
    else if(Array.isArray(striped)){
      style.background = striped[0];
      style.color = striped[1];
    }
    style = {justifyContent:column.justify?'center':undefined,padding:column.justify?undefined:'0 12px',...style}
    this.inlineEdit = this.getInlineEdit(row,column);
    return (
      <RVD
        layout={{
          className:TableCLS.cell + ' of-visible' + (attrs.className?' ' + attrs.className:'') + (striped === true?' striped':''),
          attrs:{
            ...attrs,'data-uniq-id':this.dataUniqId,style:undefined,className:undefined,
            onClick:attrs.onClick?()=>attrs.onClick(row):undefined,
          },
          style,
          row:[
            this.indent_layout(column.treeMode,rowId),
            this.toggle_layout(),
            this.before_layout(row,column),
            this.content_layout(row,column,value),
            this.after_layout(row,column) 
          ]
        }}
      />  
    )
  }
  indent_layout(treeMode,rowId){
    if(!treeMode){return false}
    return this.context.indent_layout(rowId)
  }
  toggle_layout(){
    let {column,rowId} = this.props;
    if(!column.treeMode){return false}
    let {toggle_layout} = this.context;
    return toggle_layout(rowId)
  }
  before_layout(row,column){
    if(!column.before){return false}
    let {state} = this.context;
    let html = state.getValueByField(row,undefined,column.before)
    return {row:[{className:TableCLS.cellBefore,html},{size:6}]}
  }
  content_layout(row,column,value){
    let {state} = this.context;
    let subtext = state.getValueByField(row,undefined,column.subtext);
    if(subtext){
      return {
        className:TableCLS.cellContent,style:{height:'100%'},align:'v',flex:1,
        column:[
          {html:this.getContent(row,column,value),align:column.justify?'vh':'v',className:'of-visible'},
          {size:3},
          {html:subtext,className:TableCLS.cellSubtext,align:column.justify?'vh':'v'},
        ]
      }
    }
    else {return {className:TableCLS.cellContent,align:column.justify?'vh':'v',flex:1,html:this.getContent(row,column,value),style:{height:'100%'}}}
  }
  after_layout(row,column){
    if(!column.after){return false}
    let {state} = this.context;
    let html = state.getValueByField(row,undefined,column.after)
    return {row:[{className:TableCLS.cellAfter,html}]}
  }
}
function FilterResult(items = [],booleanType = 'or',value,reverse){
  let fn = {
    and(){ 
      if(value === undefined){return false}
      for(let i = 0; i < items.length; i++){
        let {operator:o,value:v,type} = items[i];
        if(v === '' || v === undefined){continue;}
        let a,b;
        if(reverse){a = v; b = value;}
        else{a = value; b = v;}
        if(o === 'contain'){if(!this.isContain(a,b)){return false}continue} 
        if(o === 'notContain'){if(this.isContain(a,b)){return false}continue} 
        if(o === 'equal'){if(!this.isEqual(a,b)){return false}continue}
        if(o === 'notEqual'){if(this.isEqual(a,b)){return false}continue}
        if(o === 'greater'){if(!this.isGreater(a,b,type)){return false;}continue}
        if(o === 'less'){if(!this.isLess(a,b,type)){return false;}continue}  
      }
      return true;
    },
    or(){
      if(value === undefined){return false}
      for(let i = 0; i < items.length; i++){
        let {operator:o,value:v,type} = items[i];
        if(v === '' || v === undefined){return true;}
        let a,b;
        if(reverse){a = v; b = value;}
        else{a = value; b = v;}
        if(o === 'contain'){if(this.isContain(a,b)){return true}continue} 
        if(o === 'notContain'){if(!this.isContain(a,b)){return true}continue} 
        if(o === 'equal'){if(this.isEqual(a,b)){return true}continue}
        if(o === 'notEqual'){if(!this.isEqual(a,b)){return true}continue}
        if(o === 'greater'){if(this.isGreater(a,b,type)){return true;}continue}
        if(o === 'less'){if(this.isLess(a,b,type)){return true;}continue}  
      }
      return false;
    },
    isContain(text,subtext){return text.toString().toLowerCase().indexOf(subtext.toString().toLowerCase()) !== -1},
    isEqual(a,b){return a.toString().toLowerCase() === b.toString().toLowerCase()},
    isGreater(a,b,type){
      if(type === 'date'){return this.getDateNumber(a) > this.getDateNumber(b)}
      return parseFloat(a) > parseFloat(b)
    },
    getDateNumber(value){
      let splitter;
      for(let i = 0; i < value.length; i++){
        if(isNaN(parseInt(value[i]))){splitter = value[i]; break}
      }
      let [year,month = '01',day = '01'] = value.split(splitter);
      let list = [year,month,day];
      return parseInt(list.map((o)=>o.length === 1?('0' + o):o).join(''))
    },
    isLess(a,b,type){
      if(type === 'date'){return this.getDateNumber(a) < this.getDateNumber(b)}
      return parseFloat(a) < parseFloat(b)
    }
  } 
  if(items.length){return fn[booleanType]();}
  return true;
}
class AIOTableFilterPopup extends Component{
  title_layout(){
    let {title} = this.props;
    return {
      html:title,style:{padding:'0 6px'}
    }
  }
  items_layout(){
    let {items} = this.props;
    return {column:items.map((item,i)=>{return {column:[this.item_layout(item,i),this.boolean_layout(i)]}})}
  }
  item_layout(item,itemIndex){
    let {type,items,onChange,translate = (str) => str,add,operators,valueOptions} = this.props;
    return {
      html:(  
        <AIOfilterItem 
          operator={item.operator} value={item.value} type={type} translate={translate} operators={operators}
          operatorOptions={this.operatorOptions} valueOptions={valueOptions} add={add}
          onChange={(key,value)=>{
            onChange(items.map((o,i)=>{if(itemIndex === i){return {...o,[key]:value}} return o}))
          }}
          onRemove={add === false?undefined:()=>onChange(items.filter((o,i)=>i !== itemIndex))}
        />
      )
    }
  }
  getOperatorOptions(){
    let {translate,type,operators = ['contain','notContain','equal','notEqual','greater','less']} = this.props;
    return [
      {text:translate('Contain'),value:'contain',show:type === 'text' && operators.indexOf('contain') !== -1},
      {text:translate('Not Contain'),value:'notContain',show:type === 'text' && operators.indexOf('notContain') !== -1},
      {text:translate('Equal'),value:'equal',show:operators.indexOf('equal') !== -1},
      {text:translate('Not Equal'),value:'notEqual',show:operators.indexOf('notEqual') !== -1},
      {text:translate('Greater Than'),value:'greater',show:(type === 'date' || type === 'number') && operators.indexOf('greater') !== -1},
      {text:translate('Less Than'),value:'less',show:(type === 'date' || type === 'number') && operators.indexOf('less') !== -1}
    ].filter(({show})=>show)
  }
  boolean_layout(index){
    let {items,translate = (text)=>text,booleanType,onChangeBooleanType} = this.props;
    if(index >= items.length - 1){return false}
    return {html:translate(booleanType),attrs:{onClick:()=>onChangeBooleanType(booleanType === 'or'?'and':'or')},align:'vh'}
  }
  add_layout(){
    var {type,items,onChange,translate = (str) => str,add} = this.props;
    if(add === false){return false}
    return {html:(<button className={TableCLS.addFilter} onClick={()=>onChange(items.concat({operator:this.operatorOptions[0].value,value:'',type}))}>{translate('Add')}</button>)}
  }
  render(){
    this.operatorOptions = this.getOperatorOptions();
    return (
      <RVD
        layout={{
          className:TableCLS.filterPopup,style:{minWidth:250},
          column:[this.title_layout(),this.items_layout(),this.add_layout()]
        }}
      />
    )
  }
}
class AIOfilterItem extends Component{
  constructor(props){
    super(props);
    let {value} = this.props;
    this.state = {value,prevValue:value}
  }
  operator_layout(){
    let {onChange,operator,operatorOptions,add,translate} = this.props;
    if(add === false){return false}
    let operators = operatorOptions.filter(({show})=>show !== false);
    if(operators.length === 1){
      return {
        size:90,
        html:(
          <AIOButton 
            style={{width:'100%'}}
            type='button' className={TableCLS.filterOperator} text={operators[0].text}
          />
        )
      }  
    }
    return {
      size:90,
      html:(
        <AIOButton 
          style={{width:'100%'}}
          type='select' className={TableCLS.filterOperator} value={operator} options={operatorOptions} onChange={(value)=>onChange('operator',value)}
        />
      )
    }
  }
  value_layout(){
    let {type,onChange,valueOptions} = this.props;
    let {value} = this.state;
    if(valueOptions){
      return {
        flex:1,html:<select className={TableCLS.filterValue} type={type === 'number'?'number':'text'} value={value} onChange={(e)=>{
          let value = e.target.value;
          clearTimeout(this.timeout);
          this.setState({value});
          onChange('value',value)
        }}>{
          valueOptions.map(({value,text})=>{
            return (<option value={value}>{text}</option>)
          })
        }</select>
      }
    }
    return {
      flex:1,html:<input className={TableCLS.filterValue} type={type === 'number'?'number':'text'} value={value} onChange={(e)=>{
        let value = e.target.value;
        clearTimeout(this.timeout);
        this.setState({value});
        this.timeout = setTimeout(()=>onChange('value',value),1000)
      }}/>
    }
  }
  remove_layout(){
    let {onRemove} = this.props;
    if(!onRemove){return false}
    return {size:24,html:<Icon path={mdiClose} size={0.6} onClick={()=>onRemove()}/>,align:'vh',className:TableCLS.filterRemove}
  }
  render(){
    if(this.state.prevValue !== this.props.value){
      setTimeout(()=>this.setState({value:this.props.value,prevValue:this.props.value}),0);
    }
    return (<RVD layout={{className:TableCLS.filterItem,gap:3,row:[this.operator_layout(),this.value_layout(),this.remove_layout()]}}/>)
  }
}
function Sort(getProps,getState,setColumns){
  let o = {
    get(){
      let {columns = [],setColumn} = getState();
      let sorts = [];
      for(let i = 0; i < columns.length; i++){
        if(!columns[i].sort){continue}
        if(typeof columns[i].sort !== 'object'){
          let column = columns[i];
          setColumn(column,{sort:{}})
        }
        let {sort,field,dataColumnId,title} = columns[i];
        let {dir = 'inc',order,active = true} = sort;
        let type = sort.type || columns[i].type || 'text';
        if(order === undefined){
          let newOrder = 0;
          let orders = columns.filter(({sort})=>sort && sort.order!== undefined).map(({sort})=>sort.order)
          while(orders.indexOf(newOrder) !== -1){newOrder++;}
          sort.order = newOrder;
        }
        sorts.push({dir,order:sort.order,type,field,active,dataColumnId,title})
      }
      sorts = sorts.sort(({order:a},{order:b})=>a - b)
      return sorts;
    },
    getDateNumber(value){
      let splitter;
      if(!value || typeof value !== 'string'){return Infinity}
      for(let i = 0; i < value.length; i++){
        if(isNaN(parseInt(value[i]))){splitter = value[i]; break}
      }
      let [year,month = '01',day = '01'] = value.split(splitter);
      let list = [year,month,day];
      return parseInt(list.map((o)=>o.length === 1?('0' + o):o).join(''))
    },
    sort(model,sorts){
      let {getValueByField} = getState();
      return model.sort((a,b)=>{
        for (let i = 0; i < sorts.length; i++){
          let {field,dir,active,type} = sorts[i];
          if(!active){continue}
          let aValue = getValueByField(a,undefined,field),bValue = getValueByField(b,undefined,field);
          if(type === 'date'){
            aValue = this.getDateNumber(aValue);
            bValue = this.getDateNumber(bValue);
          }
          if ( aValue < bValue ){return -1 * (dir === 'dec'?-1:1);}
          if ( aValue > bValue ){return 1 * (dir === 'dec'?-1:1);}
          if(i === sorts.length - 1){return 0;}
        }
        return 0;
      });
    },
    updateColumns(sorts){
      let {columns,saveColumnInStorage} = getState();
      for(let i = 0; i < sorts.length; i++){
        let sort = sorts[i];
        let {dir,active,dataColumnId} = sort;
        let column = columns.filter((c)=>c.dataColumnId === dataColumnId)[0];
        column.sort = {...column.sort,dir,active,order:i}
        saveColumnInStorage(column,'sort',column.sort)
      }
      setColumns(columns);
    },
    async set(sorts){
      sorts = sorts || this.get()
      if(!sorts.length){return}
      let {model,onChangeSorts,setModel} = getProps();
      if(onChangeSorts){
        let res = await onChangeSorts(sorts,this.sort(model,sorts))
        if(res !== false){this.updateColumns(sorts);}
      }
      else if(setModel){
        setModel(this.sort(model,sorts))
        this.updateColumns(sorts);
      }
      else {
        console.error('AIOTable Error => you set sort in columns but missing setModel or onChangeSort props.')
      }
    }
  }
  return {set:o.set.bind(o),get:o.get.bind(o)}
}
function Group (getProps,getState,setColumns){
  let o = {
    getGroupModel(model,groups){
      let {getValueByField} = getState()
      let newModel = {};
      for(let i = 0; i < model.length; i++){
        let row = model[i],obj = newModel,values = groups.map((group)=>getValueByField(row,undefined,group.field));
        //let show = row._detail._show
        for(let j = 0; j < values.length; j++){
          let value = values[j];
          if(j === values.length - 1){obj[value] = obj[value] || []; obj[value].push(row);}
          else{obj[value] = obj[value] || {}; obj = obj[value];}
        }
      }
      return newModel;
    },
    getGroupRows(model){
      var {groupsOpen} = getState();
      function msf(obj,level,parents){
        if(Array.isArray(obj)){groupedRows = groupedRows.concat(obj);}
        else{
          for(var prop in obj){
            let newParents = parents.concat(prop),id = newParents.toString();
            groupsOpen[id] = groupsOpen[id] === undefined?true:groupsOpen[id];
            groupedRows.push({_isGroup_:true,value:prop,id,groupLevel:level,groupOpen:groupsOpen[id]});
            if(groupsOpen[id]){msf(obj[prop],level + 1,newParents);}
          } 
        }
      }
      var groupedRows = [],level = 0;
      msf(model,level,[])
      return groupedRows;
    },
    groupBy(model,groups = []){
      if(!groups.length){return model}
      const groupModel = this.getGroupModel(model,groups);
      return this.getGroupRows(groupModel)
    },
    updateColumns(groups){
      let {columns = [],saveColumnInStorage} = getState();
      for(let i = 0; i < groups.length; i++){
        let group = groups[i];
        let {active,dataColumnId} = group;
        let column = columns.filter((c)=>c.dataColumnId === dataColumnId)[0];
        column.group = {...column.group,active,order:i}
        saveColumnInStorage(column,'group',column.group)
      }
      setColumns(columns);
    },
    get(){
      let {columns = []} = getState();
      let groups = [];
      for(let i = 0; i < columns.length; i++){
        if(!columns[i].group){continue}
        if(typeof columns[i].group !== 'object'){columns[i].group = {};}
        let {group,type = 'text',field,dataColumnId,title} = columns[i];
        let {order,active = true} = group;
        if(order === undefined){
          let newOrder = 0;
          let orders = columns.filter(({group})=>group && group.order!== undefined).map(({group})=>group.order)
          while(orders.indexOf(newOrder) !== -1){newOrder++;}
          group.order = newOrder;
        }
        groups.push({order:group.order,type,field,active,dataColumnId,title})
      }
      groups = groups.sort(({order:a},{order:b})=>a - b)
      return groups;
    },
    set(groups){
      this.updateColumns(groups);
    }
  }
  return {get:o.get.bind(o),set:o.set.bind(o),groupBy:o.groupBy.bind(o)}
}
function Excel(getProps){
  let o = {
    fixPersianAndArabicNumbers (str){
      if(typeof srt !== 'string'){return str}
      var persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
      arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
      for(var i=0; i<10; i++){str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);}
      return str;
    },
    getJSON(rows){
      let result = [];
      for (let i = 0; i < rows.length; i++) {
        let json = rows[i],fixedJson = {};
        for(let prop in json){fixedJson[prop] = this.fixPersianAndArabicNumbers(json[prop])} 
        result.push(fixedJson);
      }
      return result;
    },
    export(rows) {
      let {translate = (o)=>o} = getProps();
      let name = window.prompt(translate('Inter Excel File Name'));
      if (!name || name === null || !name.length) return;
      var data = this.getJSON(rows);
      var arrData = typeof data != "object" ? JSON.parse(data) : data;
      var CSV = "";
      // CSV += 'title';
      CSV += '\r\n\n';
      if (true) {
          let row = "";
          for (let index in arrData[0]) { row += index + ","; }
          row = row.slice(0, -1);
          CSV += row + "\r\n";
      }
      for (var i = 0; i < arrData.length; i++) {
          let row = "";
          for (let index in arrData[i]) { row += '"' + arrData[i][index] + '",'; }
          row.slice(0, row.length - 1);
          CSV += row + "\r\n";
      }
      if (CSV === "") { alert("Invalid data"); return; }
      var fileName = name.replace(/ /g, "_");
      var universalBOM = "\uFEFF";
      var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(universalBOM + CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  return {export:o.export.bind(o)}
}
let functions = {   
  async onScroll(index){
    let {lazyLoad = {}} = this.props;
    let {onScrollEnd} = lazyLoad;
    if(onScrollEnd){
      // if(index === undefined || index === 0){
      //   let table = $(this.dom.current).find('.' + TableCLS.rows);
      //   let scrollTop = table.scrollTop();
      //   let scrollHeight = table[0].scrollHeight;
      //   let height = table.height();
      //   if(scrollTop + height === scrollHeight){
      //     let {startIndex} = getState();
      //     let {lazyLength,totalLength} = lazyLoad;
      //     let from = startIndex + lazyLength;
      //     if(from > totalLength){return;}
      //     let to = from + lazyLength;
      //     if(to > totalLength){to = totalLength;}
      //     let a = $(dom.current).find('.aio-table-main-loading')
      //     a.css({display:'flex'})
      //     let res = await onScrollEnd(from,to);
      //     a.css({display:'none'})
      //     if(res !== false){
      //       setState({startIndex:from})
      //     }
      //   }
      // }
    }
    if(index === undefined){return}
    if(!this['scroll' + index]){
      let otherIndex = Number(!index);
      this['scroll' + otherIndex] = true;
      let c = $(this.dom.current);
      var units = [c.find('.' + TableCLS.freezeContainer),c.find('.' + TableCLS.unfreezeContainer)]
      var scrollTop = units[index].scrollTop();
      units[otherIndex].scrollTop(scrollTop);
    }
    this['scroll' + index] = false;
  },
  getValueByField(row,column,field){
    
    try{
      if(field === undefined){field = column.field}
      let type = typeof field;
      if(type === 'function'){return field(row,column);}
      if(type === 'string'){
        if(field.indexOf('.') !== -1 && (field.indexOf('row') !== -1 || field.indexOf('column') !== -1 || field.indexOf('props') !== -1)){
          let result;
          eval('result = ' + field);
          return result;
        }
        return field;
      }
      return field; 
    }
    catch{return;}
  },
  getSearchs(){
    let {columns = []} = this.state;
    let searchs = [];
    for(let i = 0; i < columns.length; i++){
      let {show = true,search,field} = columns[i];
      if(!show || !search){continue}
      searchs.push(field);
    }
    return searchs
  },
  getFilterResult(row,detail){
    let {searchText,getValueByField} = this.state;
    let searchs = this.getSearchs()
    if(searchText && searchs.length){
      let items = searchs.map((field)=>{return {operator:'contain',value:getValueByField(row,undefined,field).toString()}});
      if(FilterResult(items,'or',searchText,true) === false){return false}
    }
    let {columns = []} = this.state;
    for(let i = 0; i < columns.length; i++){
      let column = columns[i];
      let {filter,dataColumnId,show = true} = column;
      if(!show){continue}
      if(!filter){continue}
      if(filter === true){filter = {}; column.filter = {}}
      let {items = [],booleanType = 'or'} = filter;
      if(!items.length){continue}
      let value = detail._values[dataColumnId];
      if(FilterResult(items,booleanType,value) === false){return false}
    }
    return true;
  },
  isRowOpen(id){
    if(!this.props.rowChilds){return true}
    let {_parentIds} = this.getRowDetailById(id);
    for(let i = 0; i < _parentIds.length; i++){
      let parentId = _parentIds[i]
      if(this.getRowDetailById(parentId)._open === false){return false}
    }
    return true
  },
  
  ///ok
  getClient(e){return this.context.touch?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[e.clientX,e.clientY];},
  ///ok
  resizeDown(e,column,type){
    e.stopPropagation();
    this.downOnResizeHandle = true;
    let {state} = this.context;
    let {touch} = state;
    this.resized=false;
    $(window).bind(touch?'touchmove':'mousemove',$.proxy(this.resizeMove,this));
    $(window).bind(touch?'touchend':'mouseup',$.proxy(this.resizeUp,this));
    this.resizeDetails = {
      client:this.getClient(e),
      width:column.width,
      column,type
    }
  },
  ///ok
  resizeMove(e){
    this.resized =true;
    var {rtl} = this.props;
    var Client = this.getClient(e);
    var {client,width,column,type} = this.resizeDetails;
    var offset = (Client[0] - client[0]) * (type === 'start'?-1:1);
    let newWidth = (width + offset * (rtl?-1:1));
    if(newWidth < parseInt(column.minWidth || 3)){newWidth = parseInt(column.minWidth || 3)}
    this.resizeDetails.newWidth = newWidth;
    if(newWidth % 10 !== 0){return}
    $(`[data-column-id='${column.dataColumnId}']`).css({width:newWidth})
  },
  ///ok
  resizeUp(){
    this.downOnResizeHandle = false;
    let {state,setColumns} = this.context;
    let {touch} = state;
    $(window).unbind(touch?'touchmove':'mousemove',this.resizeMove);
    $(window).unbind(touch?'touchend':'mouseup',this.resizeUp);
    if(!this.resized){return;}
    let {columns} = state;
    let {newWidth,column} = this.resizeDetails;
    column.width = newWidth;
    state.saveColumnInStorage(column,'width',newWidth)
    setColumns(columns);
  },
}

export function convertFlatModel({model,childsField,getId,getParentId}){
    var convertModelRecursive = (array,parentId,parentObject)=>{
      for(let i = 0; i < array.length; i++){
        let row = array[i];
        let rowParentId = getParentId(row);
        if(rowParentId !== parentId){continue;}
        let rowId = getId(row);
        row[childsField] = [];
        parentObject.push(row);
        array.splice(i,1);
        i--;
        convertModelRecursive([...array],rowId,row[childsField])
      }
    }
    var result = [];
    convertModelRecursive([...model],undefined,result);
    return result;
  }