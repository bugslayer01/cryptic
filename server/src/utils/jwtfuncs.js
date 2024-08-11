import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export function setUser(data) {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'notaverygoodsecret', { expiresIn: '3h' });
    } catch (err) {
        console.error('Token signing for user failed:', err);
        return null;
    }
}

export async function getUser(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notaverygoodsecret');
        return decoded;
    } catch (err) {
        const decoded = jwt.decode(token);
        const user = await User.findById(decoded._id);
        if (!user) {
            console.log('User not found in database');
            return null;
        }
        user.loggedIn = false;
        await user.save();
        console.error('Token verification for user failed:', err);
        return null;
    }
}

export function setAdmin(data) {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'notaverygoodsecret', { expiresIn: '1h' });
    } catch (err) {
        console.error('Token signing for admin failed:', err);
        return null;
    }
}

export function getAdmin(pelican) {
    if (!pelican || typeof pelican !== 'string') {
        return null;
    }

    try {
        return jwt.verify(pelican, process.env.JWT_SECRET || 'notaverygoodsecret');
    } catch (err) {
        console.error('Token verification for admin failed:', err);
        return null;
    }
}

export function setSuperUser(data) {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'notaverygoodsecret', { expiresIn: '1m' });
    } catch (err) {
        console.error('Token signing for super user failed:', err);
        return null;
    }
}

export function getSuperUser(titan) {
    if (!titan || typeof titan !== 'string') {
        return null;
    }

    try {
        return jwt.verify(titan, process.env.JWT_SECRET || 'notaverygoodsecret');
    } catch (err) {
        console.error('Token verification for super user failed:', err);
        return null;
    }
}
