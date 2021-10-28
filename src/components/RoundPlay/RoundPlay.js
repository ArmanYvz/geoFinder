import React from "react";
import {useState,useEffect} from "react";
import {
    GoogleMap,
    StreetViewPanorama,
    Marker,
  } from "@react-google-maps/api";

import "./RoundPlay.css";



// Map variables

const mapContainerStyle= {
    width: "100%",
    height: "100%",
  };

  const mapCenter = {
    lat:41.106196,
    lng:28.803581
  };
  
  const mapOptions = {
    disableDefaultUI: true,
  };


// Streetview variables
  const streetviewContainerStyle = {
      width: "100%",
      height: "100%"
  }

  const streetviewOptions = {
    disableDefaultUI: true,
    clickToGo: true,
    showRoadLabels: false,
    visible: true,
  };
  


// distance formula for given longtitute and latitude
function calculateDistance(lat1,
                     lat2, lon1, lon2)
    {
        lon1 =  lon1 * Math.PI / 180;
        lon2 = lon2 * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;
   
        let dlon = lon2 - lon1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
                 + Math.cos(lat1) * Math.cos(lat2)
                 * Math.pow(Math.sin(dlon / 2),2);   
        let c = 2 * Math.asin(Math.sqrt(a));
        // Radius of earth in kilometers R = 6371. Use 3956
        // for miles
        let r = 6371;
        // calculate the result
        return(c * r);
    };

function RoundPlay({streetviewPosition}) {
  // Marker's position
  const [markerPosition,setMarkerPosition] = useState();

  const [mapClicked, setMapClicked] = useState(false);



// Handle the clicks on map (set the marker position on click)
  const handleMapClick = (event) =>{
    setMarkerPosition({lat: event.latLng.lat(),
                       lng: event.latLng.lng()});
    setMapClicked(true);
     };

  // calculate the distance and show alert when guess button is clicked
  const handleGuessButton = () =>{
    let distance = calculateDistance(streetviewPosition.lat,markerPosition.lat,streetviewPosition.lng,markerPosition.lng);
    alert("Distance: "+Math.round(distance)+" (Km)");
  
     };


    return(
        <div class= "play-game-container">
        {/* Google Map  */}
        <div class='map-view'>
          <GoogleMap mapContainerStyle={mapContainerStyle} 
            zoom ={3} 
            center={mapCenter} 
            options ={mapOptions}
            onClick={handleMapClick}>
              <Marker position = {markerPosition}/>
          </GoogleMap>
        </div>
    
        {/* Streetview */}
        <div class='street-view'>
          <GoogleMap
            mapContainerStyle={streetviewContainerStyle}
            zoom={14}
            
          >
            <StreetViewPanorama
                  position={streetviewPosition}
                  visible={true}
                  options={streetviewOptions}

                />
          </GoogleMap>
        </div>
  
        <div class = "play-game-footer">
        </div>
        <button type="button" id = "guessBtn" class="btn btn-primary" onClick={handleGuessButton} disabled={!mapClicked}>Guess</button>
  
      </div>
    )
}


export default RoundPlay