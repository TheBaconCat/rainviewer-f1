import { DateTime } from 'luxon';
import { AttributionControl, Map, NavigationControl } from 'maplibre-gl';
import { lazy, useCallback, useEffect, useRef, useState } from 'react';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import ExploreIcon from '@mui/icons-material/Explore';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PaletteIcon from '@mui/icons-material/Palette';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import { SelectChangeEvent } from '@mui/material/Select';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Typography from '@mui/material/Typography';
import { F1TrackGeoJSON } from '../utils/F1TracksGeoJSON';
const F1SidePanel = lazy(() => import('./F1SidePanel'));

interface rainViewerInterface {
  generated: number;
  host: string;
  radar: Radar;
  version: string;
}
interface Radar {
  nowcast: Nowcast[];
  past: Past[];
}

interface Nowcast {
  path: string;
  time: number;
}

interface Past {
  path: string;
  time: number;
}
const mapStyleOptions = [
  {
    label: 'Light',
    value: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    icon: <WbSunnyIcon />,
  },
  {
    label: 'Voyager',
    value: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    icon: <ExploreIcon />,
  },
  {
    label: 'Dark Matter',
    value: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    icon: <BlurOnIcon />,
  },
];

const actions = mapStyleOptions.map((option) => ({
  icon: option.icon,
  name: option.label,
  value: option.value,
}));

function F1Map() {
  const mapRef = useRef<Map | null>(null);
  const [frames, setFrames] = useState<Past[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [autoAnimate] = useAutoAnimate();
  const [mapStyle, setMapStyle] = useState(() => {
    // Initialize the mapStyle state from local storage or set to default if not available
    const storedMapStyle = localStorage.getItem('mapStyle');
    return storedMapStyle ?? mapStyleOptions[1].value;
  });
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const handleSpeedDialOpen = () => {
    setSpeedDialOpen(true);
  };

  const handleSpeedDialClose = () => {
    setSpeedDialOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('mapStyle', mapStyle);
  }, [mapStyle]);

  const handleMapThemeChange = (event: SelectChangeEvent) => {
    const newStyleURL = event.target.value;
    setSpeedDialOpen(false); // Close the SpeedDial
    // Update the map style with the new base map style
    mapRef.current?.setStyle(newStyleURL);
    setMapStyle(newStyleURL);
    fetchAndUpdateMap();
  };

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new Map({
      container: 'map',
      style: mapStyle,
      attributionControl: false,
      refreshExpiredTiles: false,
      center: { lat: 37.0902, lon: -95.7129 },
      zoom: 4,
      minZoom: 4,
    });

    mapRef.current.on('load', () => {
      mapRef.current?.addControl(
        new NavigationControl({
          visualizePitch: true,
        }),
        'top-left'
      );

      mapRef.current?.addControl(
        new AttributionControl({
          customAttribution: [
            `© <a href='https://www.rainviewer.com/api.html' target='_blank' rel='noopener noreferrer'>Rainviewer</a>`,
            `© <a href='https://open-meteo.com/' target='_blank' rel='noopener noreferrer'>Open-Meteo</a>`,
          ],
        }),
        'bottom-left'
      );

      fetchAndUpdateMap(); // Moved this function call here to add the rainviewer layers first.
    });
  }, [mapStyle]);

  function fetchAndUpdateMap() {
    console.log('Fetching data and updating the map...');
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((apiData: rainViewerInterface) => {
        const pastFrames = apiData.radar.past;
        setFrames(pastFrames);

        const latestFrameIndex = pastFrames.length - 1;
        setFrameIndex(latestFrameIndex);

        pastFrames.forEach((frame) => {
          const layerId = `rainviewer_${frame.path}`;
          const sourceId = frame.path;
          if (mapRef.current?.getSource(sourceId)) {
            mapRef.current.removeLayer(layerId);
            mapRef.current.removeSource(sourceId);
          }
          mapRef.current?.addSource(sourceId, {
            type: 'raster',
            tiles: [`${apiData.host}/${frame.path}/512/{z}/{x}/{y}/2/1_1.png`],
            tileSize: 512,
          });
          mapRef.current?.addLayer({
            id: layerId,
            type: 'raster',
            source: sourceId,
            minzoom: 4,
          });
        });
        mapRef.current?.addSource('f1tracks', {
          type: 'geojson',
          data: F1TrackGeoJSON,
        });

        mapRef.current?.addLayer({
          id: 'tracks',
          type: 'line',
          source: 'f1tracks',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': 'blue',
            'line-width': 2,
          },
          minzoom: 0,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.warn('Error:', error.message);
        }
      });
  }

  function updateFrameVisibility(frames: Past[]) {
    frames.forEach((frame: { path: string }, index: number) => {
      const opacity = index === frameIndex ? 1 : 0;
      const layerId = `rainviewer_${frame.path}`;

      if (mapRef.current?.getLayer(layerId)) {
        mapRef.current.setPaintProperty(layerId, 'raster-opacity-transition', {
          duration: 0, // Transition duration in milliseconds
          delay: 0, // No delay
        });
        mapRef.current.setPaintProperty(layerId, 'raster-opacity', opacity);
      }
    });
  }

  function goToPreviousFrame() {
    let newIndex = frameIndex - 1;
    if (newIndex < 0) {
      newIndex = frames.length - 1;
    }
    setFrameIndex(newIndex);
  }

  const goToNextFrame = useCallback(() => {
    let newIndex = frameIndex + 1;
    if (newIndex >= frames.length) {
      newIndex = 0;
    }
    setFrameIndex(newIndex);
  }, [frameIndex, frames.length]);

  function toggleAnimation() {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  }

  function updateTimestamp() {
    const frame = frames[frameIndex];
    const frameTime = frame.time;
    const timeUtc = DateTime.fromSeconds(frameTime).toLocaleString({
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    });
    setTimestamp(timeUtc);
  }

  useEffect(() => {
    if (frames.length > 0) {
      updateFrameVisibility(frames);
      updateTimestamp();
    }
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!isPaused) {
      intervalId = setInterval(goToNextFrame, 2000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [goToNextFrame, isPaused]);

  return (
    <>
      <Box id='sidePanel' ref={autoAnimate}>
        <Box id='sidePanelContent'>
          <F1SidePanel mapRef={mapRef} />
        </Box>
      </Box>
      <Container maxWidth={false} id='mapContainer'>
        <Box id='map' />
        {timestamp ? (
          <>
            <Box
              position={'absolute'}
              sx={{
                bottom: '1rem',
                left: '62%',
                borderRadius: '0rem',
                width: 'fit-content',
                backdropFilter: 'blur(1px)',
              }}>
              <SpeedDial
                id='speedDial'
                ariaLabel='Map Theme Selector'
                icon={<PaletteIcon color='action' />}
                open={speedDialOpen}
                onOpen={handleSpeedDialOpen}
                onClose={handleSpeedDialClose}
                direction='up'
                FabProps={{
                  color: 'info',
                  style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(15px)',
                  },
                }}>
                {actions.map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    slotProps={{
                      tooltip: {
                        title: action.name,
                      },
                    }}
                    sx={action.value === mapStyle ? { color: '#3ea6ff' } : { color: 'white' }}
                    onClick={() => {
                      handleMapThemeChange({ target: { value: action.value } } as SelectChangeEvent);
                    }}
                  />
                ))}
              </SpeedDial>
            </Box>
            <Box
              id='timeStampContainer'
              position={'absolute'}
              sx={{
                bottom: '4.3rem',
                left: '39%',
                borderRadius: '8rem',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(1px)',
              }}>
              <Typography id='timeStamp' textAlign={'center'}>
                {timestamp}
              </Typography>
            </Box>
            <Box
              position={'absolute'}
              sx={{
                bottom: '1rem',
                left: '39%',
                borderRadius: '4rem',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(1px)',
              }}>
              <IconButton
                id='previousButton'
                onClick={goToPreviousFrame}
                disabled={frames.length <= 1}
                sx={{ marginRight: '0.5rem' }}>
                <NavigateBeforeIcon sx={{ fontSize: '2rem', color: '#fff' }} />
              </IconButton>
              <IconButton id='toggleButton' onClick={toggleAnimation} sx={{ margin: '0 0.5rem' }}>
                {isPaused ? (
                  <PlayArrowIcon sx={{ fontSize: '2rem', color: '#fff' }} />
                ) : (
                  <PauseIcon sx={{ fontSize: '2rem', color: '#fff' }} />
                )}
              </IconButton>
              <IconButton
                id='nextButton'
                onClick={goToNextFrame}
                disabled={frames.length <= 1}
                sx={{ marginLeft: '0.5rem' }}>
                <NavigateNextIcon sx={{ fontSize: '2rem', color: '#fff' }} />
              </IconButton>
            </Box>
          </>
        ) : null}
      </Container>
    </>
  );
}

export default F1Map;
