#pragma once

#include <Arduino.h> // String

namespace sensor {
    double readingSensorOne(); //returns celsius reading of temp sensor within have a degreee of accuracy
    double readingSensorTwo();
    String toStringOne();
}
