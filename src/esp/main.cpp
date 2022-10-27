

#include "config.h"
#include "debug.h"
#include <Arduino.h>

#include "webserver.h"
#include "settings.h"
#include "cli.h"
#include "transistor.h"
#include "sensor.h"
#include "test.h"

bool event1 = false;
bool event2 = false;
bool autoM = true;
unsigned long startCycle;
int currentDC;
int currentStep = 10;
unsigned long endCycle;
bool first = true; // is it the first mode switch


void setup() {
    debug_init();
    delay(200);
    pinMode(BUTTON1PIN, INPUT_PULLUP);
    pinMode(BUTTON2PIN, INPUT_PULLUP);
    pinMode(DEBUG_LED, OUTPUT);
    pinMode(PUMP, OUTPUT);
    pinMode(FAN, OUTPUT);

    pinMode(ECIN, OUTPUT);
    digitalWrite(ECIN,LOW);
    pinMode(WATER_POWER, OUTPUT);
    digitalWrite(WATER_POWER, HIGH);


    pinMode(MOS1PIN, OUTPUT);
    pinMode(MOS2PIN, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(BLUE, OUTPUT);
    pinMode(RED, OUTPUT);
    digitalWrite(DEBUG_LED, LOW);
    digitalWrite(PUMP, LOW);
    digitalWrite(FAN, LOW);
    digitalWrite(GREEN, HIGH); // For Anton
    delay(2000);
    digitalWrite(GREEN, LOW);
    settings::begin(false);
    cli::begin();
    webserver::begin();


    debug("\n[~~~ Bloomer v");
    debug(VERSION);
    debugln(" Started! ~~~]");
}

void loop() {
  unsigned long StartTime = millis();
  // Serial.print("Water temp: ");
  // Serial.println(sensor::readNTC());
  // Serial.print("Humidity: ");
  // Serial.println(readHumidity());
  // Serial.print("Temperature: ");
  // Serial.println(AM2320.readTemperature());
  // Serial.print("EC: ");
  // Serial.println(sensor::getEC());
  //Serial.print("Water: ");
  // Serial.println(sensor::readWater());
  // webserver::sendshit("Suck my dick");
  delay(500);
  debug_update();
  webserver::update();
}