#pragma once

#include <Arduino.h> // String

namespace sensor {
    double readingSensorOne(); //returns celsius reading of temp sensor within have a degreee of accuracy
    double readingSensorTwo();
    float readTempAM2320();
    float readHumAM2320();
    float readNTC();
    float getEC();
    int readWater();
    String toStringOne();
}
