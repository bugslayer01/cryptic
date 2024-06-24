import { getUser, getAdmin } from '../services/jwtfuncs.js';

export function checkAuth(req, res, next) {

  const token = req.cookies?.token;
  if (!token) {

    req.user = null;
    return next();
  }

  const user = getUser(token);

  req.user = user;

  return next();
}

export function checkAdmin(req, res, next) {

  const pelican = req.cookies?.pelican;
  if (!pelican) {

    req.admin = null;
    return next();
  }

  const admin = getAdmin(pelican);

  req.admin = admin;

  return next();
}
