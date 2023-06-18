import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';

interface Race {
  round: string;
  season: string;
  date: string;
  raceName: string;
  Circuit: {
    circuitName: string;
    Location: {
      locality: string;
    };
  };
}

const F1Schedule = () => {
  const [raceSchedule, setRaceSchedule] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRaceSchedule = async () => {
      try {
        const response = await fetch('https://ergast.com/api/f1/current.json');
        const data = await response.json();
        const schedule = data.MRData.RaceTable.Races;
        setRaceSchedule(schedule);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching race schedule:', error);
        setIsLoading(false);
      }
    };

    fetchRaceSchedule();
  }, []);

  const formatRaceDate = (date: string) => {
    return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
  };

  const getClosestRaceIndex = useMemo(() => {
    const currentDate = DateTime.local();
    let closestRaceIndex = 0;
    let closestRaceDiff = Infinity;

    raceSchedule.forEach((race, index) => {
      const raceDateTime = DateTime.fromISO(race.date);
      const diff = Math.abs(raceDateTime.diff(currentDate).as('seconds'));

      if (diff < closestRaceDiff && currentDate <= raceDateTime) {
        closestRaceDiff = diff;
        closestRaceIndex = index;
      }
    });
    return closestRaceIndex;
  }, [raceSchedule]);

  if (isLoading) {
    return (
      <Box sx={{ pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant='body1' mt={2}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const currentYear = DateTime.local().year; // Get the current year

  return (
    <Box sx={{ pt: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant='h4' align='center' mb={2}>
        F1 {currentYear} Race Schedule
      </Typography>
      <TableContainer>
        <Table className='fade-in-table'>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Grand Prix</TableCell>
              <TableCell>Circuit</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {raceSchedule.map((race, index) => (
              <TableRow
                key={race.round}
                sx={{
                  backgroundColor: index === getClosestRaceIndex ? '#3ea6ff' : 'inherit',
                  '&:hover':
                    index === getClosestRaceIndex
                      ? 'inherit'
                      : {
                          backgroundColor: '#2C2C2C',
                          cursor: 'default',
                          transition: 'all 0.5s ease-in-out',
                        },
                }}>
                <TableCell>{formatRaceDate(race.date)}</TableCell>
                <TableCell>{race.raceName}</TableCell>
                <TableCell>{race.Circuit.circuitName}</TableCell>
                <TableCell>{race.Circuit.Location.locality}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default F1Schedule;
