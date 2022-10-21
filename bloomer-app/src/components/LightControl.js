import * as React from "react";
import {useState, useEffect, useRef} from "react";
import dayjs from 'dayjs';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import {
    Button,
    ButtonGroup,
    TextField,
    Typography,
} from "@mui/material";
import {
    LocalizationProvider,
    TimePicker,
} from '@mui/x-date-pickers/';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const LightControl = () => {
    const sunrise = getSunrise(51.447710, 5.485856);
    const sunset = getSunset(51.447710, 5.485856);

    const [LED, setLED] = useState(false); //get rid of once websockets are put in. grab directly from that state.
    const [schedule, setSchedule] = useState(false); // if there is a schedule at all
    const [supplemental, setSupplemental] = useState(false); // if light will be turned off during day
    const [scheduleStart, setScheduleStart] = useState(dayjs().hour(6).minute(0)); // start time to turn on led
    const [scheduleEnd, setScheduleEnd] = useState(dayjs().hour(20).minute(0)); // end time to turn off led
    const [supplementalStart, setSupplementalStart] = useState(dayjs(sunrise)); // time to turn off led if supplemental is on
    const [supplementalEnd, setSupplementalEnd] = useState(dayjs(sunset)); // time to turn on led if supplemental is on

    const websocket = useRef(null);

    useEffect(() => {
        websocket.current = new WebSocket("ws:/192.168.2.1/ws-api/led");
        websocket.current.onopen = () => console.log("WebSocket LED opened");
        websocket.current.onclose = () => console.log("Websocket LED closed");
        
        return () => websocket.current.close();
    }, []);

    useEffect(() => {
        if (websocket.readyState != WebSocket.OPEN) {
            console.log("websocket not available");
        } else {
            console.log("ws message sent");
            websocket.current.send(
                JSON.stringify({
                    type: "message",
                    LED: LED,
                })
            );
        }
        console.log(
            JSON.stringify({
                type: "message",
                LED: LED,
            })
        );
    }, [LED]);

    const handleLED = () => {
        setLED(!LED);
    }

    return (
        <React.Fragment>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                LED
            </Typography>
            <Button variant="contained" onClick={handleLED}>
                {LED ? "ON" : "OFF"}
            </Button>
            Schedule
            <Button variant="contained" onClick={() => setSchedule(!schedule)}>
                {schedule ? "ON" : "OFF"}
            </Button>
            {
                schedule === true && (
                    <React.Fragment>
                        Schedule Type
                        <ButtonGroup aria-label="outlined button group">
                        <Button 
                            variant={supplemental ? "outlined" : "contained"}
                            onClick={() => setSupplemental(false)}
                        >
                            Complete
                        </Button>
                        <Button
                            variant={supplemental ? "contained" : "outlined"} 
                            onClick={() => setSupplemental(true)}
                        >
                            Supplemental
                        </Button>
                        </ButtonGroup>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                            label="Start Time"
                            value={scheduleStart}
                            onChange={(newValue) => {
                                setScheduleStart(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            />
                            <TimePicker
                            label="End Time"
                            value={scheduleEnd}
                            onChange={(newValue) => {
                                setScheduleEnd(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        </LocalizationProvider>
                        Off time for led
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                            label="Turn off LED Time"
                            value={supplementalStart}
                            onChange={(newValue) => {
                                setSupplementalStart(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            />
                            <TimePicker
                            label="Turn on LED Time"
                            value={supplementalEnd}
                            onChange={(newValue) => {
                                setSupplementalEnd(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        </LocalizationProvider>
                    </React.Fragment>
            )}
            
        </React.Fragment>
    )
}

export default LightControl;
