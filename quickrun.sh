# runs the app in electron-prebuilt
# make sure to run the setup script first
cd src
node compile_css.js
./node_modules/.bin/electron .
