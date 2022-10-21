import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import LayersIcon from "@mui/icons-material/Layers";
import YardIcon from "@mui/icons-material/Yard";
import { Container } from "@mui/system";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import LightControl from "./components/LightControl"
import TempSensor from "./components/TempSensor";

import {w3cwebsocket as W3CWebSocket} from "websocket";
import {useState, useEffect, useRef} from 'react';

const drawerWidth = 240;

const mdTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#608c66",
    },
    secondary: {
      main: "#e0f6e3",
    },
    warning: {
      main: "#ffc775",
    },
    error: {
      main: "#ff857b",
    },
    info: {
      main: "#98d2ff",
    },
    success: {
      main: "#c0ffa8",
    },
  },
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mainListItems = (
  <React.Fragment>
    <ListItemButton>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Schedules" />
    </ListItemButton>
  </React.Fragment>
);

// TODO: make list dynamic with adding plants and getting rid of plants

const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Plants
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <YardIcon />
      </ListItemIcon>
      <ListItemText primary="Basil" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <YardIcon />
      </ListItemIcon>
      <ListItemText primary="Mint" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <YardIcon />
      </ListItemIcon>
      <ListItemText primary="Lettuce" />
    </ListItemButton>
  </React.Fragment>
);

// TODO make card component with props to feed

function preventDefault(event) {
  event.preventDefault();
}

function App() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  //const websocket = useRef(null);

  // useEffect(() => {
  //   websocket.current = new W3CWebSocket('ws://192.168.2.1/ws');
  //   websocket.current.onmessage = (message) => {
  //     if (dataFromSever.type === "message") {
  //       setLED(dataFromSever.LED)
  //     }
  //   };
  //   return () => websocket.current.close();
  // }, [])

  // function sendUpdate({ led = LED }) {
  //   websocket.current.send(
  //     JSON.stringify({
  //       type: "message",
  //       LED: led,
  //     })
  //   );
  // }

  // const LEDon = () => {
  //   sendUpdate({ led: true });
  // }

  // const LEDoff = () => {
  //   sendUpdate({ led: false });
  // }

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {mainListItems}
            <Divider sx={{ my: 1 }} />
            {secondaryListItems}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: 500,
                  }}
                >
                  <LightControl />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: 500,
                  }}
                >
                  <TempSensor />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
