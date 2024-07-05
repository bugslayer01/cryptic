import Control from '../models/settings.js'

export default async function eventActive(req, res, next) {
    const control = await Control.findOne();
    if(!control.eventActive){
        return res.render('timer');
    }
    return next();
}