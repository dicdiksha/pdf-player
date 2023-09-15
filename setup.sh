#!/bin/sh

npm i
cd projects/sunbird-pdf-player
npm i
cd ../..
npm run build-lib
cd dist/sunbird-pdf-player
npm link
cd ../..
npm link @project-sunbird/sunbird-pdf-player