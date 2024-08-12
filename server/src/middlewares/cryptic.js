import Control from '../models/settings.js'

export default async function eventActive(req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/login');
        }

        const control = await Control.findOne();

        if (control.registrations) {
            return res.redirect('/team');
        }

        if (!control.eventActive && !control.stats) {
            return res.render('timer');
        }

        req.stats = control.stats;
        return next();
    } catch (error) {
        console.error('Error in eventActive middleware:', error);
        return res.status(500).send('Internal Server Error');
    }
}
