import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import './App.css';
import { LatLngExpression } from 'leaflet';
import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { AppBar, CircularProgress, Toolbar, Typography } from '@mui/material';

const App = () => {
  const position: LatLngExpression = [37.0902, -95.7129];
  const cartoAttribution = `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>`;
  const [timeUTC, setTimeUTC] = useState<number>(0);
  const [dateTime, setDateTime] = useState<string>('');

  useEffect(() => {
    const fetchInitialTime = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        const utcTime = data.radar.past.slice(-1)[0].time;
        console.log(utcTime);
        const utcDate = DateTime.fromSeconds(utcTime).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
        setTimeUTC(utcTime);
        setDateTime(utcDate);
      } catch (error) {
        console.error('Error fetching initial time:', error);
      }
    };
    const interval = setInterval(fetchInitialTime, 60 * 5000);
    console.log('Interval updated');

    // Fetch initial time on component mount
    fetchInitialTime();

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <main id='App'>
      <MapContainer id='map' center={position} zoom={5}>
        <LayersControl position='topright'>
          <LayersControl.BaseLayer checked name='OSM'>
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name='OSM Dark'>
            <TileLayer
              url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
              attribution={cartoAttribution}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name='OSM Light'>
            <TileLayer
              url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
              attribution={cartoAttribution}
            />
          </LayersControl.BaseLayer>
          {timeUTC ? (
            <LayersControl.Overlay checked name='Rainviewer'>
              <TileLayer url={`https://tilecache.rainviewer.com/v2/radar/${timeUTC}/256/{z}/{x}/{y}/8/1_1.png`} />
            </LayersControl.Overlay>
          ) : null}
        </LayersControl>
      </MapContainer>
      {dateTime ? (
        <AppBar component={'footer'} position='fixed' sx={{ top: 'auto', bottom: 0, left: 0, width: { s: 200 } }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            <Typography variant='h5'>Weather Last Updated: {dateTime}</Typography>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar position='fixed' sx={{ top: 'auto', bottom: 0, left: 0, width: { s: 200 } }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            <CircularProgress />
          </Toolbar>
        </AppBar>
      )}
    </main>
  );
};

export default App;
