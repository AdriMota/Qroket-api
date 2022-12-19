import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import * as config from "../config.js";

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(401).send('Bad login');
      return;
    }

    const password = req.body.password;
    const passwordHash = user.password;
    const userRole = user.role;
    const subject = user._id;
    const email = user.email;
    const expiresIn = '7 days';
    const valid = await bcrypt.compare(password, passwordHash);

    if (valid) {
      jwt.sign({ sub: subject, userRole }, process.env.JWT_SECRET, { expiresIn }, (err, token) => {
        if (err) {
          next(err);
        } else {
          res.send({ email, token });
        }
      });
    } else {
      res.status(401).send('Bad login');
    }
  } catch (err) {
    next(err);
  }
});

export function authenticate(req, res, next) {
  const authorizationHeader = req.get('Authorization');
  if (!authorizationHeader) {
    return res.sendStatus(401);
  }

  const match = authorizationHeader.match(/^Bearer (.+)/);
  if (!match) {
    return res.sendStatus(401);
  }

  const bearerToken = match[1];
  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.sendStatus(401);
    }

    req.userId = payload.sub;
    req.role = payload.userRole;
    next();
  });
}

export function tokenToUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return User.findById(payload.sub);
  } catch (err) {
    return null;
  }
}

export default router;