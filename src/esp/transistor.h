#pragma once

#include <Arduino.h> // String

namespace transistor {
    void increaseDutyCycle(int percent);
    void decreaseDutyCycle(int percent);
    
    void setDutyCycle(int percent);

    int getDutyCycle();

    void cycle(unsigned long time);
}