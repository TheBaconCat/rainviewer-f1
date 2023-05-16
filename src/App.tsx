import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "./App.css";
import { LatLngExpression } from "leaflet";

const App = () => {
  const position: LatLngExpression = [30.1345808, -97.6358511];
  const mapboxAttribution =
    '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>';
  const cartoAttribution = `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>`;

  return (
    <div id="map">
      <MapContainer
        center={position}
        zoom={13}
      >
        <TileLayer
          url="https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWVldG1hcDIwMjEiLCJhIjoiY2xkZjFzNnpxMGpkMDNwbW1lcDZjNjBtNiJ9.lNZkW0bn55x20cdTMoGorA"
          attribution={mapboxAttribution}
        />
        <TileLayer
          url={
            "https://tilecache.rainviewer.com//v2/radar/1684271400/256/{z}/{x}/{y}/8/1_1.png"
          }
        />
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="OSM">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OSM Dark">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
              attribution={cartoAttribution}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OSM Light">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
              attribution={cartoAttribution}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default App;
