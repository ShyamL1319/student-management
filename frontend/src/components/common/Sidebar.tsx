import type { FC } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookIcon from '@mui/icons-material/Book';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

export const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  // Resolve role name from possible shapes
  const roleName = (user && ((user as any).role?.name || (user as any).role)) as string | undefined;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Students', icon: <PeopleIcon />, path: '/students' },
    { text: 'Teachers', icon: <SchoolIcon />, path: '/teachers' },
    { text: 'Staff', icon: <PeopleIcon />, path: '/staff', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Parents', icon: <PeopleIcon />, path: '/parents', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    // Admin pages - show to SUPER_ADMIN and roles listed in `restricted`
    { text: 'Schools', icon: <BusinessIcon />, path: '/schools', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Academic Years', icon: <CalendarMonthIcon />, path: '/academic-years', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Departments', icon: <AccountTreeIcon />, path: '/departments', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Courses', icon: <MenuBookIcon />, path: '/courses', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Subjects', icon: <BookIcon />, path: '/subjects', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Classes', icon: <ClassIcon />, path: '/classes', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Sections', icon: <ClassIcon />, path: '/sections', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Attendance', icon: <EventAvailableIcon />, path: '/attendances', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Timetables', icon: <ScheduleIcon />, path: '/timetables', restricted: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'] },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const visibleMenu = menuItems.filter((item) => {
    if (!item.restricted) return true;
    // SUPER_ADMIN always sees everything
    if (roleName === 'SUPER_ADMIN') return true;
    return item.restricted.includes(roleName || '');
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {visibleMenu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

