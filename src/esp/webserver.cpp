/*
   This software is licensed under the MIT License. See the license file for details.
   Source: https://github.com/spacehuhntech/WiFiDuck
 */

#include "webserver.h"

#include <WiFi.h>
#include <DNSServer.h>
#include <ArduinoOTA.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <typeinfo>
#include <iostream>
#include <Adafruit_Sensor.h>
// #include <Adafruit_AM2320.h>

#include "AM2320.h"
#include "AsyncJson.h"

#include "config.h"
#include "debug.h"
#include "cli.h"
#include "settings.h"
#include "sensor.h"

#include "webfiles.h"

AM2320 sensorth;

void reply(AsyncWebServerRequest* request, int code, const char* type, const uint8_t* data, size_t len) {
    AsyncWebServerResponse* response =
        request->beginResponse_P(code, type, data, len);

    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
}


namespace webserver {
    // ===== PRIVATE ===== //
    AsyncWebServer   server(80);
    AsyncWebSocket   ws("/ws");
    AsyncEventSource events("/events");

    AsyncWebSocketClient* currentClient { nullptr };

    DNSServer dnsServer;

    bool reboot = false;

    void wsEvent(AsyncWebSocket* server, AsyncWebSocketClient* client, AwsEventType type, void* arg, uint8_t* data, size_t len) {
        if (type == WS_EVT_CONNECT) {
            debugf("WS Client connected %u\n", client->id());
        }

        else if (type == WS_EVT_DISCONNECT) {
            debugf("WS Client disconnected %u\n", client->id());
        }

        else if (type == WS_EVT_ERROR) {
            debugf("WS Client %u error(%u): %s\n", client->id(), *((uint16_t*)arg), (char*)data);
        }

        else if (type == WS_EVT_PONG) {
            debugf("PONG %u\n", client->id());
        }

        else if (type == WS_EVT_DATA) {
            AwsFrameInfo* info = (AwsFrameInfo*)arg;

            if (info->opcode == WS_TEXT) {
                char* json = (char*)data;
                //char* msg = (char*)data;
                // json[len] = 0;
                DynamicJsonDocument doc(1024);
                deserializeJson(doc, json);

                const char* type = doc["type"];



                if (strcmp(type,"LEDStatus") == 0) {
                    bool ledStat = doc["LED"];
                    debugf("turning LEDStatus to ", ledStat);
                    settings::setLED(ledStat);
                } else if (strcmp(type,"PumpStatus") == 0) {
                    bool pumpStat = doc["pump"];
                    debugf("turning PUMPStatus to ", pumpStat);
                    settings::setPUMP(pumpStat);
                } else if (strcmp(type,"FanStatus") == 0) {
                    bool fanStat = doc["fan"];
                    debugf("turning FanStatus to ", fanStat);
                    settings::setFAN(fanStat);
                }
                // const bool* LED = doc["LED"];

                debugf("Message from %u [%llu byte]=%s", client->id(), info->len, type);

                // currentClient = client;
                // cli::parse(json, [](const char* str) {
                //     webserver::send(str);
                //     debugf("%s\n", str);
                // }, false);
                // currentClient = nullptr;


            }
        }
    }


    

    // int kl = sensor::readWater();
    // std::string testl = std::to_string(kl);
    // std::string testlk = "{\"type\":\"WaterStatus\",\"waterLevel\": ";
    // char json[30];

    void cumrag() {
        DynamicJsonDocument doc(1024);
        doc["type"] = "WaterStatus";
        doc["waterLevel"] = sensor::readWater();

        char Serial[1024];
        serializeJson(doc, Serial);
        ws.textAll(Serial);
    }

    // float readAMTemp() {
    //     return AM2320.readTemperature();
    // }
    // float readAMHum() {
    //     return AM2320.readHumidity();
    // }

    void sendTemp() {
        DynamicJsonDocument doc(1024);
        doc["type"] = "TempStatus";
        doc["temp"] = sensorth.getTemperature();
        // Serial.print("Temperature: ");
        // Serial.print(sensorth.getTemperature());
        

        char final[1024];
        serializeJson(doc, final);

        ws.textAll(final);
    }

    void sendHum() {
        

        DynamicJsonDocument doc(1024);
        doc["type"] = "HumidityStatus";
        doc["humidity"] = sensorth.getHumidity();
        // Serial.print("Humidity: ");
        // Serial.println(sensorth.getHumidity());
    
        char final[1024];
        serializeJson(doc, final);

        ws.textAll(final);
    }

    void sendNut() {
        DynamicJsonDocument doc(1024);
        doc["type"] = "NutrientsStatus";
        doc["nutrients"] = ceil(sensor::getEC()*100.0)/100.0;

        char Serial[1024];
        serializeJson(doc, Serial);

        ws.textAll(Serial);
    }
    
    void sendWaterTemp() {
        DynamicJsonDocument doc(1024);
        doc["type"] = "WaterStatus";
        doc["waterLevel"] = ceil(sensor::readNTC()*100.0)/100.0;

        char Serial[1024];
        serializeJson(doc, Serial);

        ws.textAll(Serial);
    }

    



    void sendshit() {
        int k = sensor::readWater();
        //char json[] = "{\"type\":\"WaterStatus\",\"waterLevel\": ", "555" " }";
        
        // std::string testl = std::to_string(kl);
        // std::string testlk = "{\"type\":\"WaterStatus\",\"waterLevel\": ";
        // for (int i = 0; i < testlk.size(); i++) {
        //     json[i] = testlk[i];
        // }   
        // for (int i = 0; i < testl.size(); i++) {
        //     json[testlk.size() + i] = testl[i];
        // }
        // json[testlk.size() + testl.size()] = '}';
        //ws.textAll(json);
    }

    // ===== PUBLIC ===== //
    void begin() {

        sensorth.begin();
        // Access Point
        WiFi.hostname(HOSTNAME);

        // WiFi.mode(WIFI_AP_STA);
        WiFi.softAP(settings::getSSID(false), settings::getPassword(false), settings::getChannelNum());
        debugf("Started Access Point \"%s\":\"%s\"\n", settings::getSSID(false), settings::getPassword(false));

        // Webserver
        server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
            request->redirect("/index.html");
        });

        // server.onNotFound([](AsyncWebServerRequest* request) {
        //     request->redirect("/error404.html");
        // });

        server.on("/run", [](AsyncWebServerRequest* request) {
            String message;

            if (request->hasParam("cmd")) {
                message = request->getParam("cmd")->value();
            }

            request->send(200, "text/plain", "Run: " + message);

            cli::parse(message.c_str(), [](const char* str) {
                debugf("%s\n", str);
            }, false);
        });

        WEBSERVER_CALLBACK;

        // Arduino OTA Update
        ArduinoOTA.onStart([]() {
            events.send("Update Start", "ota");
        });
        ArduinoOTA.onEnd([]() {
            events.send("Update End", "ota");
        });
        ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
            char p[32];
            sprintf(p, "Progress: %u%%\n", (progress/(total/100)));
            events.send(p, "ota");
        });
        ArduinoOTA.onError([](ota_error_t error) {
            if (error == OTA_AUTH_ERROR) events.send("Auth Failed", "ota");
            else if (error == OTA_BEGIN_ERROR) events.send("Begin Failed", "ota");
            else if (error == OTA_CONNECT_ERROR) events.send("Connect Failed", "ota");
            else if (error == OTA_RECEIVE_ERROR) events.send("Recieve Failed", "ota");
            else if (error == OTA_END_ERROR) events.send("End Failed", "ota");
        });
        ArduinoOTA.setHostname(HOSTNAME);
        ArduinoOTA.begin();

        events.onConnect([](AsyncEventSourceClient* client) {
            client->send("hello!", NULL, millis(), 1000);
        });
        server.addHandler(&events);

        // Web OTA
        server.on("/update", HTTP_POST, [](AsyncWebServerRequest* request) {
            reboot = !Update.hasError();

            AsyncWebServerResponse* response;
            response = request->beginResponse(200, "text/plain", reboot ? "OK" : "FAIL");
            response->addHeader("Connection", "close");

            request->send(response);
        }, [](AsyncWebServerRequest* request, String filename, size_t index, uint8_t* data, size_t len, bool final) {
            if (!index) {
                debugf("Update Start: %s\n", filename.c_str());
                if (!Update.begin((ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000)) {
                    Update.printError(Serial);
                }
            }
            if (!Update.hasError()) {
                if (Update.write(data, len) != len) {
                    Update.printError(Serial);
                }
            }
            if (final) {
                if (Update.end(true)) {
                    debugf("Update Success: %uB\n", index+len);
                } else {
                    Update.printError(Serial);
                }
            }
        });

        dnsServer.start(53, URL, IPAddress(192, 168, 4, 1));

        // Websocket
        ws.onEvent(wsEvent);
        server.addHandler(&ws);

        // Start Server
        server.begin();
        debugln("Started Webserver");
    }

    void cumdumpster() {
        //cumrag();
        
        delay(2000);
    }

    void update() {
        ArduinoOTA.handle();
        if (reboot) ESP.restart();
        dnsServer.processNextRequest();
        sendTemp();
        sendHum();
        sendNut();
        sendWaterTemp();
    }

    

    void send(const char* str) {
        if (currentClient) currentClient->text(str);
    }

    void end() {
        WiFi.softAPdisconnect(true);
    }
}
