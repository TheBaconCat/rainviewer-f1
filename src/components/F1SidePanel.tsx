import { lazy, Suspense, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { styled, lighten, darken } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import { F1ScheduleJSON } from '../utils/F1ScheduleJSON';
import { LngLatLike } from 'maplibre-gl';
import { Race } from '../interfaces/F1ScheduleInterface';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { DateTime } from 'luxon';
const F1Schedule = lazy(() => import('./F1Schedule'));
const Weather = lazy(() => import('./Weather'));

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

function filterOptions(options: Race[], { inputValue }: { inputValue: string }): Race[] {
  const searchTerm = inputValue.toLowerCase();

  return options.filter((option) => {
    const circuit = option.Circuit;
    return [option.raceName, circuit.circuitName, circuit.Location.country, circuit.Location.locality].some((field) =>
      field.toLowerCase().includes(searchTerm)
    );
  });
}

const GroupHeader = styled('h2')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: theme.palette.primary.main,
  backgroundColor:
    theme.palette.mode === 'light'
      ? lighten(theme.palette.primary.light, 0.85)
      : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled('ul')({
  padding: 0,
});

interface Props {
  mapRef: React.RefObject<maplibregl.Map | null>;
}

type TabValue = 'weather' | 'schedule' | 'settings';

function F1SidePanel({ mapRef }: Props) {
  const [selectedCircuit, setSelectedCircuit] = useState('');
  const [closestCircuit, setClosestCircuit] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<TabValue>('weather');
  const [autoAnimate] = useAutoAnimate();

  useEffect(() => {
    async function flyToSelectedCircuit(circuitName: string) {
      const map = mapRef.current;
      const data = F1ScheduleJSON.Races.find((race) => race.Circuit.circuitName === circuitName);
      if (data) {
        const { Circuit } = data;
        const coordinates: LngLatLike = [parseFloat(Circuit.Location.long), parseFloat(Circuit.Location.lat)];
        const Zoom = Circuit.Location.zoom;
        if (map?.getPitch() !== 0) {
          map?.resetNorthPitch({ animate: true, duration: 2000 });
        }
        await timer(2000);
        console.log(`Flying To ${selectedCircuit || nextCircuit} `);
        map?.flyTo({ center: coordinates, zoom: Zoom, duration: 8000, animate: true });
      }
    }

    async function jumpToSelectedCircuit(circuitName: string) {
      const map = mapRef.current;
      const data = F1ScheduleJSON.Races.find((race) => race.Circuit.circuitName === circuitName);
      if (data) {
        const { Circuit } = data;
        const coordinates: LngLatLike = [parseFloat(Circuit.Location.long), parseFloat(Circuit.Location.lat)];
        const Zoom = Circuit.Location.zoom;
        if (map?.getPitch() !== 0) {
          map?.resetNorthPitch({ animate: true, duration: 2000 });
        }
        await timer(2000);
        console.log(`Flying To ${selectedCircuit || nextCircuit} `);
        map?.jumpTo({ center: coordinates, zoom: Zoom });
      }
    }

    const currentDate = DateTime.now();

    let nextCircuit: string | null = null;
    let closestDateDiff: number | null = null;

    F1ScheduleJSON.Races.forEach((race) => {
      const { Circuit, sessions } = race;
      const raceDate = DateTime.fromISO(sessions.fp1);

      // If the current date is after the GP session, continue to the next race
      if (currentDate > DateTime.fromISO(sessions.gp)) {
        return;
      }

      // Calculate the difference in time between the current date and the race date
      const dateDiff = Math.abs(raceDate.diff(currentDate).milliseconds);

      // If this is the first iteration or the current race is closer to the current date, update the next circuit
      if (closestDateDiff === null || dateDiff < closestDateDiff) {
        nextCircuit = Circuit.circuitName;
        closestDateDiff = dateDiff;
      }
    });

    // If the current date is after all the races, set the closestCircuit to null
    if (nextCircuit === null) {
      setClosestCircuit(null);
      return;
    }

    async function handleCircuitChanges() {
      try {
        if (nextCircuit) {
          if (closestCircuit !== nextCircuit) {
            setClosestCircuit(nextCircuit);
            setSelectedCircuit(nextCircuit);
            await jumpToSelectedCircuit(nextCircuit);
          }
        }

        if (selectedCircuit !== nextCircuit) {
          await flyToSelectedCircuit(selectedCircuit);
        }

        if (selectedCircuit === closestCircuit) {
          await flyToSelectedCircuit(selectedCircuit);
        }
      } catch (error) {
        console.error('Circuit navigation failed:', error);
      }
    }

    void handleCircuitChanges();
  }, [closestCircuit, mapRef, selectedCircuit]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Typography variant='h3' textAlign='center' sx={{ mb: '1rem' }}>
        Circuit Info
      </Typography>
      <Autocomplete
        disablePortal
        onInputChange={(_e, value) => {
          setSelectedCircuit((value || closestCircuit) ?? '');
        }}
        value={F1ScheduleJSON.Races.find((race) => race.Circuit.circuitName === selectedCircuit) ?? null}
        renderInput={(params) => <TextField {...params} label='Select a Circuit' />}
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader sx={{ textAlign: 'center' }}>{params.group}</GroupHeader>
            <GroupItems id='groupItems'>{params.children}</GroupItems>
          </li>
        )}
        options={F1ScheduleJSON.Races.sort((a, b) => parseInt(a.round) - parseInt(b.round))}
        groupBy={(option) => `Round ${option.round} - ${option.raceName}`}
        getOptionLabel={(option) => option.Circuit.circuitName}
        filterOptions={filterOptions}
      />

      {selectedCircuit && (
        <Paper variant='outlined' sx={{ mt: '2rem' }}>
          {F1ScheduleJSON.Races.map((data) => {
            const { Circuit } = data;
            if (Circuit.circuitName === selectedCircuit) {
              return (
                <Box key={Circuit.circuitId} ref={autoAnimate}>
                  <Box style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      id={`flag-${Circuit.Location.countryCode}`}
                      width='auto'
                      height={'100vh'}
                      src={`https://flagcdn.com/${Circuit.Location.countryCode.toLowerCase()}.svg`}
                      srcSet={`https://flagcdn.com/${Circuit.Location.countryCode.toLowerCase()}.svg 2x`}
                      alt={Circuit.Location.country}
                      style={{ alignSelf: 'center', marginTop: '1rem', marginBottom: '1rem' }}
                    />
                  </Box>
                  <Typography variant='h4' textAlign={'center'}>
                    {Circuit.Location.locality}, {Circuit.Location.country}
                  </Typography>
                  <Tabs value={tabValue} onChange={handleTabChange} centered={true}>
                    <Tab value='weather' label='Weather' />
                    <Tab value='schedule' label='Schedule' />
                  </Tabs>
                  <Suspense>
                    {tabValue === 'weather' && (
                      <Weather lat={parseFloat(Circuit.Location.lat)} lon={parseFloat(Circuit.Location.long)} />
                    )}
                    {tabValue === 'schedule' && <F1Schedule selectedCircuit={selectedCircuit} />}
                  </Suspense>
                </Box>
              );
            }
            return null;
          })}
        </Paper>
      )}
    </>
  );
}

export default F1SidePanel;
