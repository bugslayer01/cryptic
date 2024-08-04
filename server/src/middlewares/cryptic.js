import Control from '../models/settings.js'

export default async function eventActive(_, res, next) {
    const control = await Control.findOne();
    if(control.registrations){
        return res.redirect('/team');
    }
    if(!control.eventActive){
        return res.render('timer');
    }
    return next();
}