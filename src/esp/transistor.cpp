
#include <ArduinoOTA.h>
#include <math.h>

#include "transistor.h"

#include "config.h"


namespace transistor {
    double dc = 0;
    double cycletime = 500;
    bool turn = false;

    void setDutyCycle(int percent) {
        if (percent >= 0 && percent <= 90) dc = percent;
    }

    int getDutyCycle() {
        return dc;
    }

    void increaseDutyCycle(int percent) {
        if (percent >= 0) dc = min(floor(dc + percent), (double) 90);
    }

    void decreaseDutyCycle(int percent) {
        if (percent >= 0) dc = max(floor(dc - percent), (double) 0); 
    }

    void cycle(unsigned long time) {
        double wait = cycletime * (1 - dc/100) - time;
        delay(max(floor(wait),(double) 0));
        if (turn) digitalWrite(MOS1PIN, HIGH);
        else digitalWrite(MOS2PIN, HIGH);
        digitalWrite(BLUE, HIGH);
        digitalWrite(RED, HIGH);
        delay(ceil(cycletime * (dc / 100)));
        if (turn) digitalWrite(MOS1PIN, LOW);
        else digitalWrite(MOS2PIN, LOW);
        digitalWrite(BLUE, LOW);
        digitalWrite(RED, LOW);
        turn = !turn;
    }

}
