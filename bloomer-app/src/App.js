//React and hooks
import * as React from "react";
import { useState, useEffect, useRef } from "react";

// MaterialUI themeing
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";

// MaterialUI Components
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import MuiAppBar from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";

// MUIX
import {
    LocalizationProvider,
    TimePicker,
} from '@mui/x-date-pickers/';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Icons
import {
  ChevronLeft,
  LocalFlorist,
  Menu,
  PowerSettingsNew,
  Timelapse
} from "@mui/icons-material/";

// MISC imports
import { w3cwebsocket as W3CWebSocket } from "websocket";
import dayjs from 'dayjs';
import { getSunrise, getSunset } from 'sunrise-sunset-js';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#608c66",
    },
    secondary: {
      main: "#084A00",
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
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: `#95DE8E`,
            borderLeft: `5px solid #608c66`,
          }
        }
      }
    }
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

// TODO move websocket to appjs
// TODO send/receive message in appjs to reduce websockets
// TODO Add pages
// TODO add plant specific behavior
// TODO Add ability to choose plants


function App() {
  // Sunrise and Sunset Time for TUe Campus
  const sunrise = getSunrise(51.447710, 5.485856);
  const sunset = getSunset(51.447710, 5.485856);

  // UI useStates
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Websocket Message useStates
  const [LED, setLED] = useState(false); // LED on/off
  const [LEDSchedule, setLEDSchedule] = useState(false); // Wether or not the LED schedule is on at all
  const [LEDScheduleStart, setLEDScheduleStart] = useState(dayjs().hour(6).minute(0)); // Start time of LED TODO respond to plants
  const [LEDScheduleEnd, setLEDScheduleEnd] = useState(dayjs().hour(20).minute(0)); // End time of LED TODO respond to plants
  const [supplemental, setSupplemental] = useState(false); // Supplemental light mode state. when false complete mode is on
  const [supplementalStart, setSupplementalStart] = useState(dayjs(sunrise)); // time when the LED turns OFF
  const [supplementalEnd, setSupplementalEnd] = useState(dayjs(sunset)); // time to turn on led
  const [temp, setTemp] = useState(0);

  // Websocket and message handlers
  const websocket = useRef(null);
  useEffect(() => {
        websocket.current = new W3CWebSocket("ws://192.168.4.1/ws");
        websocket.current.onopen = () => console.log("WebSocket opened");
        websocket.current.onclose = () => console.log("Websocket closed");

        websocket.current.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            console.log("got reply: ");
            console.log(dataFromServer);
            if (dataFromServer.type === "LEDStatus") {
                setLED(dataFromServer.LEDStatus);
            }
        }
        
        return () => websocket.current.close();
    }, []);

  useEffect(() => {
      if (websocket.readyState != WebSocket.OPEN) {
          console.log("websocket not available");
      } else {
          console.log("ws LED message sent");
          websocket.current.send(
              JSON.stringify({
                  type: "LEDStatus",
                  LED: LED,
              })
          );
      }
      console.log(
          JSON.stringify({
              type: "LEDControl",
              LED: LED,
          })
      );
  }, [LED]);

  // UI Handlers
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (
    <ThemeProvider theme={theme}>
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
              <Menu />
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
              <ChevronLeft />
            </IconButton>
          </Toolbar>
          <Divider />
          {/* Navigation */}
          <List component="nav">
            <ListItemButton
              selected={selectedIndex === 0}
              onClick={(event) => handleListItemClick(event, 0)}
            >
              <ListItemIcon>
                <LocalFlorist />
              </ListItemIcon>
              <ListItemText primary="Monitor" />
            </ListItemButton>
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={(event) => handleListItemClick(event, 1)}
            >
              <ListItemIcon>
                <PowerSettingsNew/>
              </ListItemIcon>
              <ListItemText primary="Control" />
            </ListItemButton>
            <ListItemButton
              selected={selectedIndex === 2}
              onClick={(event) => handleListItemClick(event, 2)}
            >
              <ListItemIcon>
                <Timelapse />
              </ListItemIcon>
              <ListItemText primary="Schedules" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            {/* Plant Adding */}
          </List>
        </Drawer>

        {/* Main Page */}
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
              {/* Monitor Page */}
              {selectedIndex === 0 &&
                //Temp
                <Grid item xs={12} md={4} lg={3}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: 200,
                    }}
                  >
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      TEMP: {temp}
                    </Typography>
                  </Paper>
                </Grid>
              }
              
              {/* Control Page */}
              {selectedIndex === 1 &&
                // LED
                <Grid item xs={12} md={4} lg={3}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: 200,
                    }}
                  >
                    {/* LED CONTROL */}
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    LED
                    </Typography>

                    <Button variant="contained" onClick={() => setLED(!LED)}>
                        {LED ? "ON" : "OFF"}
                    </Button>
                  </Paper>
                </Grid>
              }

              {/* Schedule Page */}
              {selectedIndex === 2 &&
                // Water pump schedule
                <React.Fragment>
                  <Grid item xs={12} md={6} lg={6}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: 200,
                    }}
                  >
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      Water Pump
                    </Typography>
                  </Paper>
                </Grid>
                {/* LED schedule */}
                <Grid item xs={12} md={6} lg={6}>
                  <Paper
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: 500,
                    }}
                  >
                    <Typography component="h2" variant="h5" color="primary" gutterBottom>
                      LED Schedule
                    </Typography>
                    {/* On/Off */}
                    <Button variant="contained" onClick={() => setLEDSchedule(!LEDSchedule)}>
                      {LEDSchedule ? "ON" : "OFF"}
                    </Button>
                    {/* Scheulde On/Off */}
                    <ButtonGroup disabled={!LEDSchedule}>
                      <Button
                        variant={supplemental ? "outlined" : "contained"}
                        onClick={() => setSupplemental(false)}
                      >
                        Complete Care
                      </Button>
                      <Button
                        variant={supplemental ? "contained" : "outlined"}
                        onClick={() => setSupplemental(true)}
                      >
                        Supplemental Care
                      </Button>
                    </ButtonGroup>
                    
                    {/* Time Pickers TODO looked diabled when schedule not activated */}
                    <Typography component="h4" variant="h6" color="primary" gutterBottom>
                      LED Turn On
                    </Typography>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Start Time"
                        value={LEDScheduleStart}
                        onChange={(newValue) => {
                          setLEDScheduleStart(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>

                    {/* Supplemental Time Picker. Appears when it is chosen. */}
                    { supplemental &&
                      <React.Fragment>
                        <Typography component="h4" variant="h6" color="primary" gutterBottom>
                          LED Turn Off
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            label="Turn Off LED"
                            value={supplementalStart}
                            onChange={(newValue) => {
                              setSupplementalStart(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>

                        <Typography component="h4" variant="h6" color="primary" gutterBottom>
                          LED Turn On
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <TimePicker
                            label="Turn LED Back On"
                            value={supplementalEnd}
                            onChange={(newValue) => {
                              setLEDScheduleEnd(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      </React.Fragment>
                    }

                    <Typography component="h4" variant="h6" color="primary" gutterBottom>
                      LED Turn Off
                    </Typography>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                      label="End Time"
                      value={LEDScheduleEnd}
                      onChange={(newValue) => {
                          setLEDScheduleEnd(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    </LocalizationProvider>
                  </Paper>
                </Grid>
                </React.Fragment>
              }

            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
