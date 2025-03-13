import { lazy, Suspense } from 'react';
const F1Map = lazy(() => import('./components/F1Map'));
import './App.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAutoAnimate } from '@formkit/auto-animate/react';

function App() {
  const [autoAnimate] = useAutoAnimate({
    duration: 1000,
  });
  return (
    <>
      <Box ref={autoAnimate}>
        <Suspense
          fallback={
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' height='100vh'>
              <span className='loader'></span>
              <Typography variant='h2' className='loader2'>
                Loading Weather
              </Typography>
            </Box>
          }>
          <F1Map />
        </Suspense>
      </Box>
    </>
  );
}

export default App;
