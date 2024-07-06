//Don't run any tests yet

import {existsSync, mkdir} from 'fs';
import fs from 'fs/promises';
import path from 'path';
import Control from '../models/settings.js';
import { fileURLToPath } from "url";
import getISTDateString from '../utils/getDate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirectoryPath = path.join(__dirname, '../logs');
const logFilePath = path.join(__dirname, '../logs/request.log');
let requestCount = 0;
const BATCH_SIZE = 500;
let totalRequests = 0;

async function initializeTotalRequests() {
    try {
        const control = await Control.findOne();
        if (control) {
            totalRequests = control.totalRequests;
        }
    } catch (error) {
        console.error('Error initializing total requests:', error);
    }
}

initializeTotalRequests();

async function updateTotalRequests() {
    try {
        const control = await Control.findOneAndUpdate(
            {},
            { $inc: { totalRequests: requestCount } },
            { new: true, upsert: true }
        );
        totalRequests = control.totalRequests;
    } catch (error) {
        console.error('Error updating request count:', error);
    }
}

async function ensureLogFileExists() {
    if (!existsSync(logDirectoryPath)) {
        mkdir(logDirectoryPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
                return;
            }
        })
    }

    try {
        await fs.access(logFilePath);
    } catch (error) {
        try {
            await fs.writeFile(logFilePath, '');
            console.log(`Created log file: ${logFilePath}`);
        } catch (err) {
            console.error('Error creating log file:', err);
        }
    }
}

ensureLogFileExists();

export default async function requestLogger(req, res, next) {
    requestCount += 1;
    totalRequests += 1;

    const logMessage = `${getISTDateString()} | ${totalRequests} | ${req.method} ${req.url}\n`;
    console.log(logMessage)
    fs.appendFile(logFilePath, logMessage).catch((err) => {
        console.error('Error writing to request log file:', err);
    });

    if (requestCount >= BATCH_SIZE) {
        await updateTotalRequests();
        requestCount = 0;
    }

    return next();
}
