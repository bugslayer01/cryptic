import { google } from 'googleapis';
import dotenv from 'dotenv';
import getISTDateString from '../utils/getDate.js';

dotenv.config();

const googlejson = {
    "type": "service_account",
    "project_id": "mlsc-website",
    "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
    "private_key": process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.GOOGLE_CLIENT_EMAIL,
    "client_id": process.env.GOOGLE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.GOOGLE_CLIENT_CERT_URL,
    "universe_domain": "googleapis.com"
};

const auth = new google.auth.GoogleAuth({
    credentials: googlejson,
    scopes: ['https://www.googleapis.com/auth/documents']
});

async function writeGoogleDocs(documentId, requests) {
    try {
        const docs = google.docs({ version: 'v1', auth });

        const writer = await docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests
            }
        });
        return writer;
    } catch (error) {
        console.error('error', error);
    }
}

const logBatch = [];
const logBatchAll = [];
let requestCount = 0;
const BATCH_SIZE = 700;

function getRequestsArray(date, method, path, ip) {
    const requests = [
        {
            insertText: {
                location: { index: 1 },
                text: `${date} | ${method} ${path} | ${ip} \n`
            }
        },
        {
            updateTextStyle: {
                range: {
                    startIndex: 1,
                    endIndex: date.length + 1
                },
                textStyle: {
                    foregroundColor: {
                        color: {
                            rgbColor: { red: 0.5, green: 0.0, blue: 0.5 } 
                        }
                    }
                },
                fields: 'foregroundColor'
            }
        },
        {
            updateTextStyle: {
                range: {
                    startIndex: date.length + 4,
                    endIndex: date.length + 4 + method.length
                },
                textStyle: {
                    foregroundColor: {
                        color: {
                            rgbColor: { red: 1.0, green: 0.65, blue: 0.0 } 
                        }
                    }
                },
                fields: 'foregroundColor'
            }
        },
        {
            updateTextStyle: {
                range: {
                    startIndex: date.length + 5 + method.length,
                    endIndex: date.length + 5 + method.length + path.length
                },
                textStyle: {
                    foregroundColor: {
                        color: {
                            rgbColor: { red: 0.0, green: 0.5, blue: 0.5 } 
                        }
                    }
                },
                fields: 'foregroundColor'
            }
        },
        {
            updateTextStyle: {
                range: {
                    startIndex: date.length + 8 + method.length + path.length,
                    endIndex: date.length + 8 + method.length + path.length + ip.length
                },
                textStyle: {
                    foregroundColor: {
                        color: {
                            rgbColor: { red: 0.68, green: 0.85, blue: 0.9 }
                        }
                    }
                },
                fields: 'foregroundColor'
            }
        }
    ];
    return requests
}

async function logUrl(req) {
    const assetExtensions = ['.css', '.js', '.mp4', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.otf'];
    const url = req.url.toLowerCase();

    const isAsset = assetExtensions.some(extension => url.endsWith(extension));

    if (!isAsset) {
        const date = getISTDateString();
        const method = req.method;
        const path = req.url;
        const ip = req.headers['do-connecting-ip'] || req.connection.remoteAddress;

        const requests = getRequestsArray(date, method, path, ip);
        logBatch.push(...requests);
        requestCount++;

        if (requestCount >= BATCH_SIZE) {
            await writeGoogleDocs(process.env.documentId, logBatch.splice(0, logBatch.length));
            await writeGoogleDocs(process.env.documentId2, logBatchAll.splice(0, logBatchAll.length));
            requestCount = 0;
        }
    }
}

function logAll(req) {
    const date = getISTDateString();
    const method = req.method;
    const path = req.url;
    const ip = req.headers['do-connecting-ip'] || req.connection.remoteAddress;

    const requests = getRequestsArray(date, method, path, ip);
    logBatchAll.push(...requests);
}

export default async function requestLogger(req, res, next) {
    logAll(req);
    await logUrl(req);
    next();
}
