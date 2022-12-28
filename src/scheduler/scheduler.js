import scheduler from 'node-schedule';

import log from '../logger/logger.js';
import * as db from '../database/database.js';

const jobId = 'MORNING_JOB_ID_SERVER';
const messages = [
    'Псс, не хочешь потренировать польский? Новое слово уже ждёт тебя',
    'Эй, как насчёт потренить польский? Удели 5 минут',
    'Повторение - мать учения. Не желаешь повторить польский?',
    'Daily Polish на связи. Забегай на тренировку!',
    'Припрятали для тебя несколько словечек. Ждём на тренеровке. Не пропускай!',
];

export function bootstrap(bot) {
    scheduleJob(jobId, bot);
}

export function shutdown() {
    cancelJob(jobId);
    return scheduler.gracefulShutdown();
}

function scheduleJob(jobId, bot) {
    if (scheduler.scheduledJobs[jobId]) {
        log.debug(`Tried to schedule job ${jobId} when it's already scheduled. Skipping...`);
        return;
    }
    log.debug(`Scheduled job ${jobId}`);
    const rule = new scheduler.RecurrenceRule();
    rule.hour = 9;
    rule.minute = 0;
    rule.tz = 'Europe/Warsaw';
    
    // const rule = '*/1 * * * *';
    const job = scheduler.scheduleJob(jobId, rule, async () => {
        sendNewWordJob(jobId, bot);
    });
}

async function sendNewWordJob(jobId, bot) {
    log.debug('Running job: ' + jobId);

    const getActiveTrainings = await db.getActiveTrainings();
    const trainings = getActiveTrainings.rows;
    log.debug(`Trainings to send: ${trainings.length}`);

    for (let training of trainings) {
        const tgId = training.tg_id;
        const line1 = messages[Math.floor(Math.random() * messages.length)];
        const line2 = 'Готов? Выбирай тренировку:'; // TODO /training
        const line3 = '/word - квиз с вариантами ответа';
        const line4 = '/write - хардкор, переводу нужно написать самому';
        const message = `${line1}\n\n${line2}\n${line3}\n${line4}`;
        bot.telegram.sendMessage(tgId, message);
        log.debug(`Sending message to ${tgId} from scheduler`);
    }
}

function cancelJob(jobId) {
    const job = scheduler.scheduledJobs[jobId];
    if (job) {
        job.cancel();
        log.debug(`Job cancelled: ${job} for ${jobId}`);
    } else {
        log.debug(`Tried to cancel job that is not scheduled: ${job} (${jobId})`);
    }
}