import { Telegraf, Scenes, session } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config()

import chooseLanguageScene from './scenes/choose_language_scene.js';
import wordQuizScene from './scenes/word_quiz_scene.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([chooseLanguageScene, wordQuizScene]);

bot.use(session());
bot.use(stage.middleware());

bot.command("start", ctx => {
    return ctx.scene.enter('CHOOSE_LANGUAGE_SCENE_ID');
});

bot.command("language", ctx => {
    return ctx.scene.enter('CHOOSE_LANGUAGE_SCENE_ID', { direct_command: true });
});

bot.command('word', (ctx) => ctx.scene.enter('WORD_QUIZ_SCENE_ID'));
bot.hears('word', (ctx) => ctx.scene.enter('WORD_QUIZ_SCENE_ID'));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));