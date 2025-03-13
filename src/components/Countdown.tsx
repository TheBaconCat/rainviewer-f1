import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Sessions } from '../interfaces/F1ScheduleInterface';
interface Props {
  sessions: Sessions;
}

const CountdownText = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#eee',
});

const getSessionDisplayName = (sessionName: string): string => {
  const displayNameMap: Record<string, string> = {
    fp1: 'Free Practice 1',
    fp2: 'Free Practice 2',
    fp3: 'Free Practice 3',
    qualifying: 'Qualifying',
    sprintQualifying: 'Sprint Shootout',
    sprint: 'Sprint Race',
    gp: 'Grand Prix',
  };
  return displayNameMap[sessionName] ?? sessionName;
};

const Countdown: React.FC<Props> = ({ sessions }) => {
  const [countdown, setCountdown] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const currentDate = DateTime.now();
      let closestSession: keyof Sessions | null = null;
      let closestDateDiff: number | null = null;

      (Object.entries(sessions) as [keyof Sessions, string][]).forEach(([sessionName, sessionDate]) => {
        const raceDate = DateTime.fromISO(sessionDate);
        const dateDiff = raceDate.diff(currentDate).milliseconds;

        // If the current date is after the session, continue to the next session
        if (dateDiff <= 0) {
          return;
        }

        // If this is the first iteration or the current session is closer to the current date, update the closest session
        if (closestDateDiff === null || dateDiff < closestDateDiff) {
          closestSession = sessionName;
          closestDateDiff = dateDiff;
        }
      });

      if (!closestSession) {
        // All sessions have already happened, don't show countdown
        setCountdown(null);
        setSessionName(null);
      } else {
        const closestRaceDate = DateTime.fromISO(sessions[closestSession]);
        const dateDiff = closestRaceDate.diff(currentDate);

        let duration: string;
        if (dateDiff.as('days') >= 1) {
          // If there are days left, include days in the format
          duration = dateDiff.toFormat('d:hh:mm:ss');
        } else {
          // If less than 1 day left, exclude days from the format
          duration = dateDiff.toFormat('hh:mm:ss');
        }

        const displayName = getSessionDisplayName(closestSession);

        setSessionName(displayName);
        setCountdown(duration);
      }
    };
    updateCountdown(); // Call it immediately to avoid initial delay
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [sessions, sessionName]);

  return countdown ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        m: '1rem',
      }}>
      <CountdownText>Next Session:</CountdownText>
      <CountdownText>{sessionName}</CountdownText>
      <CountdownText>{countdown}</CountdownText>
    </Box>
  ) : null;
};

export default Countdown;
