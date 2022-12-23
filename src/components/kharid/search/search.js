import React,{Component} from 'react';
import appContext from './../../../app-context';
import SearchBox from './../../../components/search-box/index';
import ProductCard from './../product-card/product-card';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
export default class Search extends Component {
    static contextType = appContext;
    constructor(props) {
      super(props);
      this.state = {
        searchValue: "",
        searchFamilies: [{ name: "جنرال" },{ name: "جاینت" },{ name: "پنلی" },{ name: "سیم و کابل" }],
        result: [
          
        ],
      };
    }
    async search(){
      let {kharidApis} = this.context;
      let {searchValue} = this.state;
      if(searchValue === ''){
        this.setState({result:[]})
        return 
      }
      this.setState({loading:true})
      let res = await kharidApis({type:"getTaxonProducts", parameter:{Name:searchValue},loading:false});
      this.setState({loading:false})
      console.log(res)
      this.setState({ result: res });
    }
    async changeSearch(searchValue) {
      clearTimeout(this.timeout);
      this.setState({ searchValue });
      this.timeout = setTimeout(async () => {
        this.search()
      }, 2000);
    }
    result_layout(){
      let { result,loading,searchValue } = this.state;
      if(loading){
        return {html:'در حال جستجو...',size:60,align:'vh'}
      }
      if(!result){return null}
      if(!result.length){
        if(searchValue){return {html:'موردی یافت نشد',size:60,align:'vh'}}
        return false
      }
      return {
        flex: 1,scroll:'v',
        column: result.map((o, i) => {
          return {html:<ProductCard isFirst={i === 0} isLast={i === result.length - 1} product={o} type='horizontal'/>}
        }),
      }
    }
    render() {
      return (
          <RVD
            layout={{
              className: "popup-bg",
              column: [
                {html:<SearchBox onChange={async (searchValue)=>await this.changeSearch(searchValue)}/>},
                {size: 200,align: "vh",className: "size20 color323130 bold",show: false,html: "در میان ان کالا جستجو"},
                {size: 48,align: "v",className: "size14 color323130 bold padding-0-24",html: "محصولات"},
                { size: 24 },
                this.result_layout()
              ],
            }}
          />
      );
    }
  }
  