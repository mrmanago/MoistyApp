import * as React from "react";
import {useState, useEffect, useRef} from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Typography } from "@mui/material";

// MEANT TO DEMO SENSOR READING. TEMP SENSOR IS NOT NEEDED ON PRODUCT

const TempSensor = () => {
    const [temp, setTemp] = useState(0);
    const websocket = useRef(null);

    useEffect(() => {
        websocket.current = new W3CWebSocket("ws:/192.168.2.1/ws-api/temp");
        websocket.current.onopen = () => console.log("WebSocket temp opened");
        websocket.current.onclose = () => console.log("Websocket temp closed");
        
        websocket.current.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            console.log("got reply: ");
            console.log(dataFromServer);
            if (dataFromServer.type === "message") {
                setTemp(dataFromServer.temp);
            }
        }
        return () => websocket.current.close();
    }, []);

    return (
        <React.Fragment>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                TEMP
            </Typography>
            {temp}
        </React.Fragment>
    )
}

export default TempSensor;
