import type { FC } from 'react';
import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  ListItemButton,
  Collapse,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  AccountTree as AccountTreeIcon,
  MenuBook as MenuBookIcon,
  Book as BookIcon,
  CalendarMonth as CalendarMonthIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  EventAvailable as EventAvailableIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  Grade as GradeIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ExpandLess,
  ExpandMore,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}


export const Sidebar: FC<SidebarProps> = ({ drawerWidth, mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Resolve user role name
  const userTyped = user as any;
  const roleName = userTyped?.role
    ? typeof userTyped.role === 'string'
      ? userTyped.role
      : userTyped.role.name
    : '';

  // Collapsible Submenu States
  const [registryOpen, setRegistryOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);

  const toggleRegistry = () => setRegistryOpen(!registryOpen);
  const toggleAcademics = () => setAcademicsOpen(!academicsOpen);
  const toggleFinance = () => setFinanceOpen(!financeOpen);

  // Helper to determine active state
  const isPathActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper to filter role-restricted items
  const checkAccess = (restricted?: string[]) => {
    if (!restricted) return true;
    if (roleName === 'SUPER_ADMIN') return true;
    return restricted.includes(roleName || '');
  };

  // Render a standard link item
  const renderLinkItem = (text: string, icon: React.ReactNode, path: string, onClick?: () => void) => {
    const active = isPathActive(path);
    return (
      <ListItem key={text} disablePadding>
        <ListItemButton
          selected={active}
          onClick={() => {
            navigate(path);
            if (onClick) onClick();
          }}
          sx={{
            borderRadius: '8px',
            mx: 1,
            my: 0.25,
            py: 1,
            px: 2,
            '&.Mui-selected': {
              backgroundColor: (theme) => theme.palette.action.selected,
              color: 'primary.main',
              fontWeight: 600,
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}>
                {text}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (onLinkClick?: () => void) => (
    <Box sx={{ overflowY: 'auto', height: '100%', pt: 1, pb: 4 }}>
      <List>
        {/* Section: Overview */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 3, pt: 1.5, pb: 0.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Overview
        </Typography>
        {renderLinkItem('Dashboard', <DashboardIcon fontSize="small" />, '/', onLinkClick)}
        {renderLinkItem('Notifications', <NotificationsIcon fontSize="small" />, '/notifications', onLinkClick)}
        {renderLinkItem('Assignments', <AssignmentIcon fontSize="small" />, '/assignments', onLinkClick)}
        {renderLinkItem('Settings', <SettingsIcon fontSize="small" />, '/settings', onLinkClick)}


        <Divider sx={{ my: 1.5, mx: 2 }} />

        {/* Section: Registry */}
        {checkAccess(['SUPER_ADMIN', 'ADMIN']) && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={toggleRegistry}
                sx={{ borderRadius: '8px', mx: 1, my: 0.25, py: 1, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  <BusinessIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      Registry
                    </Typography>
                  }
                />
                {registryOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
            </ListItem>
            <Collapse in={registryOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2 }}>
                {renderLinkItem('Academic Years', <CalendarMonthIcon fontSize="small" />, '/academic-years', onLinkClick)}
                {renderLinkItem('Departments', <AccountTreeIcon fontSize="small" />, '/departments', onLinkClick)}
                {renderLinkItem('Courses', <MenuBookIcon fontSize="small" />, '/courses', onLinkClick)}
                {renderLinkItem('Subjects', <BookIcon fontSize="small" />, '/subjects', onLinkClick)}
                {renderLinkItem('Classes', <ClassIcon fontSize="small" />, '/classes', onLinkClick)}
                {renderLinkItem('Sections', <ClassIcon fontSize="small" />, '/sections', onLinkClick)}
              </List>
            </Collapse>
          </>
        )}

        {/* Section: Users */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 3, pt: 1.5, pb: 0.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          User Directory
        </Typography>
        {renderLinkItem('Students', <PeopleIcon fontSize="small" />, '/students', onLinkClick)}
        {renderLinkItem('Teachers', <SchoolIcon fontSize="small" />, '/teachers', onLinkClick)}
        {renderLinkItem('Parents', <PeopleIcon fontSize="small" />, '/parents', onLinkClick)}
        {checkAccess(['SUPER_ADMIN', 'ADMIN']) && renderLinkItem('Staff', <PeopleIcon fontSize="small" />, '/staff', onLinkClick)}

        <Divider sx={{ my: 1.5, mx: 2 }} />

        {/* Section: Academics */}
        {checkAccess(['SUPER_ADMIN', 'ADMIN']) && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={toggleAcademics}
                sx={{ borderRadius: '8px', mx: 1, my: 0.25, py: 1, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  <ScheduleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      Academic Operations
                    </Typography>
                  }
                />
                {academicsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
            </ListItem>
            <Collapse in={academicsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2 }}>
                {renderLinkItem('Exams', <EventAvailableIcon fontSize="small" />, '/exams', onLinkClick)}
                {renderLinkItem('Marks', <GradeIcon fontSize="small" />, '/marks', onLinkClick)}
                {renderLinkItem('Attendance', <EventAvailableIcon fontSize="small" />, '/attendances', onLinkClick)}
                {renderLinkItem('Leaves', <EventAvailableIcon fontSize="small" />, '/leaves', onLinkClick)}
                {renderLinkItem('Timetables', <ScheduleIcon fontSize="small" />, '/timetables', onLinkClick)}
              </List>
            </Collapse>
          </>
        )}

        {/* Section: Finance */}
        {checkAccess(['SUPER_ADMIN', 'ADMIN']) && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={toggleFinance}
                sx={{ borderRadius: '8px', mx: 1, my: 0.25, py: 1, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                  <AttachMoneyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      Finance Center
                    </Typography>
                  }
                />
                {financeOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
            </ListItem>
            <Collapse in={financeOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2 }}>
                {renderLinkItem('Fee Structures', <AttachMoneyIcon fontSize="small" />, '/fee-structures', onLinkClick)}
                {renderLinkItem('Fee Collections', <AttachMoneyIcon fontSize="small" />, '/fee-collections', onLinkClick)}
                {renderLinkItem('Pending Fees', <AttachMoneyIcon fontSize="small" />, '/pending-fees', onLinkClick)}
                {renderLinkItem('Receipts', <ReceiptIcon fontSize="small" />, '/receipts', onLinkClick)}
                {renderLinkItem('Invoices', <AttachMoneyIcon fontSize="small" />, '/invoices', onLinkClick)}
              </List>
            </Collapse>
          </>
        )}

        <Divider sx={{ my: 1.5, mx: 2 }} />

        {/* Section: System Control */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 3, pt: 1.5, pb: 0.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Administration
        </Typography>
        {renderLinkItem('Reports', <AssessmentIcon fontSize="small" />, '/reports', onLinkClick)}
        {checkAccess(['SUPER_ADMIN', 'ADMIN']) && renderLinkItem('Audit Logs', <HistoryIcon fontSize="small" />, '/audit-logs', onLinkClick)}
        {checkAccess(['SUPER_ADMIN', 'ADMIN']) && renderLinkItem('Role Management', <AdminPanelSettingsIcon fontSize="small" />, '/admin/roles', onLinkClick)}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar />
        {drawerContent(onDrawerToggle)}
      </Drawer>

      {/* Desktop Drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .MuiDrawer-paper`]: {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent()}
      </Drawer>
    </Box>
  );
};
