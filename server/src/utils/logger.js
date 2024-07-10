// // src/utils/logger.js
// import { createLogger, format, transports } from 'winston';
// import 'winston-daily-rotate-file';

// const { combine, timestamp, printf, colorize } = format;

// const customFormat = printf(({ level, message, timestamp }) => {
//     return `${timestamp} ${level}: ${message}`;
// });

// const logger = createLogger({
//     level: 'info', // Minimum level to log
//     format: combine(
//         timestamp(),
//         customFormat
//     ),
//     transports: [
//         new transports.Console({
//             format: combine(
//                 colorize(),
//                 customFormat
//             )
//         }),
//         new transports.DailyRotateFile({
//             filename: 'logs/application-%DATE%.log',
//             datePattern: 'YYYY-MM-DD',
//             maxFiles: '14d' // Keep logs for 14 days
//         }),
//         new transports.File({ filename: 'logs/error.log', level: 'error' }),
//         new transports.File({ filename: 'logs/combined.log' })
//     ]
// });

// export default logger;
