# daily-polish-tg-bot

Simple telegram bot for learning polish words on a daily basis. Written in JS and hosted on fly.io.

https://t.me/DailyPolishBot

### Stack

* NodeJS, JavaScript, Express
* Postgres (`pg`) used as a database, persisting users and data
* `node-schedule` used to send messages on a daily basis
* Built using `telegraf` as a TG client
* Logger `winston`
* `@amplitude/node` used for analytics purposes

### Run

#### Dev

`npm run start-dev` will start with `dev` environment in polling mode and will use `nodemon`.

#### Prod

`npm run start` will start with `production` environment and will use webhook.

### Deploy on fly.io

TBC.
