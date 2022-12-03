import { Scenes, Markup } from 'telegraf';

const chooseLanguageScene = new Scenes.BaseScene('CHOOSE_LANGUAGE_SCENE_ID');

chooseLanguageScene.enter((ctx) => {
    ctx.session.myData = {};
    ctx.reply('What language you prefer?', Markup.inlineKeyboard([
        Markup.button.callback('English', "ENGLISH_ACTION"),
        Markup.button.callback('Russian', "RUSSIAN_ACTION"),
    ]));
});

chooseLanguageScene.action("ENGLISH_ACTION", (ctx) => {
    ctx.editMessageReplyMarkup();
    ctx.editMessageText('Ok, English. Noted. Great!');
    ctx.session.myData.preferredLanguage = 'English';
    if (ctx.scene.state.direct_command == true) {
        return ctx.scene.leave();
    } else {
        return ctx.scene.enter('WORD_QUIZ_SCENE_ID');
    }
});

chooseLanguageScene.action("RUSSIAN_ACTION", (ctx) => {
    ctx.editMessageReplyMarkup();
    ctx.editMessageText('Ok, Russian. Noted. Great!');
    ctx.session.myData.preferredLanguage = 'Russian';
    if (ctx.scene.state.direct_command == true) {
        return ctx.scene.leave();
    } else {
        return ctx.scene.enter('WORD_QUIZ_SCENE_ID');
    }
});

chooseLanguageScene.use((ctx) => ctx.replyWithMarkdownV2('Please choose either English or Russian'));

export default chooseLanguageScene;