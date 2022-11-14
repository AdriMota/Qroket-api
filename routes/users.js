import express, { Router } from "express";
import User from "../models/user.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import bcrypt from 'bcrypt';

const router = express.Router();


/* ---------------------------------------------------------------
    SE CONNECTER
--------------------------------------------------------------- */
router.get("/", authenticate, asyncHandler(async (req, res, next) => {
  if (req.role.includes("admin")) {
    // Is admin
    User.find().sort('firstname').exec(function (err, users) {            // ON FAIT DES CHOSES À DOUBLE
      res.send(users);
    });
  }
  else {
    // Is not admin
    return res.status(403).send("Tu n'as pas les droits :/ !")
  }
}));

/* router.get("/", authenticate, function (req, res, next) {
  if (req.role.includes("admin")) {
    // Is admin
    User.find().sort('firstname').exec(function (err, users) {

      if (err) {
        return next(err);
      }

      res.send(users);
    });
  }
  else {
    // Is not admin
    return res.status(403).send("Tu n'as pas les droits :/ !")
  }
}); */


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
}));

  /* // router.post("/", function (req, res, next) {
    // Create a new document from the JSON in the request body 
    const newUser = new User(req.body);

    // Save that document
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }
  
      // Send the saved document in the response
      res.send(savedUser);
    });
  }); */


/* ---------------------------------------------------------------
    RECUPERER LES UTILISATEURS
--------------------------------------------------------------- */
// router.get("/", asyncHandler(async (req, res, next) => {
//   const users = User.find();

//   users = await users.exec();

//   // Send the saved document in the response
//   res.send(users);
// }));

/* router.get("/", function (req, res, next) {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);

  // Save that document
  newUser.save(function (err, savedUser) {
    if (err) {
      return next(err);
    }

    // Send the saved document in the response
    res.send(savedUser);
  });
}); */


/* ---------------------------------------------------------------
    METTRE A JOUR UN UTILISATEUR
--------------------------------------------------------------- */
router.patch('/:id', authenticate, loadUserFromParamsMiddleware, checkPermissions, asyncHandler(async (req, res, next) => {
  if (req.role.includes("admin")) {
    // Is admin      
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
  }
  else {
    // Is not admin
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
    /* ???????????????????????????????? */
  }

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
    UTILISATEUR CONNECTE
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
  const authorized = req.currentUserPermissions === 'admin' || req.user.id.toString() === req.currentUserId;
  if (!authorized) {
    return res.status(403).send("Tu n'as pas les droits :/")
  }

  next();
}


export default router;