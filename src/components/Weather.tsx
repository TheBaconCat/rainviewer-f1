import { useAutoAnimate } from '@formkit/auto-animate/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid2';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from 'recharts';
import { WeatherSvg } from 'weather-icons-animated';
import { ChartData, WeatherInterface } from '../interfaces/WeatherInterface';
import weatherConditionCodes from '../utils/weatherConditionCodes';

interface Props {
  lat: number;
  lon: number;
}
function getWindDirectionArrow(degrees: number) {
  const directions = [
    '\u2191 N',
    '\u2192 NE',
    '\u2197 E',
    '\u2198 SE',
    '\u2193 S',
    '\u2199 SW',
    '\u2190 W',
    '\u2196 NW',
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
function Weather({ lat, lon }: Props) {
  const [weatherData, setWeatherData] = useState<WeatherInterface | null>(null);
  const [autoAnimate] = useAutoAnimate();
  const [lastWeatherUpdate, setlastWeatherUpdate] = useState<string | null>(null);
  const [showRainProbabilityGraph, setShowRainProbabilityGraph] = useState(true);
  const [showRainAmountGraph, setShowRainAmountGraph] = useState(true);
  const [closestRainProbability, setClosestRainProbability] = useState<number | null>(null);
  const [closestRainAmount, setClosestRainAmount] = useState<number | null>(null);
  const [metricUnits, setMetricUnits] = useState<boolean>(() => {
    // Initialize the metricUnits state from local storage or set to false (metric) if not available
    const storedMetricUnits = localStorage.getItem('metricUnits');
    return storedMetricUnits ? (JSON.parse(storedMetricUnits) as boolean) : false;
  });

  // Watch for changes in metricUnits and save to local storage
  useEffect(() => {
    localStorage.setItem('metricUnits', JSON.stringify(metricUnits));
  }, [metricUnits]);

  const weatherIcons: Record<number, React.JSX.Element> = {
    0: <WeatherSvg state='sunny' color='goldenrod' width={128} height={128} />,
    1: <WeatherSvg state='sunny' color='goldenrod' width={128} height={128} />,
    2: <WeatherSvg state='partlycloudy' width={128} height={128} />,
    3: <WeatherSvg state='cloudy' width={128} height={128} />,
    45: <WeatherSvg state='fog' width={128} height={128} />,
    48: <WeatherSvg state='fog' width={128} height={128} />,
    51: <WeatherSvg state='rainy' width={128} height={128} />,
    80: <WeatherSvg state='rainy' width={128} height={128} />,
  };

  const [currentTime, setCurrentTime] = useState<DateTime>(DateTime.now());
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000); // Update every 1 second

    return () => {
      clearInterval(intervalId);
    };
  }, [weatherData?.timezone]);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        const unitSystem = metricUnits ? 'metric' : 'imperial';
        console.log('Fetching Weather Data');
        const temperatureUnit = unitSystem === 'metric' ? 'celsius' : 'fahrenheit';
        const windspeedUnit = unitSystem === 'metric' ? 'ms' : 'mph';
        const precipitationUnit = unitSystem === 'metric' ? 'mm' : 'inch';
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,precipitation,weathercode,windspeed_10m,winddirection_10m&hourly=temperature_2m,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,windspeed_10m_max&temperature_unit=${temperatureUnit}&windspeed_unit=${windspeedUnit}&precipitation_unit=${precipitationUnit}&&timeformat=unixtime&timezone=auto&forecast_days=1`;

        const response = await fetch(weatherURL);

        if (response.ok) {
          const result = (await response.json()) as WeatherInterface;
          setWeatherData(result);

          const timeDifferences = result.hourly.time.map((time) => {
            const timeObj = DateTime.fromMillis(time * 1000).setZone(result.timezone);
            return Math.abs(timeObj.diffNow('milliseconds', { conversionAccuracy: 'longterm' }).as('milliseconds'));
          });

          const closestTimeIndex = timeDifferences.indexOf(Math.min(...timeDifferences));

          const closestRainProbability =
            closestTimeIndex !== -1 ? result.hourly.precipitation_probability[closestTimeIndex] : null;
          setClosestRainProbability(closestRainProbability);
          const closestRainAmount = closestTimeIndex !== -1 ? result.hourly.precipitation[closestTimeIndex] : null;
          setClosestRainAmount(closestRainAmount);

          setlastWeatherUpdate(
            DateTime.now().toLocaleString({
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZoneName: 'short',
            })
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    void fetchWeatherData();

    // Periodically update weather data every 15 minutes
    const weatherDataInterval = setInterval(() => {
      console.log('Updating Weather Data');
      void fetchWeatherData();
    }, 900000); // 900,000 milliseconds (15 minutes)

    return () => clearInterval(weatherDataInterval);
  }, [lat, lon, metricUnits]);

  function getWeatherIcon(weatherCode: number) {
    return weatherIcons[weatherCode] || null;
  }

  return (
    <>
      {weatherData ? (
        <Box ref={autoAnimate}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: '1rem',
            }}>
            <ToggleButtonGroup
              value={metricUnits ? 'metric' : 'imperial'}
              exclusive
              onChange={(_event, value) => {
                setMetricUnits(value === 'metric');
              }}>
              <ToggleButton value='metric' style={{ fontWeight: metricUnits ? 'bold' : 'normal' }}>
                &deg;C
              </ToggleButton>
              <ToggleButton value='imperial' style={{ fontWeight: metricUnits ? 'normal' : 'bold' }}>
                &deg;F
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem',
                }}>
                <Typography variant='h5' textAlign='center'>
                  Current Weather:
                </Typography>
                <Typography variant='h5' textAlign='center'>
                  {weatherConditionCodes(weatherData.current.weathercode)}
                </Typography>
                <div id='weatherIcon'>{getWeatherIcon(weatherData.current.weathercode)}</div>
                <Typography variant='h3' textAlign='center' gutterBottom>
                  {weatherData.current.temperature_2m.toFixed(0)}
                  {weatherData.current_units.temperature_2m}
                </Typography>
                <Typography variant='h5' textAlign='center'>
                  Current Time:
                </Typography>
                <Typography variant='h5' textAlign='center'>
                  {currentTime.setZone(weatherData.timezone).toLocaleString(DateTime.TIME_WITH_SECONDS)}
                </Typography>
                <Typography variant='subtitle1' textAlign='center'>
                  {DateTime.fromMillis(weatherData.current.time * 1000).setZone(weatherData.timezone).offsetNameLong}
                </Typography>
              </Box>
            </Grid>
            <Grid size={12}>
              <Typography variant='h5' textAlign='center'>
                Rain Probability:
              </Typography>
              <Typography variant='h5' textAlign='center' gutterBottom>
                {closestRainProbability}
                {weatherData.hourly_units.precipitation_probability}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: '1rem',
                }}>
                <Button
                  color='info'
                  variant='outlined'
                  onClick={() => setShowRainProbabilityGraph(!showRainProbabilityGraph)}
                  sx={{ mb: '1rem' }}>
                  {showRainProbabilityGraph ? 'Hide Rain Probability Graph' : 'Show Rain Probability Graph'}
                </Button>
              </Box>

              <Collapse in={showRainProbabilityGraph} timeout='auto' unmountOnExit>
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width='100%' height={200}>
                    <LineChart
                      data={weatherData.hourly.precipitation_probability.map((value, index) => ({
                        time: DateTime.fromMillis(weatherData.hourly.time[index] * 1000)
                          .setZone(weatherData.timezone)
                          .toLocaleString(DateTime.TIME_SIMPLE),
                        probability: value,
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey='time' type='category' stroke='white' interval='preserveStartEnd' />
                      <YAxis
                        dataKey='probability'
                        domain={['dataMin', 'dataMax']}
                        stroke='white'
                        type='number'
                        tickFormatter={(value) => `${value}%`}
                      />
                      <CartesianGrid strokeDasharray='5 3' vertical={false} />
                      <Tooltip
                        content={(props: TooltipProps<number, string>) => {
                          if (props.payload && props.payload.length > 0) {
                            const data = props.payload[0].payload as ChartData; // Assuming all data points have the same time
                            return <Typography>{`Rain Probability: ${data.probability}% @ ${data.time}`}</Typography>;
                          }
                          return null;
                        }}
                      />
                      <Line
                        type='monotone'
                        dataKey='probability'
                        stroke='steelblue'
                        strokeWidth={2}
                        name='Rain Probability'
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Collapse>
            </Grid>
            <Grid size={12}>
              <Typography variant='h5' textAlign='center'>
                Current Rain Amount:
              </Typography>
              <Typography variant='h5' textAlign='center' gutterBottom>
                {closestRainAmount} {weatherData.current_units.precipitation}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: '1rem',
                }}>
                <Button
                  color='info'
                  variant='outlined'
                  onClick={() => {
                    setShowRainAmountGraph(!showRainAmountGraph);
                  }}
                  sx={{ mb: '1rem' }}>
                  {showRainAmountGraph ? 'Hide Rain Amount Graph' : 'Show Rain Amount Graph'}
                </Button>
              </Box>
              <Collapse in={showRainAmountGraph} timeout='auto' unmountOnExit>
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width='100%' height={200}>
                    <BarChart
                      data={weatherData.hourly.precipitation.map((value, index) => ({
                        time: DateTime.fromMillis(weatherData.hourly.time[index] * 1000)
                          .setZone(weatherData.timezone)
                          .toLocaleString(DateTime.TIME_SIMPLE),
                        rainAmount: value,
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey='time' type='category' stroke='white' interval='preserveStartEnd' />
                      <YAxis
                        dataKey='rainAmount'
                        domain={['dataMin', 'dataMax']}
                        stroke='white'
                        type='number'
                        tickFormatter={(value) => `${value}%`}
                      />
                      <CartesianGrid strokeDasharray='5 3' vertical={false} />
                      <Tooltip
                        content={(props: TooltipProps<number, string>) => {
                          if (props.payload && props.payload.length > 0) {
                            const data = props.payload[0].payload as ChartData;
                            return (
                              <Typography>{`Rain Amount: ${data.rainAmount} ${weatherData.hourly_units.precipitation} @ ${data.time}`}</Typography>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey='rainAmount' fill='steelblue' name='Rain Amount' animationDuration={500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Collapse>
            </Grid>
            <Grid size={12}>
              <Typography variant='h5' textAlign='center'>
                Current Wind Speed:
              </Typography>
              <Typography variant='h5' textAlign='center' gutterBottom>
                {weatherData.current.windspeed_10m.toFixed(0)}{' '}
                {weatherData.current_units.windspeed_10m.replace('mp/h', 'mph')}{' '}
                {getWindDirectionArrow(weatherData.current.winddirection_10m)}
              </Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant='h5' textAlign='center'>
                Max Wind Speed:
              </Typography>
              <Typography variant='h5' textAlign='center' gutterBottom>
                {weatherData.daily.windspeed_10m_max.slice(-1)[0].toFixed(0)}{' '}
                {weatherData.daily_units.windspeed_10m_max.replace('mp/h', 'mph')}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant='h5' textAlign='center'>
                Sunrise:
              </Typography>
              <Typography variant='h5' textAlign='center' gutterBottom>
                {DateTime.fromMillis(weatherData.daily.sunrise[0]).toLocaleString(DateTime.TIME_SIMPLE)}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant='h5' textAlign='center'>
                Sunset:
              </Typography>
              <Typography variant='h5' textAlign='center' gutterBottom>
                {DateTime.fromMillis(weatherData.daily.sunset[0]).toLocaleString(DateTime.TIME_SIMPLE)}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant='h5' textAlign='center' gutterBottom>
                Max Temperature: {weatherData.daily.temperature_2m_max[0].toFixed(0)}
                {weatherData.daily_units.temperature_2m_max}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant='h5' textAlign='center' gutterBottom>
                Min Temperature: {weatherData.daily.temperature_2m_min[0].toFixed(0)}
                {weatherData.daily_units.temperature_2m_min}
              </Typography>
            </Grid>
          </Grid>
          <Typography variant='subtitle1' textAlign='center' gutterBottom>
            Weather Last Updated: {lastWeatherUpdate}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}>
          <CircularProgress size='3rem' />
        </Box>
      )}
    </>
  );
}

export default Weather;
