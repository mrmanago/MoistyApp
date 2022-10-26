//React and hooks
import * as React from "react";
import { useState, useEffect, useRef } from "react";

// MaterialUI themeing
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";

// MaterialUI Components
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Container,
  CssBaseline,
  Dialog,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
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
import { blue } from '@mui/material/colors';

// MUIX
import {
    LocalizationProvider,
    TimePicker,
} from '@mui/x-date-pickers/';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Icons
import {
  AddCircle,
  ChevronLeft,
  Delete,
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

// TODO: put in researched values

// Plant Specific behavior. scale on 1-5, 5 being highest. Pump: x times a day
const plantList = [
  {
    Name: "Basil",
    Tough: 3,
    Pump: 4,
  },
  {
    Name: "Mint",
    Tough: 4,
    Pump: 3,
  },
  {
    Name: "Thyme",
    Tough: 5,
    Pump: 3,
  },
];

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

// TODO add plant specific behavior
// TODO Add ability to choose plants

const AddPlant = (props) => {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return(
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Select Plant</DialogTitle>
      <List sx={{ pt: 0 }}>
        {plantList.map((plant) => (
          <ListItem button onClick={() => handleListItemClick(plant)} key={plant.Name}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <LocalFlorist />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={plant.Name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

const App = () => {
  // Sunrise and Sunset Time for TUe Campus
  const sunrise = getSunrise(51.447710, 5.485856);
  const sunset = getSunset(51.447710, 5.485856);
  

  // UI useStates
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [plantOpen, setPlantOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(plantList[0].Name);
  //const [camera, setCamera] = useState(false); // Camera on and off

  // Websocket Message useStates
  const [LED, setLED] = useState(false); // LED on/off
  const [LEDSchedule, setLEDSchedule] = useState(false); // Wether or not the LED schedule is on at all
  const [LEDScheduleStart, setLEDScheduleStart] = useState(dayjs().hour(6).minute(0)); // Start time of LED TODO respond to plants
  const [LEDScheduleEnd, setLEDScheduleEnd] = useState(dayjs().hour(20).minute(0)); // End time of LED TODO respond to plants
  const [supplemental, setSupplemental] = useState(false); // Supplemental light mode state. when false complete mode is on
  const [supplementalStart, setSupplementalStart] = useState(dayjs(sunrise)); // time when the LED turns OFF
  const [supplementalEnd, setSupplementalEnd] = useState(dayjs(sunset)); // time to turn on led

  const [pump, setPump] = useState(false); // Pump on/off
  const [pumpSchedule, setPumpSchedule] = useState([plantList[0].Pump]);
  const [waterDuration, setWaterDuration] = useState(2);
  const [pumpFrequency, setPumpFrequency] = useState(3);

  const [fan, setFan] = useState(false);
  const [autoFan, setAutoFan] = useState(false);

  const [temp, setTemp] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const [nutrients, setNutrients] = useState(0);
  const [humidity, setHumidity] = useState(0);

  // Plant
  const [plants, setPlants] = useState([plantList[0]]);
  const [plantAmount, setPlantAmount] = useState(3);
  

  // Websocket init and client message receiving
  // TODO add all the other states. Need JSON format for that
  const websocket = useRef(null);
  useEffect(() => {
    websocket.current = new W3CWebSocket("ws://192.168.4.1/ws");
    websocket.current.onopen = () => console.log("WebSocket opened");
    websocket.current.onclose = () => console.log("Websocket closed")
    websocket.current.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log("got reply: ");
      console.log(dataFromServer);

      // Control Websocket
      // LED update Status
      if (dataFromServer.type === "LEDStatus") {
          setLED(dataFromServer.LEDStatus);
      }
      // Pump update Status
      if (dataFromServer.type === "PumpStatus") {
        setPump(dataFromServer.PumpStatus);
      }
      // Fan update Status
      if (dataFromServer.type === "FanStatus") {
        setFan(dataFromServer.fan);
      }
      // // Camera update Status
      // if (dataFromServer.type === "Camera") {
      //   setCamera(dataFromServer.camera);
      // }

      // Sensor messages
      // Temperature
      if (dataFromServer.type === "TempStatus") {
        setTemp(dataFromServer.temp);
      }
      // Humidity
      if (dataFromServer.type === "HumidityStatus") {
        setHumidity(dataFromServer.humidity);
      }
      // Nutrients
      if (dataFromServer.type === "NutrientsStatus") {
        setNutrients(dataFromServer.nutrients);
      }
      // Water Level
      if (dataFromServer.type === "WaterStatus") {
        setWaterLevel(dataFromServer.waterLevel);
      }
    }
    return () => websocket.current.close();
  }, []);

  // Message sending handlers
  useEffect(() => {
    if (websocket.current.readyState !== WebSocket.OPEN) {
      console.log("websocket not available for LED");
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
        type: "LEDStatus",
        LED: LED,
      })
    );
  }, [LED]);

  useEffect(() => {
    if (websocket.current.readyState !== WebSocket.OPEN) {
      console.log("websocket not available for Pump");
    } else {
      console.log("ws Pump message sent");
      websocket.current.send(
        JSON.stringify({
          type: "PumpStatus",
          pump: pump,
        })
      );
    }
    console.log(
        JSON.stringify({
        type: "PumpStatus",
        pump: pump,
      })
    );
  }, [pump]);

  useEffect(() => {
    if (websocket.current.readyState !== WebSocket.OPEN) {
      console.log("websocket not available for Fan");
    } else {
      console.log("ws Fan message sent");
      websocket.current.send(
        JSON.stringify({
          type: "FanStatus",
          fan: fan,
        })
      );
    }
    console.log(
        JSON.stringify({
        type: "FanStatus",
        fan: fan,
      })
    );
  }, [fan]);

  // useEffect(() => {
  //   if (websocket.current.readyState !== WebSocket.OPEN) {
  //     console.log("websocket not available for camera");
  //   } else {
  //     console.log("ws camera message sent");
  //     websocket.current.send(JSON.stringify({
  //         type: "Camera",
  //         camera: camera,
  //       }));
  //   }

  //   console.log(JSON.stringify({
  //     type: "Camera",
  //     camera: camera,
  //   }))
  // }, [camera]);

  useEffect(() => {
    if (plants.length > 0) {
      const interval = LEDScheduleEnd.diff(LEDScheduleStart) / 3; //TODO change to lowest tough water
      setPumpSchedule([LEDScheduleStart, LEDScheduleStart.add(interval), LEDScheduleStart.add(interval).add(interval)]);
      console.log(pumpSchedule);
    }
  }, [plants]);

  // UI Handlers
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleClickOpen = () => {
    setPlantOpen(true);
  };

  const handleClose = (value) => {
    setPlantOpen(false);
    setSelectedValue(value);
    setPlants([...plants, value]);
  };

  const removePlant = (plant) => {
    setPlants(plants.filter(item => item.Name !== plant.Name));
  };

  // UI
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
              Bloomer
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
            {/* Make it so ids are different */}
            {plants.map((plant) => (
              <ListItemButton onClick={() => removePlant(plant)} key={plant.Name}>
                <ListItemIcon>
                  <Delete/>
                </ListItemIcon>
                <ListItemText primary={plant.Name} />
              </ListItemButton>
            ))}
            {plants.length < plantAmount &&
              <React.Fragment>
                <ListItemButton
                  onClick={handleClickOpen}
                >
                <ListItemIcon>
                  <AddCircle />
                </ListItemIcon>
                <ListItemText primary={"Add New"} />
                </ListItemButton>
                <AddPlant
                  selectedValue={selectedValue}
                  open={plantOpen}
                  onClose={handleClose}
                />
              </React.Fragment>
            }
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
                <React.Fragment>
                  {/* Nutrients */}
                    <Grid item xs={6} md={3} lg={2}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          Nutrients
                        </Typography>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          {nutrients}
                        </Typography>
                      </Paper>
                    </Grid>
                  {/* Water Level */}
                    <Grid item xs={6} md={3} lg={2}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          Water Level
                        </Typography>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          {waterLevel}
                        </Typography>
                      </Paper>
                    </Grid>
                  {/* Humidity */}
                    <Grid item xs={6} md={3} lg={2}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          Humidity
                        </Typography>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          {humidity}
                        </Typography>
                      </Paper>
                    </Grid>
                  {/* LED Status */}
                    <Grid item xs={6} md={3} lg={2}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          LED
                        </Typography>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          { LED ? "ON" : "OFF"}
                        </Typography>
                      </Paper>
                    </Grid>
                  {/* Pump Status */}
                    <Grid item xs={6} md={3} lg={2}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          Pump
                        </Typography>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          { pump ? "ON" : "OFF" }
                        </Typography>
                      </Paper>
                    </Grid>
                  {/* Fan Status */}
                    <Grid item xs={6} md={3} lg={2}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          Fan
                        </Typography>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                          {fan ? "ON" : "OFF"}
                        </Typography>
                      </Paper>
                    </Grid>
                  {/* Temp */}
                  <Grid item xs={6} md={3} lg={2}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Temperature:
                      </Typography>
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        {temp}
                      </Typography>
                    </Paper>
                  </Grid>
                </React.Fragment>
              }
              
              {/* Control Page */}
              {selectedIndex === 1 &&
                <React.Fragment>
                  {/* PUMP CONTROL */}
                  <Grid item xs={12} md={4} lg={3}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      Pump
                      </Typography>
                      <Button variant="contained" onClick={() => setPump(!pump)}>
                          {pump ? "ON" : "OFF"}
                      </Button>
                    </Paper>
                  </Grid>

                  {/* LED CONTROL */}
                  <Grid item xs={12} md={4} lg={3}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      LED
                      </Typography>
                      <Button variant="contained" onClick={() => setLED(!LED)}>
                          {LED ? "ON" : "OFF"}
                      </Button>
                    </Paper>
                  </Grid>

                  {/* FAN CONTROL */}
                  <Grid item xs={12} md={4} lg={3}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      Fan
                      </Typography>
                      <Button variant="contained" onClick={() => setFan(!fan)}>
                          {fan ? "ON" : "OFF"}
                      </Button>
                    </Paper>
                  </Grid>
                </React.Fragment>
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
                      }}
                    >
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Water Pump Duration
                      </Typography>
                      <TextField
                        label = "Time"
                        defaultValue = {waterDuration}
                        onChange={(newValue) => {
                          setWaterDuration(newValue);
                        }}
                      />
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Water Pump Schedule
                      </Typography>
                      {pumpSchedule.map((time, index) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs} key={index}>
                          <Typography>
                          {index + 1}
                          </Typography>
                          <TimePicker
                            label="Start Time"
                            value={time}
                            onChange={(newValue) => {
                              const updatedSchedule = [...pumpSchedule];
                              updatedSchedule[index] = newValue;
                              setPumpSchedule(updatedSchedule);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                          <TimePicker
                            label="End Time"
                            value={time.add(waterDuration, "hour")}
                            onChange={(newValue) => {
                              const updatedSchedule = [...pumpSchedule];
                              updatedSchedule[index] = newValue;
                              setPumpSchedule(updatedSchedule);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      ))}
                    </Paper>
                  </Grid>

                  {/* LED schedule */}
                  <Grid item xs={12} md={6} lg={6}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
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
                                setSupplementalEnd(newValue);
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

                  {/* Auto Fan Option */}
                  <Grid item xs={12} md={6} lg={6}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography component="h2" variant="h6" color="primary" gutterBottom>
                        Automatically Turn On Fan
                      </Typography>
                      <Button variant="contained" onClick={() => setAutoFan(!autoFan)}>
                          {autoFan ? "ON" : "OFF"}
                      </Button>
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
