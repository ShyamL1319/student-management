import type { FC } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';

const stats = [
  { title: 'Total Students', value: '1,250', icon: <PeopleIcon fontSize="large" color="primary" />, link: '/students' },
  { title: 'Total Teachers', value: '85', icon: <SchoolIcon fontSize="large" color="secondary" />, link: '/teachers' },
  { title: 'Active Classes', value: '42', icon: <ClassIcon fontSize="large" color="success" />, link: '/classes' },
  { title: 'Attendance Rate', value: '92%', icon: <EventIcon fontSize="large" color="warning" />, link: '/attendances' },
  { title: 'Upcoming Events', value: '3', icon: <EventIcon fontSize="large" color="warning" />, link: '#' },
];

export const DashboardPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardActionArea onClick={() => stat.link !== '#' && navigate(stat.link)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box>
                    {stat.icon}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">Student John Doe was added to Class 10A.</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>2 hours ago</Typography>
            
            <Typography variant="body1">Teacher Jane Smith updated syllabus for Math 101.</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>5 hours ago</Typography>

            <Typography variant="body1">Parent-Teacher meeting scheduled for next week.</Typography>
            <Typography variant="body1" color="textSecondary">1 day ago</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};


