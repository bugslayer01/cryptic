import Control from '../models/settings.js'

export default async function eventActive(req, res, next) {
    const control = await Control.findOne();
    if(control.registrations){
        return res.redirect('/team');
    }
    if(!control.eventActive && !control.stats){
            return res.render('timer');
    }
    req.stats = control.stats;
    return next();
}