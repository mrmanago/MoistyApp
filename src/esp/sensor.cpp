#include <ArduinoOTA.h>
#include <math.h>

#include "sensor.h"
#include <Adafruit_Sensor.h>
#include <Adafruit_AM2320.h>

#include "config.h"


namespace sensor {
    double currentReadingOne;
    double currentReadingTwo;
    const int Vin = 4095.0;
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

    float readAM2320() {
        return AM2320.readTemperature();
    }

    float readNTC() {
        //read pin
        int Vo = analogRead(WATER_TEMP);

        //Use voltage divider equation to find R2
        float R2 = (10000 * (float)Vo) / (Vin - (float)Vo);
        float logR2 = log(R2);
        
        //Steinhart-Hart equation is used to find temperature
        float c1 = 1.009249522e-03, c2 = 2.378405444e-04, c3 = 2.019202697e-07;
        float T = (1.0 / (c1 + c2*logR2 + c3*logR2*logR2*logR2));
        T = T - 273.15;
        return T;
    }

    float getEC(){
  
        digitalWrite(ECin,HIGH);
        int raw= analogRead(ECout);

        //For debugging
        Serial.print("Votlage 1 EC:");
        Serial.println(raw);
        
        raw = analogRead(ECout);// This is not a mistake, First reading will be low beause if charged a capacitor

        //For debugging
        Serial.print("Votlage 2 EC:");
        Serial.println(raw);
        digitalWrite(ECin,LOW);
            
        //Convert to EC
        float Vdrop = (3.3*raw)/Vin;
        //For debugging
        Serial.print("Vdrop: ");
        Serial.println(Vdrop);
        //Find resistance of water
        int Rc = (Vdrop*1000)/(3.3-Vdrop);
        //For debugging
        Serial.print("RC: ");
        Serial.println(Rc);

        //Cell constant
        //EU plug: K= 1.76
        //US Plug: K= 2.88

        //FORMULA FOR CELL CONSTANT = l/a where l is distance between electrodes and a is area of cross section of elecrode
        float K=1.76;

        // EC = 1000 * 1/Rc * 1/K
        float EC = 1000/(Rc * K);

        //For debugging
        Serial.print("EC: ");
        Serial.println(EC);
        
        
        //*************Compensating For Temperaure********************//
        //The value below will change depending on what chemical solution we are measuring
        //0.019 is generaly considered the standard for plant nutrients [google "Temperature compensation EC" for more info
        //https://pubmed.ncbi.nlm.nih.gov/15327152/#:~:text=The%20measured%20EC%20values%20at,EC%20per%201%20degrees%20C). <-- to mention in report
        float TemperatureCoef = 0.019; //this changes depending on what chemical we are measuring
        float EC25  =  EC/ (1+ TemperatureCoef*(readNTC()-25.0));
        
        float PPMconversion=0.7;
        float ppm = (EC25) * (PPMconversion*1000);
        

        return EC25*1000;
    }
}
