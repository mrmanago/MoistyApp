/*!
   \file esp_duck/cli.cpp
   \brief Command line interface source
   \author Stefan Kremser
   \copyright MIT License
 */

#include "cli.h"

// SimpleCLI library
#include <SimpleCLI.h>

// Import modules used for different commands
#include "settings.h"
#include "config.h"
#include "sensor.h"
#include "test.h"

namespace cli {
    // ===== PRIVATE ===== //
    SimpleCLI cli;           // !< Instance of SimpleCLI library

    PrintFunction printfunc; // !< Function used to print output

    /*!
     * \brief Internal print function
     *
     * Outputs a c-string using the currently set printfunc.
     * Helps to keep code readable.
     * It's only defined in the scope of this file!
     *
     * \param s String to printed
     */
    inline void print(const String& s) {
        if (printfunc) printfunc(s.c_str());
    }

    // ===== PUBLIC ===== //
    void begin() {
        /**
         * \brief Set error callback.
         *
         * Prints 'ERROR: <error-message>'
         * And 'Did you mean "<command-help>"?'
         * if the command name matched, but the arguments didn't
         */
        cli.setOnError([](cmd_error* e) {
            CommandError cmdError(e); // Create wrapper object

            String res = "ERROR: " + cmdError.toString();

            if (cmdError.hasCommand()) {
                res += "\nDid you mean \"";
                res += cmdError.getCommand().toString();
                res += "\"?";
            }

            print(res);
        });

        /**
         * \brief Create help Command
         *
         * Prints all available commands with their arguments
         */
        cli.addCommand("help", [](cmd* c) {
            print(cli.toString());
        });

        cli.addCommand("test", [](cmd* c) {
            test::setMode(true);
        });

        cli.addCommand("stop", [](cmd* c) {
            test::setMode(false);
        });

        
        /**
         * \brief Create temperature Command
         *
         * Prints all available commands with their arguments
         */
        cli.addCommand("temperature", [](cmd* c) {
            sensor::readingSensorOne();
            sensor::readingSensorTwo();
            print(sensor::toStringOne());
        });

        /**
         * \brief Create ram command
         *
         * Prints number of free bytes in the RAM
         */
        cli.addCommand("ram", [](cmd* c) {
            size_t freeRam = ESP.getFreeHeap();
            String res     = String(freeRam) + " bytes available";
            print(res);
        });

        /**
         * \brief Create version command
         *
         * Prints the current version number
         */
        cli.addCommand("version", [](cmd* c) {
            String res = "Version " + String(VERSION);
            print(res);
        });

        /**
         * \brief Create settings command
         *
         * Prints all settings with their values
         */
        cli.addCommand("settings", [](cmd* c) {
            settings::load();
            print(settings::toString());
        });

        /**
         * \brief Create set command
         *
         * Updates the value of a setting
         *
         * \param name name of the setting
         * \param vale new value for the setting
         */
        Command cmdSet {
            cli.addCommand("set", [](cmd* c) {
                Command  cmd { c };

                Argument argName { cmd.getArg(0) };
                Argument argValue { cmd.getArg(1) };

                String name { argName.getValue() };
                String value { argValue.getValue() };

                settings::set(name.c_str(), value.c_str());

                String response = "> set \"" + name + "\" to \"" + value + "\"";

                print(response);
            })
        };
        cmdSet.addPosArg("n/ame");
        cmdSet.addPosArg("v/alue");

        /**
         * \brief Create reset command
         *
         * Resets all settings and prints out the defaul values
         */
        cli.addCommand("reset", [](cmd* c) {
            settings::reset();
            print(settings::toString());
        });
    }

    
    
    void parse(const char* input, PrintFunction printfunc, bool echo) {

            cli::printfunc = printfunc;
            if (echo) {
                  String s = "# " + String(input);
                  print(s);
            }
            cli.parse(input);
    }
}
