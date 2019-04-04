# Deaf Emergency Call 112 (dec112) API services
Providing emergency 112 calling functions for the deaf.
This projects implements the backend API services

## Installation
To instal ensure you have the following dependecies installed:

1. node.js
   Download and install node from https://nodejs.org/en/
2. If you install from distribution ZIP file:
    * A zip unpacker
    * Unzip the dec112-api.zip archive somewhere on your server
3. If you install from distribution GIT repository
    * Execute `git pull` from dec112 git directory
4. Change into the dist folder and enter
   "npm install --production"
5. Change configuration in dist/config/env according your needs
6. Change start_server script in root directory to match your
   configuration

## Usage
TODO: Write usage instructions

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

To start development ensure you have the following dependecies
installed:

1. node.js
   Download and install node from https://nodejs.org/en/
2. grunt-cli
   Install using "npm install -g grunt-cli"
3. bower
   Install using "npm install -g bower"
4. typings
   Install using "npm install -g typings"
5. Visual Studio Code (vscode)
   Download and install from https://code.visualstudio.com/

Then inside the dec112 folder issue the following commands:

1. npm install
2. bower install
3. typings install
4. open dec112-api folder with vscode and start coding
5. CTRL+SHIFT+B in vscode builds project - or -
   to build project from command line enter "grunt build"
6. After build "dist" folder contains redistributable built
   project (also available in compressed "dec112-api.zip" archive in
   project root folder)

To install on a production system do:

1. unzip "dec112-api.zip" on the production server
2. cd into dist folder with "cd dist"
3. npm install --production
4. To run project enter:
   "start_server"


## Notes

## History

## Credits

## Waranty
---

This software is a prototypically implementation of a lightweight, web based
control center for handling deaf emegency communications in a text based
chat. There is ABSOLUTELY NO GUARANTY that it works as expected! As emergency
communication is critical use this software at your own risk! The authors
accept no liability for any incidents resulting from using this software!

---

## License
This project is under GNU GPLv3.
See file gpl-3.0.txt in this project or http://www.gnu.org/licenses/gpl-3.0.html
