
#include <ArduinoOTA.h> // String

namespace test {
    bool modeOne = false;
    void setMode(bool newM) {
        modeOne = newM;
    }
    bool getMode() {
        return modeOne;
    }
}