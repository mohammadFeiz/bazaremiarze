import React, { Component,useEffect, useRef,useState,createRef } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Axios from 'axios';
import {Icon} from '@mdi/react';
import {mdiClose, mdiCrosshairsGps, mdiLoading, mdiMagnify} from '@mdi/js';
import $ from 'jquery';
import "./index.css";

export default class Map extends Component{
    constructor(props){
        super(props);
        let {latitude = 35.699739,longitude = 51.338097} = props;
        this.state = {latitude,longitude}
    }
    ipLookUp () {
      $.ajax('http://ip-api.com/json')
      .then(
          (response) => {
              let {lat,lon} = response;
              this.flyTo(lat,lon)
          },
     
          (data, status) => {
              console.log('Request failed.  Returned status of',status);
          }
      );
    }
    handlePermission() {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                console.log(result.state);
            } 
            else if (result.state === 'prompt') {
                console.log(result.state);
            } 
            else if (result.state === 'denied') {
                console.log(result.state);
        }
    });
    }
    goToCurrentPoint(){
        if ("geolocation" in navigator) {
            this.handlePermission();
            // check if geolocation is supported/enabled on current browser
            navigator.geolocation.getCurrentPosition(
                (position)=> {
                    let {latitude,longitude} = position.coords;
                    this.apis.flyTo(latitude,longitude);
                },
                (error_message)=> this.ipLookUp()
            )
      } 
      else {this.ipLookUp()}
    }
    setCoords({latitude,longitude}){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(()=>this.setState({latitude,longitude}),500);   
    }
    flyTo(lat,lng){
      this.map.flyTo([lat, lng], 18);
      this.setState({latitude:lat,longotude:lng})
    }
    panTo(lat,lng){
      this.map.panTo({lat,lng})
      this.setState({latitude:lat,longitude:lng})
    }
    footer_layout(){
      let {onChange} = this.props;
      if(!onChange){return null}
      let {latitude,longitude} = this.state;
      return (
        <RVD
          layout={{
            style:{zIndex:10,position:'absolute',background:'rgba(255,255,255,.5)',bottom:12,left:12,width:'calc(100% - 24px)',border:'1px solid #ddd'},
            className:'theme-box-shadow of-visible br-6 p-v-6',align:'vh',
            column:[
                //{html:`latitude:${latitude.toFixed(6)} - Lonitude:${longitude.toFixed(6)}`,style:{width:'100%',fontSize:12,borderRadius:5},align:'h',className:'color3B55A5'},
                //{size:6},
                {
                    style:{width:'100%'},
                    className:'p-e-6',
                    row:[
                        {size:48,html:<Icon path={mdiCrosshairsGps} size={1} onClick={()=>this.goToCurrentPoint()}/>,align:'vh'},
                        {flex:1,html:<button style={{border:'none',background:'dodgerblue',color:'#fff'}} className='w-100 h-30 br-4' onClick={()=>onChange(latitude,longitude)}>تایید موقعیت</button>}
                    ]
                },
            ]
        }}
        />
      )
  }
  
    render(){
        let {
            changeView,zoom = 12,onClick,style,search,
            key = 'web.3037ddd42c9e4173af6427782584a2a1',
            onChange
        } = this.props;
        let {latitude,longitude} = this.state;
        return (
            <div style={style}>
              <NeshanMap
                options={{
                    key,
                    center: [latitude, longitude],
                    maptype:'standard-day',
                    dragging:changeView !== false,
                    scrollWheelZoom: 'center',
                    zoomControl:changeView !== false,
                    minZoom:changeView === false?zoom:undefined,
                    maxZoom:changeView === false?zoom:undefined,
                }}
                onZoom={()=>{
                  console.log('msf')
                }}
                onInit={(L, myMap) => {
                    this.map = myMap;
                    this.marker = L.marker([latitude, longitude])
                    .addTo(myMap)
                    .bindPopup('I am a popup.');
                    if(onClick){
                        myMap.on('click', (e)=> onClick());
                    }
                    if(onChange){
                        myMap.on('move', (e) => {
                            //marker.setLatLng(e.target.getCenter())
                            let {lat,lng} = e.target.getCenter()
                            this.marker.setLatLng({lat,lng})
                            this.setCoords({latitude:lat,longitude:lng})
                        });
                        myMap.on('click', (e) => {
                          //marker.setLatLng(e.target.getCenter())
                          let {lat,lng} = e.latlng
                          this.panTo(lat,lng);
                        });
                    }

                    // L.circle([35.699739, 51.338097], {
                    // color: 'dodgerblue',
                    // fillColor: 'dodgerblue',
                    // fillOpacity: 0.5,
                    // radius: 1500
                    // }).addTo(myMap);
                }}
                style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',zIndex:0}}
            />
            {this.footer_layout()}
            {
                search && 
                <MapSearch 
                    latitude={latitude} longitude={longitude}
                    onClick={(lat,lng)=>this.flyTo(lat,lng)}
                />
            }  
            </div>
        )
    }
}
class MapSearch extends Component{
  constructor(props){
      super(props);
      this.dom = createRef()
      this.state = {searchValue:'',searchResult:[],loading:false,showResult:false}
  }
  async changeSearch(searchValue){
      let {latitude,longitude} = this.props;
      this.setState({searchValue});

      clearTimeout(this.timeout);
      this.timeout = setTimeout(async ()=>{
          let param = {
              headers:{
                  'Api-Key':'service.8f13cd0a4d2442399a3d690d26e993ed',
                  'Authorization':undefined
              }
          }
          let url = `https://api.neshan.org/v1/search?term=${searchValue}&lat=${latitude}&lng=${longitude}`;
          this.setState({loading:true})
          let res = await Axios.get(url,param);
          this.setState({loading:false}) 
          if(res.status !== 200){return}
          this.setState({searchResult:res.data.items})
      },1000)
  }
  space_layout(type){
        let {searchResult,showResult} = this.state;
        if(type === 'last'){
            if(!searchResult || !searchResult.length || !showResult){return false}
        }
        let layout = {onClick:()=>this.setState({showResult:false})};
        if(type === 'first'){layout.size = 12;}
        else {layout.flex = 1;}
        return layout;
  }
  input_layout(){
      let {searchValue,loading,showResult,searchResult} = this.state;
      let showCloseButton = !!showResult && !!searchResult.length;
      let showLoading = !!loading;
      return {
        className:'p-h-12',
        row:[
            {
                align:'h',flex:1,
                html:(
                      <input 
                          ref={this.dom}
                          value={searchValue}
                          onChange={(e)=>this.changeSearch(e.target.value)}
                          onClick={()=>this.setState({showResult:true})}
                          style={{
                              width:'100%',padding:'0 12px',height:36,
                              boxSizing:'border-box',borderRadius:4,fontFamily:'inherit',outline:'none',border:'none'
                          }} 
                          type='text' placeholder='جستجو'
                      />
                )
            },
            {
                size:36,show:showLoading,align:'vh',style:{color:'#888',background:'#fff'},
                html:<Icon path={mdiLoading} size={1} spin={0.4}/>
            },
            {
                size:36,show:showCloseButton,align:'vh',style:{color:'#888',background:'#fff'},
                html:<Icon path={mdiClose} size={0.8} onClick={()=>this.setState({showResult:false})}/>
            },
            {
                size:36,show:!showCloseButton && !showLoading,align:'vh',style:{color:'#888',background:'#fff'},
                html:<Icon path={mdiMagnify} size={0.8}/>
            }
        ]
      }
  }
  result_layout(){
        let {searchResult,showResult} = this.state;
        if(!searchResult || !searchResult.length || !showResult){return false}
        let {onClick} = this.props;
        return {
            style:{background:'rgba(255,255,255,0.95)',height:'fit-content',maxHeight:400},
            className:'m-h-12 p-v-12 ofy-auto m-t-3 br-4',gap:3,
            column:searchResult.map(({title,address,location})=>{
                return {
                    onClick:()=>{
                        this.setState({showResult:false});
                        onClick(location.y,location.x,title)
                    },
                    column:[
                        {
                            html:title,className:'p-h-12 fs-12',align:'v'
                        },
                        {html:address,className:'p-h-12 fs-10',align:'v',style:{opacity:0.5}}
                    ]
                }
            })
        }
    }
    render(){
        let {searchResult,showResult} = this.state;
        let isOpen = true;
        if(!searchResult || !searchResult.length || !showResult){isOpen = false}
        return (
            <RVD
                layout={{
                    style:{position:'absolute',width:'100%',height:isOpen?'100%':50,left:0,top:0,zIndex:1000},
                    column:[
                        this.space_layout('first'),
                        this.input_layout(),
                        this.result_layout(),
                        this.space_layout('last')
                    ]
                }}
            />
        )
    }
}
const BASE_URL = "https://static.neshan.org";
const DEFAULT_URL = `${BASE_URL}/sdk/leaflet/1.4.0/leaflet.js`;
function NeshanLoader (props){
  const createScript = () => {
    const { onError, onLoad } = props;
    const script = document.createElement("script");

    script.src = DEFAULT_URL;

    script.onload = () => {
      if (onLoad) onLoad();
      return;
    };

    script.onerror = () => {
      if (onError) onError();
      return;
    };

    document.body.appendChild(script);
  };

  return createScript();
};
const NeshanMap = (props) => {
  const { style, options, onInit } = props;
  const mapEl = useRef(null);
  const [init,setInit] = useState(false)

  const defaultStyle = {
    width: "600px",
    height: "450px",
    margin: 0,
    padding: 0,
    background: "#eee",
  };

  const defaultOptions = {
    key: "YOUR_API_KEY",
    maptype: "dreamy",
    poi: true,
    traffic: false,
    center: [35.699739, 51.338097],
    zoom: 14,
  };

  useEffect(() => {
    if(init){return}
    setInit(true)
    NeshanLoader({
      onLoad: () => {
        let map = new window.L.Map(mapEl.current, { ...defaultOptions, ...options });
        if (onInit) onInit(window.L, map);
      },
      onError: () => {
        console.error("Neshan Maps Error: This page didn't load Neshan Maps correctly");
      },
    });
  });
  return <div ref={mapEl} style={{ ...defaultStyle, ...style }} />;
};