#include <ArduinoOTA.h>
#include <math.h>

#include "sensor.h"

#include "config.h"


namespace sensor {
    double currentReadingOne;
    double currentReadingTwo;
    double readingSensorOne() {
        double voltage = analogReadMilliVolts(TEMP1PIN);
        currentReadingOne = voltage / 10;
        return round(currentReadingOne);
    }

    String toStringOne() {
      String s;

      s += "Sensor1=";
      s += currentReadingOne;
      s += "\n";
      s += "Sensor2=";
      s += currentReadingTwo;
      s += "\n";

      return s;
    }

    double readingSensorTwo() {
        double voltage = analogReadMilliVolts(TEMP2PIN);
        currentReadingTwo = voltage / 10;
        return round(currentReadingTwo);
    }
}
