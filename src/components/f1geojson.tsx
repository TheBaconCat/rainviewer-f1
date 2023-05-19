import { GeoJSON } from 'react-leaflet';
import f1Circuits from '../f1Tracks.json';

const GeoJsonMap = () => {
  return (
    <>
      {f1Circuits.features.map((feature) => {
        const { properties, geometry } = feature;
        const { id } = properties;

        return <GeoJSON key={id} data={geometry as GeoJSON.GeoJsonObject} style={{ color: 'blue' }}></GeoJSON>;
      })}
    </>
  );
};

export default GeoJsonMap;
