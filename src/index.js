import { Telegraf, Scenes, session } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config()

import chooseLanguageScene from './scenes/choose_language_scene.js';
import wordQuizScene from './scenes/word_quiz_scene.js';
import * as constants from './constants.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([chooseLanguageScene, wordQuizScene]);

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

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));