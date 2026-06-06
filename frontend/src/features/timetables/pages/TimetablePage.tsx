import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
} from '@mui/material';
import TimetableList from '../components/TimetableList';
import WeeklyTimetableView from '../components/WeeklyTimetableView';
import TeacherTimetableView from '../components/TeacherTimetableView';
import ConflictDetector from '../components/ConflictDetector';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`timetable-tabpanel-${index}`}
      aria-labelledby={`timetable-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `timetable-tab-${index}`,
    'aria-controls': `timetable-tabpanel-${index}`,
  };
}

const TimetablePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Timetable Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage school timetables, view weekly schedules, and detect scheduling conflicts
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="timetable tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="All Timetables" {...a11yProps(0)} />
          <Tab label="Weekly Schedule" {...a11yProps(1)} />
          <Tab label="Teacher Schedule" {...a11yProps(2)} />
          <Tab label="Conflict Detection" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TimetableList />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <WeeklyTimetableView />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TeacherTimetableView />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ConflictDetector />
      </TabPanel>
    </Container>
  );
};

export default TimetablePage;
