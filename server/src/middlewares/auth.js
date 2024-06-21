import { getUser } from '../services/jwtfuncs.js';

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

export default checkAuth;
