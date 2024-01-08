import React,{Component} from 'react';
import appContext from './../../../app-context';
import SearchBox from './../../../components/search-box/index';
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
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
      let {apis} = this.context;
      let {searchValue} = this.state;
      if(searchValue === ''){
        this.setState({result:[]})
        return 
      }
      this.setState({loading:true})
      let res = await apis.request({api:"kharid.getTaxonProducts", parameter:{Name:searchValue},loading:false});
      this.setState({loading:false})
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
      let {Shop_Regular} = this.context;
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
        flex: 1,className:'ofy-auto',
        column: result.map((o, i) => {
          return {html:Shop_Regular.renderCard({index:i,product:o,type:'horizontal',renderIn:'search',taxonId:o.taxonId})}
        }),
      }
    }
    render() {
      return (
          <RVD
            layout={{
              className: "theme-popup-bg",
              column: [
                {html:<SearchBox onChange={async (searchValue)=>await this.changeSearch(searchValue)}/>},
                {size: 200,align: "vh",className: "fs-20 theme-dark-font-color bold",show: false,html: "در میان ان کالا جستجو"},
                {size: 48,align: "v",className: "fs-14 theme-dark-font-color bold p-h-24",html: "محصولات"},
                { size: 24 },
                this.result_layout()
              ],
            }}
          />
      );
    }
  }
  