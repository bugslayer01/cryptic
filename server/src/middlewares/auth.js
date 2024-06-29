import { getUser, getAdmin, getSuperUser } from '../utils/jwtfuncs.js';

export async function checkAuth(req, res, next) {

  const token = req.cookies?.token;
  if (!token) {

    req.user = null;
    return next();
  }

  const user = await getUser(token);

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

export function checkSuperUser(req, res, next) {

  const titan = req.cookies?.titan;
  if (!titan) {

    req.superuser = null;
    return next();
  }

  const superuser = getSuperUser(titan);

  req.superuser = superuser;

  return next();
}
