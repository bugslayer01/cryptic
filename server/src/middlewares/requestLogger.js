// //Don't run any tests yet

// import {existsSync, mkdir} from 'fs';
// import fs from 'fs/promises';
// import path from 'path';
// import Control from '../models/settings.js';
// import { fileURLToPath } from "url";
// import getISTDateString from '../utils/getDate.js';
// import { log } from 'console';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const logDirectoryPath = path.join(__dirname, '../logs');
// const logFilePath = path.join(__dirname, '../logs/request.log');
// let logMessage = '';
// let requestCount = 0;
// const BATCH_SIZE = 500; //Change it to 500 or higher number later to reduce latency
// let totalRequests = 0;

// async function initializeTotalRequests() {
//     try {
//         const control = await Control.findOne();
//         if (control) {
//             totalRequests = control.totalRequests;
//         }
//     } catch (error) {
//         console.error('Error initializing total requests:', error);
//     }
// }

// initializeTotalRequests();

// async function updateTotalRequests(logMessage) {
//     try {
//         fs.appendFile(logFilePath, logMessage).catch((err) => {
//             console.error('Error writing to request log file:', err);
//         });
//         const control = await Control.findOneAndUpdate(
//             {},
//             { $inc: { totalRequests: requestCount } },
//             { new: true, upsert: true }
//         );
//         totalRequests = control.totalRequests;
//     } catch (error) {
//         console.error('Error updating request count:', error);
//     }
// }

// async function ensureLogFileExists() {
//     if (!existsSync(logDirectoryPath)) {
//         mkdir(logDirectoryPath, { recursive: true }, (err) => {
//             if (err) {
//                 console.error('Error creating directory:', err);
//                 return;
//             }
//         })
//     }

//     try {
//         await fs.access(logFilePath);
//     } catch (error) {
//         try {
//             await fs.writeFile(logFilePath, '');
//             console.log(`Created log file: ${logFilePath}`);
//         } catch (err) {
//             console.error('Error creating log file:', err);
//         }
//     }
// }

// ensureLogFileExists();

// export default async function requestLogger(req, res, next) {
//     requestCount += 1;
//     totalRequests += 1;

//     const currentMessage = `${getISTDateString()} | ${totalRequests} | ${req.method} ${req.url} \n`;
//     logMessage += currentMessage;
//     console.log(currentMessage)

//     if (requestCount >= BATCH_SIZE) {
//         await updateTotalRequests(logMessage);
//         requestCount = 0;
//         logMessage = '';
//     }

//     return next();
// }








// import { createLogger, format, transports } from 'winston';
// const { combine, timestamp, printf, colorize } = format;

// const customFormat = printf(({ level, message, timestamp }) => {
//     return `${timestamp} ${level}: ${message}`;
// });

// const logger = createLogger({
//     level: 'info', 
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
//         new transports.File({ filename: 'logs/error.log', level: 'error' }),
//         new transports.File({ filename: 'logs/combined.log' })
//     ]
// });

// logger.info('This is an info log');
// logger.error('This is an error log');









// import logger from '../utils/logger.js';
// import getISTDateString from '../utils/getDate.js'; 

// const requestLogger = (req, res, next) => {
//     const start = Date.now();

//     res.on('finish', () => {
//         const duration = Date.now() - start;
//         const logMessage = `${getISTDateString()} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`;
        
//         if (res.statusCode >= 400) {
//             logger.error(logMessage);
//         } else {
//             logger.info(logMessage);
//         }
//     });

//     next();
// };

// export default requestLogger;
