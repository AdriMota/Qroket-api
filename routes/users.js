import express, { Router } from "express";
import User from "../models/user.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import bcrypt from 'bcrypt';
import { checkPermissions, loadRessourceFromParamsMiddleware } from "../lib/utils.js";

const router = express.Router();


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
router.patch('/:id', authenticate, loadRessourceFromParamsMiddleware(User), checkPermissions, asyncHandler(async (req, res, next) => {
  const user = req.ressource;

  if (req.body.firstname !== undefined) {
    user.firstname = req.body.firstname;
  }

  if (req.body.lastname !== undefined) {
    user.lastname = req.body.lastname;
  }

  if (req.body.email !== undefined) {
    user.email = req.body.email;
  }

  if (req.body.password !== undefined) {
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    user.password = passwordHash;
  }

  // ????????????????????????????????????????????????????????????????????????
  // PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE
  // ????????????????????????????????????????????????????????????????????????

  await user.save();
  res.status(200).send(user);

}));


/* ---------------------------------------------------------------
    SUPPRIMER UN UTILISATEUR
--------------------------------------------------------------- */
router.delete('/:id', authenticate, loadRessourceFromParamsMiddleware(User), checkPermissions, asyncHandler(async (req, res, next) => {
  const user = req.ressource;
  
  await User.deleteOne({
    _id: req.params.id
  });

  const email = user.email;
  res.status(200).send({user: email, status: 'deleted'});

}));


export default router;