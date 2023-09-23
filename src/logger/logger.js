import { createLogger, format, transports } from 'winston';

import TelegramLogger from 'winston-telegram';
 
const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
 
const logger = createLogger({
    levels: logLevels,
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console({ level: 'trace' }), // Regular console
        new TelegramLogger({
            token: process.env.TG_LOG_BOT_TOKEN,
            chatId: process.env.TG_LOG_CHAT_ID,
            level: 'info',
            unique: true
        })
    ],
});

export default logger;