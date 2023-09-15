# Pdf player library for Sunbird platform!
Contains PDF player library components powered by angular. These components are designed to be used in sunbird consumption platforms *(mobile app, web portal, offline desktop app)* to drive reusability, maintainability hence reducing the redundant development effort significantly.

# Getting Started
For help getting started with a new Angular app, check out the [Angular CLI](https://angular.io/cli).
If you have an Angular ≥ 9 CLI project, you could simply use our schematics to add sunbird-pdf-player library to it.

## Step 1: Installation

Just run the following:
```red
ng add @project-sunbird/sunbird-pdf-player-v9
```

It will install sunbird-pdf-player for the default application specified in your `angular.json`. If you have multiple projects and you want to target a specific application, you could specify the `--project` option

```red
ng add @project-sunbird/sunbird-pdf-player-v9 --project myProject
```
### Manual installation
If you prefer not to use schematics or want to add `sunbird-pdf-player-v9` to an older project, you'll need to do the following:

<details>
  <summary>Click here to show detailed instructions!</summary>
  
  #### 1. Install the packages:

  ```bash
  npm install @project-sunbird/sunbird-pdf-player-v9 --save
  npm install @project-sunbird/sb-styles --save
  npm install @project-sunbird/client-services --save
  ```

  #### 2. Include the sb-styles and assets in angular.json configuration:
    
  Add following under architect.build.assets and styles
  
  ```diff
  {
    ...
    "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      ...
      "assets": [
      ...
  +   {
  +    "glob": "**/*.*",
  +    "input": "./node_modules/@project-sunbird/sunbird-pdf-player-v9/lib/assets/",
  +    "output": "/assets/"
  +   }	
      ...    
      ],
      "styles": [
      ...
  +   "./node_modules/@project-sunbird/sb-styles/assets/_styles.scss"    
      ...
      ],
      ...
    }
  ```
  

  #### 3. Import the modules and components:

  Import the NgModule where you want to use:

  ```diff
+  import { SunbirdPdfPlayerModule } from '@project-sunbird/sunbird-pdf-player-v9';
  @NgModule({
    ...
+    imports: [SunbirdPdfPlayerModule],
    ...
  })
  export class YourAppModule { }
  
  ```

</details>

## Step 2: Send input to render PDF player

Use the mock config in your component to send input to PDF player
Click to see the mock - [playerConfig](https://github.com/project-sunbird/sunbird-pdf-player/blob/release-4.5.0/src/app/data.ts)

## Player config
```js
var playerConfig = {
  "context": {
    "mode": "play",  // To identify preview used by the user to play/edit/preview
    "authToken": "", // Auth key to make  api calls
    "sid": "7283cf2e-d215-9944-b0c5-269489c6fa56", // User sessionid on portal or mobile 
    "did": "3c0a3724311fe944dec5df559cc4e006", // Unique id to identify the device or browser 
    "uid": "anonymous", // Current logged in user id
    "channel": "505c7c48ac6dc1edc9b08f21db5a571d", // Unique id of the channel(Channel ID)
    "pdata": {
      "id": "sunbird.portal", // Producer ID. For ex: For sunbird it would be "portal" or "genie"
      "ver": "3.2.12", // Version of the App
      "pid": "sunbird-portal.contentplayer" // Optional. In case the component is distributed, then which instance of that component
    },
    "contextRollup": { // Defines the content roll up data
      "l1": "505c7c48ac6dc1edc9b08f21db5a571d"
    },
    "tags": [ // Defines the tags data
      ""
    ],
    "cdata": [], // Defines correlation data
    "timeDiff": 0,  // Defines the time difference
    "objectRollup": {}, // Defines the object roll up data
    "host": "", // Defines the from which domain content should be load
    "endpoint": "", // Defines the end point
    "userData": {  // Defines the user data firstname & lastname
      "firstName": "",
      "lastName": ""
    }
  },
  "config": { 
    "sideMenu": { 
      "showShare": true, // show/hide share button in side menu. default value is true
      "showDownload": true, // show/hide download button in side menu. default value is true
      "showReplay": true, // show/hide replay button in side menu. default value is true
      "showExit": false, // show/hide exit button in side menu. default value is false
      "showPrint": true // show/hide print button in side menu. default value is true
    }
  },
  "metadata": {}, // Content metadata json object (from API response take -> response.result.content)
} 

```
## Telemetry property description
|Property Name| Description| Default Value
|--|----------------------|--|
| `context` | It is an `object` it contains the `uid`,`did`,`sid`,`mode` etc., these will be logged inside the telemetry  | ```{}``` |
| `mode` | It is  `string` to identify preview used by the user to play/edit/preview | ```play```|
| `authToken` | It is  `string` and Auth key to make  api calls | ```''```|
| `sid` | It is  `string` and User sessionid on portal or mobile | ```''```|
| `did` | It is  `string` and Unique id to identify the device or browser| ```''```|
| `uid` | It is  `string` and Current logged in user id| ```''```|
| `channel` | It is `string` which defines channel identifier to know which channel is currently using.| `in.sunbird` |
| `pdata` | It is an `object` which defines the producer information it should have identifier and version and canvas will log in the telemetry| ```{'id':'in.sunbird', 'ver':'1.0'}```|
| `contextRollup` | It is an `object` which defines content roll up data | ```{}```|
| `tags` | It is an `array` which defines the tag data | ```[]```|
| `objectRollup` | It is an `object` which defines object rollup data | ```{}```|
| `host` | It is  `string` which defines the from which domain content should be load|```window.location.origin```  |
| `userData` | It is an `object` which defines user data | ```{}```|
| `cdata` | It is an `array` which defines the correlation data | ```[]```|

## Config property description
|Property Name| Description| Default Value
|--|----------------------|--|
| `config` | It is an `object` it contains the `sideMenu`, these will be used to configure the canvas  | ```{  sideMenu: {"showShare": true, "showDownload": true, "showReplay": true, "showExit": false,"showPrint": true}}``` |
| `config.sideMenu.showShare` | It is  `boolean` to show/hide share button in side menu| ```true```|
| `config.sideMenu.showDownload` | It is  `boolean` to show/hide download button in side menu| ```true```|
| `config.sideMenu.showReplay` | It is  `boolean` to show/hide replay button in side menu| ```true```|
| `config.sideMenu.showExit` | It is  `boolean` to show/hide exit button in side menu| ```false```|
| `config.sideMenu.showPrint` | It is  `boolean` to show/hide print button in side menu| ```true```|
| `metadata` | It is an `object` which defines content metadata json object (from API response take -> response.result.content) | ```{}```|

## Available components
|Feature| Notes| Selector|Code|Input|Output
|--|--|--|------------------------------------------------------------------------------------------|---|--|
| PDF Player | Can be used to render pdf | sunbird-pdf-player| *`<sunbird-pdf-player [playerConfig]="playerConfig"><sunbird-pdf-player>`*|playerConfig|playerEvent, telemetryEvent|

<br /><br />

# Mobile app integration steps 
For existing apps, follow these steps to begin using.

## Step 1: Install the packages
Click to see the steps - [InstallPackages](README.md#step-1-install-the-packages)

## Step 2: Include the sb-styles and assets in angular.json

Click to see the steps - [IncludeStyles](README.md#step-2-include-the-sb-styles-and-assets-in-angularjson)
  
## Step 3: Import the modules and components

Click to see the steps - [Import](README.md#step-3-import-the-modules-and-components)


## Step 4: Import in component       

    <sunbird-video-player [playerConfig]="playerConfig" (playerEvent)="playerEvents($event)"
    (telemetryEvent)="playerTelemetryEvents($event)"></sunbird-video-player>  

## Step 5: Send input to render PDF player

Click to see the input data - [playerConfig](README.md#step-4-send-input-to-render-pdf-player)


## Sample code
Click to see the sample code - [sampleCode](https://github.com/Sunbird-Ed/SunbirdEd-mobile-app/blob/release-4.8.0/src/app/player/player.page.html)
<br /><br />

# Use as web components	

Any web application can use this library as a web component. It accepts couple of inputs and triggers some events back to the application.

Follow below-mentioned steps to use it in plain javascript project:

- Insert [library](https://github.com/project-sunbird/sunbird-pdf-player/blob/release-4.5.0/web-component/sunbird-pdf-player.js) as below:
	```javascript
	<script type="text/javascript" src="sunbird-pdf-player.js"></script>
	```
- Get sample playerConfig from here: [playerConfig](https://github.com/project-sunbird/sunbird-pdf-player/blob/release-4.3.0/src/app/data.ts)

- Create a custom html element: `sunbird-pdf-player`
	```javascript
    const  pdfElement = document.createElement('sunbird-pdf-player');
   ```

- Pass data using `player-config`
	```javascript
	pdfElement.setAttribute('player-config', JSON.stringify(playerConfig));
	```

	**Note:** Attribute name should be in kebab-case regardless of the actual Attribute name used in the Angular app. The value of the attribute should be in **string** type, as web-component does not accept any objects or arrays.

- Listen for the output events: **playerEvent** and **telemetryEvent**

	```javascript
	pdfElement.addEventListener('playerEvent', (event) => {
		console.log("On playerEvent", event);
	});
	pdfElement.addEventListener('telemetryEvent', (event) => {
		console.log("On telemetryEvent", event);
	});
	```
- Append this element to existing element
	```javascript
	const  myPlayer = document.getElementById("my-player");
	myPlayer.appendChild(pdfPlayerElement);
	```
- Refer demo [example](https://github.com/project-sunbird/sunbird-pdf-player/blob/release-4.5.0/web-component/index.html)

- To run the project, use the following command:
	```bash
	npm run build-web-component
	http-server --cors web-component .
	```
	open [http://127.0.0.1:8081/web-component/](http://127.0.0.1:8081/web-component/)
	**Note:** There are some request for which we need to run this on server, so we need to run this on server for demo purpose we are using [http-server](https://www.npmjs.com/package/http-server).

- ![demo](https://github.com/project-sunbird/sunbird-pdf-player/blob/release-4.5.0/web-component/pdf-player-wc.png)
