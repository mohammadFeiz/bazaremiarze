import React,{Component} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import './index.css';
/**************************props********************************/
/*** categories => <categories>
/*** onChange => (id:string)=>void;
/*** rootName => string;
/*** total => number | false (false means total is loading)
/*** rtl => boolean
/**************************types********************************/
/*** <categories> => <category>[]
/*** <category> => {id:string,name:string,childs:<category>[]}
/***************************************************************/
export default class TreeCategories extends Component{
    constructor(props){
        super(props);
        this.state = {path:[],childs:[],activeIndexes:[]}
    }
    componentDidMount(){
        this.changeActiveIndexes([],true)
    }
    chevron(){
        let {rtl} = this.props;
        return <svg viewBox="0 0 24 24" role="presentation" style={{width: '1.5rem', height: '1.5rem',transform:`rotate(${rtl?180:0}deg)`}}><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" style={{fill: 'currentcolor'}}></path></svg>
    }
    changeActiveIndexes(indexes){
        let {categories,onChange,rootName = 'همه کالا ها'} = this.props;
        let tree = JSON.parse(JSON.stringify(categories));
        let path = [{level:0,name:rootName}];
        let id = false;
        let childs = [];
        if(!indexes.length){
            childs = tree.map(({name},i)=>{return {name,index:i}});
        }
        else {
            for(let i = 0; i < indexes.length; i++){
                let index = indexes[i],category = tree[index]; 
                tree = category.childs;
                path.push({name:category.name,level:i + 1});
                id = category.id;
                if(i === indexes.length - 1){
                    childs = category.childs.map(({name},i)=>{return {name,index:i}})
                }   
            }
        }
        onChange(id);
        this.setState({path,childs,activeIndexes:indexes})
    }
    
    addLevel(index){
        let {activeIndexes} = this.state;
        let newActiveIndexes = [...activeIndexes,index];
        this.changeActiveIndexes(newActiveIndexes)
    }
    goToLevel(level){
        let {activeIndexes} = this.state;
        let newActiveIndexes = activeIndexes.slice(0,level);
        this.changeActiveIndexes(newActiveIndexes)
    }
    childs_layout(){
        let {childs} = this.state;
        if(!childs.length){return false}
        let className = 'tree-category-row';
        return {className,gap:6,row:childs.map(({name,index},i)=>this.child_layout(name,index))}
    }
    child_layout(name,index){return {className:`tree-category-button`,html:name,onClick:()=>this.addLevel(index)}}
    path_layout(){
        let {path} = this.state;
        let gap = {gap:16,gapHtml:()=>this.chevron(),gapAttrs:{className:'align-vh'}}
        return {className:'tree-category-row',...gap,row:path.map((o,i)=>this.pathItem_layout(o,i))}
    }
    pathItem_layout(pathItem,pathIndex){
        let {path} = this.state;
        let {total} = this.props;
        let isLast = pathIndex === path.length - 1;
        let className,html;
        if(isLast){className = 'tree-category-titr'; html = `${pathItem.name} (${total === false?'...':total})`}
        else{className = `tree-category-button`; html = pathItem.name}
        return {className,html,onClick:isLast?undefined:()=>this.goToLevel(pathItem.level)}
    }
    render(){return (<RVD layout={{className:'tree-category' + (this.props.rtl?' rtl':''),column:[this.path_layout(),this.childs_layout()]}}/>)}
}