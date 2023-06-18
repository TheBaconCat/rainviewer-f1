import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { AppBar, CircularProgress, FormControl, FormLabel, MenuItem, Select, Toolbar, Typography } from '@mui/material';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import './App.css';
import { LatLngExpression } from 'leaflet';
import GeoJsonMap from './components/f1geojson';
import F1Schedule from './components/F1Schedule';
import BackToTopButton from './components/BackToTopButton';

const App = () => {
  const position: LatLngExpression = [37.0902, -95.7129];
  const cartoAttribution = `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, 
  &copy; <a href="https://carto.com/attributions">CARTO</a>`;
  const [rainviewerTheme, setRainviewerTheme] = useState<number | string>(8);
  const [timeUTC, setTimeUTC] = useState<number>(0);
  const [dateTime, setDateTime] = useState<string>('');

  useEffect(() => {
    const fetchInitialTime = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        const utcTime = data.radar.past.slice(-1)[0].time;
        const localTime = DateTime.fromMillis(utcTime * 1000).toLocaleString(DateTime.DATETIME_MED);
        console.log(utcTime);
        console.log(localTime);
        const utcDate = DateTime.fromSeconds(utcTime).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
        setTimeUTC(utcTime);
        setDateTime(utcDate);
      } catch (error) {
        console.error('Error fetching initial time:', error);
      }
    };
    /* Setting up an interval that calls the `fetchInitialTime` function every 5 minutes (60 seconds * 5000
milliseconds). This is used to update the UTC time displayed on the app. */
    const interval = setInterval(fetchInitialTime, 60 * 5000);
    console.log('Interval Updated');
    const storedTheme = localStorage.getItem('rainviewerTheme');
    if (storedTheme !== null) {
      setRainviewerTheme(storedTheme); // Parse the stored value as an integer
    }
    // Fetch initial time on component mount
    fetchInitialTime();

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('rainviewerTheme', rainviewerTheme.toString());
  }, [rainviewerTheme]);
  const logoSVG = (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 335.841 335.841' width='32' height='32' fill='aqua'>
      <path d='m331.947 226.808-1.932-5.573a111.201 111.201 0 0 0-4.532-11.097L306.735 170.5l-25.861-54.679a140.294 140.294 0 0 0-5.387-10.291c-.69-1.193-1.312-2.233-1.653-2.718-25.83-36.785-75.364-58.221-137.009-59.039-.608-.009-1.205-.013-1.811-.013C61.197 43.76.632 102.967.005 175.742c-.364 42.22 19.624 82.54 53.467 107.858 7.311 5.469 16.443 8.48 25.715 8.48h223.812c13.745 0 26.062-9.207 29.952-22.39 4.169-14.131 3.822-28.959-1.004-42.882zm-17.75-11.513h-19.735l-43.618-87.761h21.892l.058.133.084.201 41.319 87.427zm-140.699-87.418 39.437 79.33a80.034 80.034 0 0 1-21.465-15.35c-15.112-15.111-23.436-35.203-23.436-56.573 0-3.48 2.304-6.43 5.464-7.407zm57.011 85.479-42.664-85.821h22.982l43.628 87.761h-6.411a80.766 80.766 0 0 1-17.535-1.94zm38.463 1.939-43.628-87.761h10.983l43.618 87.761h-10.973zm51.509 50.717c-2.271 7.695-9.46 13.069-17.483 13.069H79.187c-6.483 0-12.85-2.092-17.928-5.891-30.543-22.85-48.583-59.237-48.254-97.337C13.57 110.186 68.303 56.76 135.014 56.76c.548 0 1.088.004 1.638.011 59.62.791 106.684 21.727 129.163 57.449l.174.314h-90.214c-11.436 0-20.74 9.309-20.74 20.75 0 24.843 9.675 48.199 27.242 65.765 17.559 17.57 40.916 27.246 65.768 27.246h70.66l.96 2.771c3.932 11.345 4.215 23.429.816 34.946z' />
      <path d='M128.605 135.536c-11.854 0-21.499 9.645-21.499 21.499s9.645 21.499 21.499 21.499c11.855 0 21.5-9.645 21.5-21.499s-9.645-21.499-21.5-21.499zm0 29.998c-4.687 0-8.499-3.813-8.499-8.499s3.813-8.499 8.499-8.499 8.5 3.813 8.5 8.499-3.813 8.499-8.5 8.499z' />
    </svg>
  );
  return (
    <main id='App'>
      <AppBar component='nav' position='absolute'>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {logoSVG}
          <Typography variant='h4'>Rainviewer For F1</Typography>
          <div>
            <FormControl sx={{ mb: '5px' }}>
              <FormLabel id='rainviewer-theme-label' sx={{ textAlign: 'center', color: 'white' }}>
                Rainviewer Theme
              </FormLabel>
              <Select
                labelId='rainviewer-theme-label'
                value={rainviewerTheme}
                onChange={(e) => {
                  setRainviewerTheme(e.target.value);
                }}>
                <MenuItem value={8}>Dark Sky</MenuItem>
                <MenuItem value={1}>Original</MenuItem>
                <MenuItem value={2}>Universal Blue</MenuItem>
                <MenuItem value={3}>TITAN</MenuItem>
                <MenuItem value={4}>The Weather Channel (TWC)</MenuItem>
                <MenuItem value={5}>Meteored</MenuItem>
                <MenuItem value={6}>NEXRAD Level III</MenuItem>
                <MenuItem value={7}>Rainbow @ SELEX-IS</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Toolbar>
      </AppBar>
      <div style={{ marginTop: '80px' }}>
        <MapContainer id='map' center={position} zoom={5} minZoom={3} preferCanvas={true}>
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
              <>
                <GeoJsonMap />
                <LayersControl.Overlay checked name='Rainviewer'>
                  <TileLayer
                    url={`https://tilecache.rainviewer.com/v2/radar/${timeUTC}/256/{z}/{x}/{y}/${rainviewerTheme}/1_1.png`}
                  />
                </LayersControl.Overlay>
              </>
            ) : null}
          </LayersControl>
        </MapContainer>
      </div>

      {dateTime ? (
        <AppBar component='footer' position='sticky' sx={{ top: 'auto', bottom: 0 }}>
          <Toolbar sx={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>Weather Last Updated: {dateTime}</Typography>
            <Typography style={{ textAlign: 'center' }}>
              Data provided by{' '}
              <a href='https://www.rainviewer.com/api.html' target='_blank' rel='noopener noreferrer'>
                RainViewer API
              </a>
            </Typography>
            <Typography variant='subtitle1' sx={{ marginRight: '16px' }}>
              Scroll Down ↓ to see Race Schedule
            </Typography>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar component='footer' position='sticky' sx={{ top: 'auto', bottom: 0 }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            <CircularProgress />
          </Toolbar>
        </AppBar>
      )}

      <F1Schedule />
      <BackToTopButton />
    </main>
  );
};

export default App;
