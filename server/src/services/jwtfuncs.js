import jwt from 'jsonwebtoken';
import User from '../models/user';

export function setUser(data) {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'notaverygoodsecret', { expiresIn: '2h' });
    } catch (err) {
        console.error('Token signing for user failed:', err);
        return null;
    }
}

export function getUser(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notaverygoodsecret');
        return decoded;
    } catch (err) {
        const user = User.findById(decoded._id);
        user.loggedIn = false;
        user.save();  //To be tested, please remind me if i have not removed this comment
        console.error('Token verification for user failed:', err);
        return null;
    }
}

export function setAdmin(data) {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'notaverygoodsecret');
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
