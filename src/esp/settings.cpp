/*
   This software is licensed under the MIT License. See the license file for details.
   Source: https://github.com/spacehuhntech/WiFiDuck
 */
 
#include <Preferences.h>
#include "settings.h"

#include "debug.h"
#include "config.h"
#include "sensor.h"

Preferences preferences;

namespace settings {
    // ===== PRIVATE ===== //
    String ssid_ap;
    String password_ap;
    String channel;
    String ssid_sta;
    String password_sta;
    int targetTemp;
    // bool ledState;
    
    // ===== PUBLIC ====== //
    void begin(bool mode) {
        preferences.begin("Settings", mode);
        load();
    }

    void load() {
      debugln("loading");
      ssid_ap = preferences.getString("SSID_AP", WIFI_SSID); 
      password_ap = preferences.getString("Password_AP", WIFI_PASSWORD);
      ssid_sta = preferences.getString("SSID_STA", NETWORK_SSID); 
      password_sta = preferences.getString("Password_STA", NETWORK_PASSWORD);
      channel = preferences.getString("Channel", WIFI_CHANNEL);
      targetTemp = preferences.getInt("Temperature", TARGET_TEMP);
      //ledState = preferences.getInt("LED", DEBUG_LED);
    }

    void end() {
      preferences.end();
    }

    // resets settings to default
    void reset() {
        debugln("Resetting Settings");
        setSSID(WIFI_SSID, false);
        setPassword(WIFI_PASSWORD, false);
        setSSID(NETWORK_SSID, true);
        preferences.putString("Password_STA", NETWORK_PASSWORD);        
        setChannel(WIFI_CHANNEL);
        setTemperature(TARGET_TEMP);
        //setLED(false);
    }

    void save() {
        debugln("Saving Settings");


        preferences.putString("SSID_STA", ssid_sta);
        preferences.putString("Password_STA", password_sta);

    }

    // cli output
    String toString() {
        String s;

        s += "ssid=";
        s += getSSID(true);
        s += "\n";
        s += "password=";
        s += getPassword(true);
        s += "\n";
        s += "channel=";
        s += getChannel();
        s += "\n";
        s += "Temperature=";
        s += getTemperature();
        s += "\n";
        // s += "LED=";
        // s += getLED();
        // s += "\n";

        return s;
    }

    const char* getSSID(bool choice) {
        if (choice) {
            return ssid_sta.c_str();
        }
        return ssid_ap.c_str();
    }

    const char* getPassword(bool choice) {
        if (choice) {
            return password_sta.c_str();
        }
        return password_ap.c_str();
    }

    const char* getChannel() {
        return channel.c_str();
    }

    int getTemperature() {
        return targetTemp;
    }

    // bool getLED() {
    //     return ledState;
    // }


    int getChannelNum() {
        if (strcmp(channel.c_str(), "auto") != 0) return atoi(channel.c_str());
        return 1;
    }

    void set(const char* name, const char* value) {
        debugln("test");
        if (strcmp(name, "ssid_ap") == 0) {
            setSSID(value, false);
        } else if (strcmp(name, "password_ap") == 0) {
            setPassword(value, false);
        } else if (strcmp(name, "channel") == 0) {
            setChannel(value);
        } else if (strcmp(name, "ssid") == 0) {
            setSSID(value, true);
            debugln("worked");
        } else if (strcmp(name, "password") == 0) {
            setPassword(value, true);
        } else if (strcmp(name, "targetTemp") == 0) {
            setTemperature(atoi(value));
        }  //else if (strcmp(name, "ledState" == 0) {
        //     setLED(atoi(value));
        // }
    }

    void setSSID(const char* ssid, bool choice) {
        if (ssid && (strlen(ssid) <= 33)) {
            if(choice) {
                ssid_sta = ssid;
                preferences.putString("SSID_STA", ssid_sta);
            } else {
                ssid_ap = ssid;
                preferences.putString("SSID_AP", ssid_ap);
            }
        }
    }

    void setTemperature(int temperature) {
        if (temperature && (temperature <= 35)) {
            targetTemp = temperature;
            preferences.putInt("Temperature", targetTemp);
        }
    }

    void setLED(bool led) {
        if (led == true) digitalWrite(DEBUG_LED, HIGH);
        else digitalWrite(DEBUG_LED, LOW);
    }

    void setFAN(bool fan) {
        if (fan == true) digitalWrite(FAN, HIGH);
        else digitalWrite(FAN, LOW);
    }

    void setPUMP(bool pump) {
        if (pump == true) digitalWrite(PUMP, HIGH);
        else digitalWrite(PUMP, LOW);
    }
    
    // void setLED(int led) {
    //     if (ledState != led) {
    //         ledState = led;
    //         preferences.putBool("LED", ledState);
    //     }
        
    // }

    void setPassword(const char* password, bool choice) {
        if (password && (strlen(password) >= 8) && (strlen(password) <= 65)) {
            if (choice) {
                password_sta = password;
                preferences.putString("Password_STA", password_sta);
            } else {
                password_ap = password;
                preferences.putString("Password_AP", password_ap);
            }
        }
    }

    void setChannel(const char* channels) {
        if (channels && ((strcmp(channels, "auto") == 0) || ((atoi(channels) >= 1) && (atoi(channels) <= 13))) && (strlen(channels) <= 5)) {
            channel = channels;
            preferences.putString("Channel", channel);
        }
    }

}
