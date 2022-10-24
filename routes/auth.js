import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import * as config from "../config.js";

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(401).send('Bad login');
      return;
    }

    const password = req.body.password;
    const passwordHash = user.passwordHash;
    const valid = await bcrypt.compare(password, passwordHash);
    if (valid) {
      const subject = user._id;
      const expiresIn = '7 jours';
      jwt.sign({ sub: subject }, config.jwtSecret, { expiresIn }, (err, token) => {
        if (err) {
          next(err);
        } else {
          res.send({ token });
        }
      });
    } else {
      res.status(401).send('Mauvais login');
    }
  } catch (err) {
    next(err);
  }
});

export default router;

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
  jwt.verify(bearerToken, config.jwtSecret, (err, payload) => {
    if (err) {
      return res.sendStatus(401);
    }

    req.userId = payload.sub;
    next();
  });
}