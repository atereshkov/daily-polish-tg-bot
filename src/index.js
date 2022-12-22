import { Telegraf, Scenes, session } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config()

import chooseLanguageScene from './scenes/choose_language_scene.js';
import wordQuizScene from './scenes/word_quiz_scene.js';
import addWordScene from './scenes/add_word_scene.js';
import * as constants from './constants.js';

let bot;

if (process.env.NODE_ENV === "production") {
    bot = new Telegraf(process.env.BOT_TOKEN);
} else {
    bot = new Telegraf(process.env.TEST_BOT_TOKEN);
}

const stage = new Scenes.Stage([chooseLanguageScene, wordQuizScene, addWordScene]);

bot.use(session());
bot.use(stage.middleware());

bot.command("start", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_CHOOSE_LANGUAGE);
});

bot.command("language", ctx => {
    return ctx.scene.enter(constants.SCENE_ID_CHOOSE_LANGUAGE, { direct_command: true });
});

bot.command('word', (ctx) => ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ));
bot.hears('word', (ctx) => ctx.scene.enter(constants.SCENE_ID_WORD_QUIZ));

// bot.command('word', (ctx) => ctx.scene.enter(constants.SCENE_ID_STATS));

bot.command('add_word', (ctx) => ctx.scene.enter(constants.SCENE_ID_ADD_WORD));

if (process.env.NODE_ENV === "production") {
    bot.launch();
        // .launch({ webhook: { domain: process.env.WEBHOOK_URL, port: process.env.WEBHOOK_PORT }})
        // .then(() => console.log("Webhook bot listening on port", process.env.WEBHOOK_PORT));
} else {
    bot.launch();
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));