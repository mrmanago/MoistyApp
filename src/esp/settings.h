/*
   This software is licensed under the MIT License. See the license file for details.
   Source: https://github.com/spacehuhntech/WiFiDuck
 */

#pragma once

#include <Arduino.h> // String

namespace settings {
    void begin(bool mode);
    void load();
    void end();

    void reset();

    String toString();

    const char* getSSID(bool choice);
    const char* getPassword(bool choice);
    const char* getChannel();
    int getTemperature();

    int getChannelNum();

    void set(const char* name, const char* value);

    void setSSID(const char* ssid, bool choice);
    void setPassword(const char* password, bool choice);
    void setChannel(const char* channel);
    void setTemperature(int temperature);
    void setLED(bool led);
    void setPUMP(bool pump);
    void setFAN(bool fan);
}
