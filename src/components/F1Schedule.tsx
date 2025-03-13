import { useAutoAnimate } from '@formkit/auto-animate/react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { F1ScheduleInterface } from '../interfaces/F1ScheduleInterface';
import { F1ScheduleJSON } from '../utils/F1ScheduleJSON';
import Countdown from './Countdown';

const ExpandIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

const HoverableTableRow = React.memo(
  styled(TableRow)(({ theme }) => ({
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.active': {
      backgroundColor: theme.palette.action.active,
    },
  }))
);
let isPastDate = false;

const CustomTableRow = styled(TableRow)(({ theme }) => ({
  opacity: isPastDate ? '20%' : theme.typography.body1.opacity,
  textDecoration: isPastDate ? 'line-through' : theme.typography.body1.textDecoration,
}));

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  opacity: isPastDate ? '20%' : theme.typography.body1.opacity,
}));

const DateRangeTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  textAlign: 'left',
}));

function F1Schedule({ selectedCircuit }: { selectedCircuit: string }) {
  const [state, setState] = useState({
    scheduleData: F1ScheduleJSON as F1ScheduleInterface,
    isExpanded: true,
  });

  const { scheduleData, isExpanded } = state;
  const [autoAnimate] = useAutoAnimate();

  useEffect(() => {
    setState((prev) => ({ ...prev, scheduleData: F1ScheduleJSON }));
  }, []);

  const handleExpandRow = () => {
    setState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  const convertToDateTime = (date: string | number | Date) => {
    const raceDateTime = DateTime.fromJSDate(new Date(date));
    isPastDate = raceDateTime < DateTime.now();

    return (
      <Typography>
        {raceDateTime.toLocaleString({
          weekday: 'short',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'short',
        })}
      </Typography>
    );
  };

  const filteredRaces = scheduleData.Races.filter((race) => race.Circuit.circuitName === selectedCircuit);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          m: '1rem',
        }}
        ref={autoAnimate}>
        <Countdown sessions={filteredRaces[0]?.sessions} />
        <Typography variant='caption' marginBottom={'1rem'}>
          Timezone: {DateTime.now().zoneName}
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label='collapsible table'>
            <TableBody>
              {filteredRaces.map((race) => {
                const hoverableTableRow = (
                  <HoverableTableRow key={race.round} onClick={handleExpandRow}>
                    <TableCell width={'fit-content'}>
                      <ExpandIcon aria-label='expand row' size='small' aria-expanded={isExpanded}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </ExpandIcon>
                    </TableCell>
                    <CustomTableCell>
                      <Typography>{race.raceName}</Typography>
                      <DateRangeTypography>
                        {DateTime.fromISO(race.sessions.fp1).toLocaleString({ month: 'long', day: 'numeric' })} -{' '}
                        {DateTime.fromISO(race.sessions.gp).toLocaleString({ month: 'long', day: 'numeric' })}
                      </DateRangeTypography>
                    </CustomTableCell>
                  </HoverableTableRow>
                );

                return (
                  <React.Fragment key={race.round}>
                    {hoverableTableRow}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                        <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                          <Table>
                            <TableBody>
                              {race.sessions.fp1 && (
                                <CustomTableRow>
                                  <TableCell align='center'>
                                    Free Practice 1 {convertToDateTime(race.sessions.fp1)}
                                  </TableCell>
                                </CustomTableRow>
                              )}
                              {race.sessions.fp2 && (
                                <CustomTableRow>
                                  <TableCell align='center'>
                                    Free Practice 2 {convertToDateTime(race.sessions.fp2)}
                                  </TableCell>
                                </CustomTableRow>
                              )}
                              {race.sessions.fp3 && (
                                <CustomTableRow>
                                  <TableCell align='center'>
                                    Free Practice 3 {convertToDateTime(race.sessions.fp3)}
                                  </TableCell>
                                </CustomTableRow>
                              )}
                              {race.sessions.qualifying && (
                                <CustomTableRow>
                                  <TableCell align='center'>
                                    Qualifying {convertToDateTime(race.sessions.qualifying)}
                                  </TableCell>
                                </CustomTableRow>
                              )}
                              {race.sessions.sprintQualifying && (
                                <CustomTableRow>
                                  <TableCell align='center'>
                                    Sprint Shootout {convertToDateTime(race.sessions.sprintQualifying)}
                                  </TableCell>
                                </CustomTableRow>
                              )}
                              {race.sessions.sprint && (
                                <CustomTableRow>
                                  <TableCell align='center'>
                                    Sprint Race {convertToDateTime(race.sessions.sprint)}
                                  </TableCell>
                                </CustomTableRow>
                              )}
                              {race.sessions.gp && (
                                <CustomTableRow>
                                  <TableCell align='center'>Grand Prix {convertToDateTime(race.sessions.gp)}</TableCell>
                                </CustomTableRow>
                              )}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

export default F1Schedule;
