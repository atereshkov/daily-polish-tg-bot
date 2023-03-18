import { createLogger, format, transports } from 'winston';
import TelegramLogger from 'winston-telegram';

import * as dotenv from 'dotenv';
dotenv.config()

// import Logtail from '@logtail/node';
// import LogtailTransport from '@logtail/winston';

// const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
 
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
        // new LogtailTransport(logtail), // Add Logtail logger transport
        new TelegramLogger({
            token: process.env.TG_LOG_BOT_TOKEN,
            chatId: process.env.TG_LOG_CHAT_ID,
            level: 'info',
            unique: true
        })
    ],
});

export default logger;