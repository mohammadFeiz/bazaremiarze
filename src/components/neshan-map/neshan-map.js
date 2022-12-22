import React, { useEffect, useRef } from "react";
import "./index.css";
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

export default NeshanMap;