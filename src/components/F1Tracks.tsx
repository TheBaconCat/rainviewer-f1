import f1Locations from '../f1locations2023.json';
import { Box, Paper, Typography } from '@mui/material';

const F1Tracks = () => {
  return (
    <Box sx={{ pt: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
      {f1Locations.Tracks.map((data, index) => {
        const { name, id, location, lat, lon, zoom } = data;

        return (
          <Paper elevation={4} key={`${id}-${index}`}>
            <Typography variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              Circuit Name: {name}
            </Typography>
            <Typography variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              Location: {location}
            </Typography>
            <Typography variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              Lat: {lat}°
            </Typography>
            <Typography variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              Lon: {lon}°
            </Typography>
            <Typography variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              Zoom: {zoom}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default F1Tracks;
