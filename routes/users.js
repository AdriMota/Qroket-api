import express, { Router } from "express";
import User from "../models/user.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';


const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;


/* ---------------------------------------------------------------
    AJOUTER UN UTILISATEUR
--------------------------------------------------------------- */
router.post("/", asyncHandler(async (req, res, next) => {
  const passwordHash = await bcrypt.hash(req.body.password, 10);

  // Create a new document from the JSON in the request body 
  const newUser = new User(req.body);
  newUser.password = passwordHash;

  // Save that document
  await newUser.save();

  // Send the saved document in the response
  res.status(201).send(newUser);

  // ????????????????????????????????????????????????????????????????????????
  // NE PAS AJOUTER UN ADMIN  NE PAS AJOUTER UN ADMIN NE PAS AJOUTER UN ADMIN
  // ????????????????????????????????????????????????????????????????????????
}));


/* ---------------------------------------------------------------
    RECUPERER LES UTILISATEURS
--------------------------------------------------------------- */
router.get("/", authenticate, checkPermissions, asyncHandler(async (req, res, next) => {
  let users = User.find({});

  users = await users.exec();

  // Send the saved document in the response
  res.send(users);
}));


/* ---------------------------------------------------------------
    METTRE A JOUR UN UTILISATEUR
--------------------------------------------------------------- */
router.patch('/:id', authenticate, loadUserFromParamsMiddleware, checkPermissions, asyncHandler(async (req, res, next) => {
  if (req.body.firstname !== undefined) {
    req.user.firstname = req.body.firstname;
  }

  if (req.body.lastname !== undefined) {
    req.user.lastname = req.body.lastname;
  }

  if (req.body.email !== undefined) {
    req.user.email = req.body.email;
  }

  if (req.body.password !== undefined) {
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    req.user.password = passwordHash;
  }

  // ????????????????????????????????????????????????????????????????????????
  // PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE
  // ????????????????????????????????????????????????????????????????????????

  await req.user.save();
  res.status(200).send(req.user);

}));


/* ---------------------------------------------------------------
    SUPPRIMER UN UTILISATEUR
--------------------------------------------------------------- */
router.delete('/:id', authenticate, loadUserFromParamsMiddleware, checkPermissions, asyncHandler(async (req, res, next) => {
  await User.deleteOne({
    _id: req.params.id
  });

  const email = req.user.email;
  res.status(200).send({user: email, status: 'deleted'});

}));


/* ---------------------------------------------------------------
    UTILISATEUR EXISTANT
--------------------------------------------------------------- */
async function loadUserFromParamsMiddleware(req, res, next) {
  const userId = req.params.id;

  if (!ObjectId.isValid(userId)) {
    return userNotFound(res, userId);
  }

  const user = await User.findById(req.params.id);
  if (!user) { 
    return userNotFound(res, userId) 
  }

  req.user = user;
  next();
}

function userNotFound(res, userId) {
  return res.status(404).type('text').send(`Aucun utilisateur avec l'ID ${userId} trouvé.`);
}


/* ---------------------------------------------------------------
    PERMISSIONS UTILISATEUR
--------------------------------------------------------------- */
function checkPermissions(req, res, next) {
  const authorized = req.role === 'admin' || req.userId.toString() === req.user.id;
  if (!authorized) {
    return res.status(403).send("Tu n'as pas les droits :/")
  }
  next();
}


export default router;