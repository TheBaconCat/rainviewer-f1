import f1Circuits from '../f1Tracks.json';
import { Box, Paper, Typography } from '@mui/material';
const GeoJsonMap = () => {
  return (
    <>
      <Box sx={{ pt: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
        {f1Circuits.features.map((data) => {
          const name = data.properties.Name;
          const id = data.properties.id;
          const location = data.properties.Location;

          return (
            <Paper elevation={4} key={id} sx={{ bgcolor: '' }}>
              <Typography id={id} variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                Circuit Name: {name}
              </Typography>
              <Typography id={id} variant='h3' sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                Location: {location}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </>
  );
};

export default GeoJsonMap;
