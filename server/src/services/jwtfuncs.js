import jwt from 'jsonwebtoken'

export async function setUser(data) {
    return jwt.sign(
        data,
        process.env.secret || 'notaverygoodsecret',
        { expiresIn: process.env.expiryTime | '1h' });
}

export async function getUser(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }
    try {
        return jwt.verify(token, process.env.secret || 'notaverygoodsecret');
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
}