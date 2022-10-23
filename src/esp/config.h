/*
   This software is licensed under the MIT License. See the license file for details.
   Source: https://github.com/spacehuhntech/WiFiDuck
 */

#pragma once

#define VERSION "1.1"

/*! ===== DEBUG Settings ===== */
#define ENABLE_DEBUG 1
#define DEBUG_LED 2
#define DEBUG_PORT Serial
#define DEBUG_BAUD 115200

/*! ===== WiFi AP-MODE Settings ===== */
#define WIFI_SSID "Bloomer"
#define WIFI_PASSWORD "bloomer123"
#define WIFI_CHANNEL "1"

#define HOSTNAME "Bloomer"
#define URL "bloomer.local"

/*! ===== WiFi STA-MODE Settings ===== */
#define NETWORK_SSID ""
#define NETWORK_PASSWORD ""

/*! ===== Temperature Settings ===== */
#define TARGET_TEMP 25
#define APIKEY 
#define TEMP1PIN 32
#define TEMP2PIN 35

/*! ===== Transistor Settings ===== */
#define MOS1PIN 25
#define MOS2PIN 27

/*! ===== Button Settings ===== */
#define BUTTON1PIN 23
#define BUTTON2PIN 18

// /*! ===== Battery Settings ===== */
// #define CELLONE 34
// #define CELLTWO 33
// #define MINVOLTAGE 5.5
// #define MAXVOLTAGE 6.6


/*! ===== LED Settings ===== */
#define BLUE 12
#define RED 4
#define GREEN 15

#if !defined(ESP32)
#error You are compiling for the wrong board, mate! Select something with an ESP32.
#endif
