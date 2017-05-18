# RocketMapExtras
Adds extra features to rocketmap

## What is this?
This is a separate addition to RocketMap, adding some additional features such as map history or trainer history.

## What do you get?
See the screenshots below:

* Gym history: http://imgur.com/a/3BhHV
* Trainer info: http://imgur.com/a/c4oUS

## Prerequisites

1. Some basic understanding of web-technology (Sorry, I won't handhold you beyond this readme)
2. You need to have NPM installed (See: https://nodejs.org/en/ )
3. You need to have gulp installed globally (ie: `npm install gulp -g`)

## Installation

1. Download RocketMapExtras and extract the files into a folder
2. Open `gulp-config.json` and correct the URL's there (Depending on your setup, you might not need to change the \_\_GYMDATA_PATH\_\_ value).
3. Go to the folder in terminal or command prompt and type: `gulp build`
4. A `dist` folder will be created, copy the contents to your webserver
5. Run `/RocketMapExtras/GymData/create_tables.php` once, then delete it from your server
6. Setup a cron or scheduled task that executes `/RocketMapExtras/GymData/task.php` periodically
