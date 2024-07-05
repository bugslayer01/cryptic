import Control from '../models/settings.js'

export default async function regActive(req, res, next) {
    const control = await Control.findOne();
    if(!control.registrations){
        return res.render('regClosed');
    }
    return next();
}