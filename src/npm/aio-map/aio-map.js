import React, { Component, createContext, createRef } from "react";
import RVD from './../react-virtual-dom/react-virtual-dom';
import Axios from 'axios';
import { Icon } from '@mdi/react';
import { mdiChevronRight, mdiClose, mdiCrosshairsGps, mdiLoading, mdiMagnify } from '@mdi/js';
import * as ReactDOMServer from 'react-dom/server';
import $ from 'jquery';
import "./aio-map.css";
const MapContext = createContext();
export default class Map extends Component {
    constructor(props) {
        super(props);
        this.markers = []
        this.dom = createRef();
        let { latitude = 35.699739, longitude = 51.338097,zoom = 14 } = props;
        this.state = { address:'',latitude, longitude,prevLatitude:latitude,prevLongitude:longitude,zoom,prevZoom:zoom }
    }
    handleArea(){
        let {area} = this.props;
        if(this.area){this.area.remove()}
        if(area){
            let {color = 'dodgerblue',opacity = 0.1,radius = 1000,latitude,longitude} = area;
            this.area = this.L.circle([latitude, longitude], {color,fillColor: color,fillOpacity: opacity,radius}).addTo(this.map);
        }
    }
    ipLookUp() {
        $.ajax('http://ip-api.com/json')
            .then(
                (response) => {
                    let { lat, lon } = response;
                    this.flyTo(lat, lon,undefined,'ipLookUp')
                },
                (data, status) => {
                    console.log('Request failed.  Returned status of', status);
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
    async getAddress(latitude, longitude){
        let { apiKeys = {}} = this.props;
        try{
            let param = {headers:{'Api-Key':apiKeys.service,Authorization:false}}
            let url = `https://api.neshan.org/v5/reverse?lat=${latitude}&lng=${longitude}`;
            let res = await Axios.get(url,param);
            let address;
            if(res.status !== 200){address = ''}
            else {address = res.data.formatted_address;}
            return address;
        }
        catch(err){
            return ''
        }
    }
    async submit(){
        let { onSubmit} = this.props;
        let { latitude, longitude } = this.state;
        let address = await this.getAddress(latitude,longitude);
        onSubmit(latitude, longitude,address)
    }
    goToCurrent() {
        console.log('goToCurrent')
        
        if ("geolocation" in navigator) {
            this.handlePermission();
            // check if geolocation is supported/enabled on current browser
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    let { latitude, longitude } = position.coords;
                    this.apis.flyTo(latitude, longitude,undefined,'goToCurrent');
                },
                (error_message) => this.ipLookUp()
            )
        }
        else { this.ipLookUp() }
    }
    flyTo(lat, lng,zoom = this.state.zoom,caller) {
        console.log('flyTo',caller)
        this.map.flyTo([lat, lng], zoom,{animate: true,duration: 1.4});
    }
    panTo(lat, lng) {
        console.log('panTo')
        this.map.panTo({ lat, lng })
    }
    async updateAddress(lat,lng){
        console.log('updateAddress')
        let {onChangeAddress} = this.props;
        let address = await this.getAddress(lat,lng)
        this.setState({address})
        if(onChangeAddress){
            onChangeAddress(address)
        }
    }
    move(lat, lng,caller){
        console.log('move',caller)
        let {onChange = ()=>{}} = this.props;
        this.marker.setLatLng({ lat, lng })
        clearTimeout(this.timeout);

        this.timeout = setTimeout(async () => {
            this.setState({ latitude: lat, longitude: lng },()=>{
                onChange(lat,lng);
                this.updateAddress(lat,lng)
            })
        }, 700);
    }
    //maptype: "dreamy" | 'standard-day'
    
    init(){
        console.log('init')
        let {zoom = 12, onClick, apiKeys,onChange,onSubmit,popup} = this.props;
        let { latitude, longitude } = this.state;
        let changeView = (!!onSubmit || !!onChange) && !popup;
        let config = {
            key: apiKeys.map,
            maptype: 'standard-day',
            maptype: 'dreamy-gold',
            poi: true,
            traffic: false,
            center: [latitude, longitude],
            zoom: 14,
            dragging: !popup,
            scrollWheelZoom: 'center',
            minZoom: changeView === false ? zoom : undefined,
            maxZoom: changeView === false ? zoom : undefined,
            // zoomControl: changeView !== false
        }
        let map = new window.L.Map(this.dom.current, config);
        let L = window.L;
        let myMap = map;
        this.map = myMap;
        this.L = L;
        this.marker = L.marker([latitude, longitude])
            .addTo(myMap);
        if(popup){
            myMap.on('click', (e) => this.setState({showPopup:true}));
        }
        else if (onClick) {
            myMap.on('click', (e) => onClick());
        }
        if(!popup){
            myMap.on('move', (e) => {
                //marker.setLatLng(e.target.getCenter())
                let { lat, lng } = e.target.getCenter()
                this.move(lat,lng,'init')
            });
        }
        if (changeView) {
            
            myMap.on('click', (e) => {
                //marker.setLatLng(e.target.getCenter())
                let { lat, lng } = e.latlng
                this.map.panTo({ lat, lng })
                //this.panTo(lat, lng);
            });
        }
        this.updateAddress(latitude, longitude);
        this.handleMarkers()
        this.handleArea()
    }
    componentDidMount(){
        if(document.getElementById('aio-map-neshan') === null){
            try{
                const script = document.createElement("script");
                script.src = `https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js`;
                script.id = 'aio-map-neshan'
                script.onload = () => this.init();
                document.body.appendChild(script);
            }
            catch(err){
                console.log(err)
            }
        }
        else {this.init()}
    }
    componentDidUpdate(){
        let {latitude:plat,longitude:plon,zoom:pzoom = 14} = this.props;
        let {prevLatitude:slat,prevLongitude:slon,prevZoom:szoom} = this.state;
        if(plat !== slat || plon !== slon || pzoom !== szoom){
            setTimeout(()=>{
                this.flyTo(plat,plon,pzoom,'componentDidUpdate');
                this.setState({prevLatitude:plat,prevLongitude:plon,prevZoom:pzoom})
            },0)
        }
        this.handleArea()
        this.handleMarkers()
    }
    getMarkerDefaultOptions(marker){
        let {markerOptions = {}} = this.props;
        let {size : dsize = 20,color : dcolor = 'orange',html : dhtml,text : dtext = ''} = markerOptions;
        let {size = dsize,color = dcolor,html = dhtml,text = dtext} = marker;
        return {size,color,html,text}
    }
    getMarker(marker){
        let {size,color,html,text} = this.getMarkerDefaultOptions(marker);
        let innerSize = size * 0.4;
        let borderSize = Math.ceil(size / 10);
        let innerTop = Math.round(size / 25);
        let top = `-${(size / 2 + innerSize)}px`;
        let style1 = `transform:translateY(${top});flex-shrink:0;color:${color};width:${size}px;height:${size}px;border:${borderSize}px solid;position:relative;border-radius:100%;display:flex;align-items:center;justify-content:center;`
        let style2 = `position:absolute;left:calc(50% - ${innerSize}px);top:calc(100% - ${innerTop}px);border-top:${innerSize}px solid ${color};border-left:${innerSize}px solid transparent;border-right:${innerSize}px solid transparent;`
        let innerHtml = '',innerText = '';
        if(html){
            innerHtml = ReactDOMServer.renderToStaticMarkup(html)
        }
        if(text){
            innerText = ReactDOMServer.renderToStaticMarkup(text)
        }
        return (`<div style="${style1}">${innerHtml}<div class='aio-map-marker-text'>${innerText}</div><div style="${style2}"></div></div>`)
    }
    
    handleMarkers(){
        let {markers = []} = this.props;
        if(!markers){markers = []} 
        if(this.markers.length){
            for(let i = 0; i < this.markers.length; i++){
                this.markers[i].remove();
            }
            this.markers = [];
        }
        for(let i = 0; i < markers.length; i++){
            let marker = markers[i];
            let {latitude,longitude} = marker;
            this.markers.push(
                this.L.marker([latitude, longitude],{icon:this.L.divIcon({html: this.getMarker(marker)})}).addTo(this.map).bindPopup('marker.')
            )
        }
    }
    getContext(){
        return {
            rootProps:{...this.props},
            rootState:{...this.state},
            submit:this.submit.bind(this),
            flyTo:this.flyTo.bind(this),
            goToCurrent:this.goToCurrent.bind(this)
        }
    }
    renderPopup(){
        let {apiKeys} = this.props;
        let {showPopup} = this.state;
        if(showPopup){
            let {popup,search,title} = this.props;
            let {latitude,longitude} = this.state;
            let props = {
                apiKeys,popup:undefined,latitude,longitude,search,title,
                style:{width:'100%',height:'100%',top:0,position:'fixed',left:0,zIndex:10,...popup.style},
                onClick:undefined,
                onClose:()=>this.setState({showPopup:false}),
                onChange:undefined,
                onSubmit:(lat,lng)=>{this.move(lat,lng); this.setState({showPopup:false})}
            }
            return <Map {...props}/>
        }
        return null
    }
    render() {
        let {style = {width:'100%',height:240}} = this.props;
        console.log('render')
        return (
            <>
                <MapContext.Provider value={this.getContext()}>
                    <div style={style} className='aio-map'>
                        <div ref={this.dom} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 0  }} />
                        <MapFooter/>
                        <MapHeader/>
                    </div>
                </MapContext.Provider>
                {this.renderPopup()}
            </>
        )
    }
}
class MapHeader extends Component {
    static contextType = MapContext;
    constructor(props) {
        super(props);
        this.dom = createRef()
        this.state = { searchValue: '', searchResult: [], loading: false, showResult: false }
    }
    async changeSearch(searchValue) {
        let {rootProps,rootState} = this.context;
        let { latitude, longitude } = rootState;
        this.setState({ searchValue });
        clearTimeout(this.timeout);
        let {apiKeys = {}} = rootProps;
        this.timeout = setTimeout(async () => {
            try{
                let param = {headers: {'Api-Key': apiKeys.service}}
                let url = `https://api.neshan.org/v1/search?term=${searchValue}&lat=${latitude}&lng=${longitude}`;
                this.setState({ loading: true })
                let res = await Axios.get(url, param);
                this.setState({ loading: false })
                if (res.status !== 200) { return }
                this.setState({ searchResult: res.data.items })
            }
            catch(err){}
        }, 1000)
    }
    input_layout() {
        let {rootProps} = this.context;
        if(!rootProps.search){return false}
        
        let { searchValue, loading, showResult, searchResult } = this.state;
        let showCloseButton = !!showResult && !!searchResult.length;
        let showLoading = !!loading;
        return {
            className: 'aio-map-search',
            row:[
                this.currentPoint_layout(),
                {
                    flex:1,
                    row: [
                        {
                            align: 'h', flex: 1,
                            html: (
                                <input
                                    ref={this.dom}
                                    value={searchValue}
                                    onChange={(e) => this.changeSearch(e.target.value)}
                                    onClick={() => this.setState({ showResult: true })}
                                    className='aio-map-search-input'
                                    type='text' placeholder='جستجو'
                                />
                            )
                        },
                        {
                            show: showLoading, align: 'vh', className:'aio-map-search-icon',
                            html: <Icon path={mdiLoading} size={1} spin={0.4} />
                        },
                        {
                            show: showCloseButton, align: 'vh', className:'aio-map-search-icon',
                            html: <Icon path={mdiClose} size={0.8} onClick={() => this.setState({ showResult: false })} />
                        },
                        {
                            show: !showCloseButton && !showLoading, align: 'vh', className:'aio-map-search-icon',
                            html: <Icon path={mdiMagnify} size={0.8} />
                        }
                    ]
                }
            ]
        }
    }
    result_layout() {
        let {flyTo} = this.context;
        let { searchResult, showResult } = this.state;
        if (!searchResult || !searchResult.length || !showResult) { return false }
        return {
            className: 'aio-map-search-results', 
            column: searchResult.map(({ title, address, location }) => {
                return {
                    onClick: () => {
                        this.setState({ showResult: false });
                        flyTo(location.y, location.x, undefined,'result_layout')
                    },
                    className:'aio-map-search-result',
                    column: [
                        {
                            html: title, className: 'aio-map-search-result-text', align: 'v'
                        },
                        { html: address, className: 'aio-map-search-result-subtext', align: 'v', style: { opacity: 0.5 } }
                    ]
                }
            })
        }
    }
    header_layout(){
        let {rootProps} = this.context;
        let {title,onClose} = rootProps;
        if(typeof title !== 'string' && !onClose){return false}
        return {
            row:[
                {show:!!onClose,align:'vh',html:<Icon path={mdiChevronRight} size={1}/>,className:'aio-map-close',onClick:()=>onClose()},
                {show:typeof title === 'string',html:title,className:'aio-map-title',align:'v'},
                
            ]
        }
    }
    currentPoint_layout(){
        let {goToCurrent} = this.context;
        return { className:'aio-map-current-point',html: <Icon path={mdiCrosshairsGps} size={0.8} onClick={() => goToCurrent()} />, align: 'vh' }
    }
    render() {
        let {rootProps} = this.context;
        if(rootProps.popup){return null}
        if(!rootProps.search && !rootProps.title && !rootProps.onClose){return null}
        let { searchResult, showResult } = this.state;
        let isOpen = true;
        if (!searchResult || !searchResult.length || !showResult) { isOpen = false }
        return (
            <RVD
                layout={{
                    className:'aio-map-header of-visible' + (isOpen?' aio-map-header-open':''),
                    style: {  },
                    column: [
                        this.header_layout(),
                        this.input_layout(),
                        this.result_layout(),
                    ]
                }}
            />
        )
    }
}
class MapFooter extends Component{
    static contextType = MapContext;
    submit_layout(){
        let {submit} = this.context;
        return {html: (<button className='aio-map-submit-button' onClick={async () => submit()}>تایید موقعیت</button>)}
    }
    render(){
        let { rootProps,rootState } = this.context;
        let { onSubmit,popup } = rootProps;
        if(popup){return null}
        if (!onSubmit) { return null }
        return (
            <RVD 
                layout={{
                    className: 'aio-map-footer',
                    row:[
                        {html:rootState.address,className:'aio-map-address',},
                        this.submit_layout()
                    ]
                }}
            />
        )
    }
}


export function getDistance(p1,p2) {
    let {latitude:lat1,longitude:lon1} = p1;
    let {latitude:lat2,longitude:lon2} = p2;
    let rad = Math.PI / 180;
    let radius = 6371; //earth radius in kilometers
    return Math.acos(Math.sin(lat2 * rad) * Math.sin(lat1 * rad) + Math.cos(lat2 * rad) * Math.cos(lat1 * rad) * Math.cos(lon2 * rad - lon1 * rad)) * radius; //result in Kilometers
}