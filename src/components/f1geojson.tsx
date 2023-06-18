import { GeoJSON, Marker, Popup } from 'react-leaflet';
import f1Circuits from '../f1Tracks.json';
import f1locations from '../f1locations2023.json';
import { LatLngExpression } from 'leaflet';

const GeoJsonMap = () => {
  return (
    <>
      {f1Circuits.features.map((feature) => {
        const { properties, geometry } = feature;
        const { id } = properties;
        return <GeoJSON key={id} data={geometry as GeoJSON.GeoJsonObject} style={{ color: 'blue' }}></GeoJSON>;
      })}
      {f1locations.Tracks.map((track) => {
        const { lat, lon, location, name } = track;
        const coordinates: LatLngExpression = [lat, lon];

        return (
          <Marker key={name} position={coordinates}>
            <Popup>
              <div>
                <h3>{name}</h3>
                <p>{`Location: ${location}`}</p>
                <p>{`Latitude: ${lat}, Longitude: ${lon}`}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default GeoJsonMap;
