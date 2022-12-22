import React, { Component,useEffect, useRef } from "react";
import "./index.css";

export default class Map extends Component{
    constructor(props){
        super(props);
        let {latitude,longitude} = props;
        this.state = {latitude,longitude}
    }
    setCoords({latitude,longitude}){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(()=>{
            if(this.props.onChange){
                this.props.onChange(latitude,longitude)
            }
            this.setState({latitude,longitude})
        },500);   
    }
    render(){
        let {
            changeView,zoom = 12,onClick,style,
            key = 'web.3b7ae71ad0f4482e84b0f8c47e762b5b',
            onChange
        } = this.props;
        let {latitude,longitude} = this.state;
        return (
            <NeshanMap
                options={{
                    key,
                    center: [latitude, longitude],
                    maptype:'standard-day',
                    dragging:changeView !== false,
                    zoomControl:changeView !== false,
                    minZoom:changeView === false?zoom:undefined,
                    maxZoom:changeView === false?zoom:undefined,
                }}
                
                onInit={(L, myMap) => {
                    let marker = L.marker([latitude, longitude])
                    .addTo(myMap)
                    .bindPopup('I am a popup.');
                    if(onClick){
                        myMap.on('click', (e)=> onClick());
                    }
                    if(onChange){
                        myMap.on('move', (e) => {
                            //marker.setLatLng(e.target.getCenter())
                            let {lat,lng} = e.target.getCenter()
                            marker.setLatLng({lat,lng})
                            this.setCoords({latitude:lat,longitude:lng})
                        });
                    }

                    // L.circle([35.699739, 51.338097], {
                    // color: 'dodgerblue',
                    // fillColor: 'dodgerblue',
                    // fillOpacity: 0.5,
                    // radius: 1500
                    // }).addTo(myMap);
                }}
                style={style}
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