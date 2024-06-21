import jwt from 'jsonwebtoken';

export function setUser(data) {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'notaverygoodsecret');
    } catch (err) {
        console.error('Token signing failed:', err);
        return null;
    }
}

export function getUser(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'notaverygoodsecret');
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
}
