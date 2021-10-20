import React from "react";
import {
  GoogleMap,
  LoadScript,
  StreetViewPanorama,
} from "@react-google-maps/api";

import "./App.css"

const mapContainerStyle = {
  width: "700px",
  height: "500px"
};

const center = {
  lat:41.106196,
  lng:28.803581
};

const mapOptions = {
  // disableDefaultUI: true,
};

function App() {

  return (<>

  <h1>INF503 Proje keyff</h1>

  <LoadScript
  googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>

    {/* soldaki harita */}
    <div id='mapLeft'>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom ={8} center={center} options ={mapOptions}>
      </GoogleMap>
    </div>

    {/* Streetview (sağdaki harita) */}
    <div id='mapRight'>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}
      >
        <StreetViewPanorama
              position={center}
              visible={true}
            />
      </GoogleMap>
    </div>

  </LoadScript>

  </>);
}

export default App;
