

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

void IRAM_ATTR press1() {
    event1 = true;
}

void IRAM_ATTR press2() {
    event2 = true;
}

void setup() {
    debug_init();

    delay(200);
    pinMode(BUTTON1PIN, INPUT_PULLUP);
    pinMode(BUTTON2PIN, INPUT_PULLUP);
    pinMode(DEBUG_LED, OUTPUT);
    pinMode(MOS1PIN, OUTPUT);
    pinMode(MOS2PIN, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(BLUE, OUTPUT);
    pinMode(RED, OUTPUT);
    attachInterrupt(BUTTON1PIN, press1, RISING);
    attachInterrupt(BUTTON2PIN, press2, RISING);
    digitalWrite(GREEN, HIGH); // For Anton
    delay(2000);
    digitalWrite(GREEN, LOW);
    settings::begin(false);
    cli::begin();
    webserver::begin();


    debug("\n[~~~ Glove v");
    debug(VERSION);
    debugln(" Started! ~~~]");
}

void loop() {
  unsigned long StartTime = millis();
  debug_update();
  webserver::update();
}
