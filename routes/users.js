import express, { Router } from "express";
import User from "../models/user.js";
import Animal from "../models/animal.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import bcrypt from 'bcrypt';
import { checkPermissions, loadRessourceFromParamsMiddleware } from "../lib/utils.js";
import mongoose from 'mongoose';
import { broadcastAdminMessage } from '../ws.js';
import { upload } from "../lib/loadImage.js";
import fs from "fs";


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

  if (req.body.role === "admin") {
    res.status(403).send("Tu n'as pas les droits pour créer des utilisateurs avec ce rôle :/")
  } else {
    // Save that document
    newUser.save();

    // Send the saved document in the response
    res.status(201).send(newUser);

    if (newUser.role === "admin") {
      // BroadcastMessage pour les administrateurs seulement.
      broadcastAdminMessage({ event: "New admin added : ", user: newUser });
    }
  }

}));


/* ---------------------------------------------------------------
    AJOUTER UNE IMAGE A UN UTILISATEUR
--------------------------------------------------------------- */
router.patch("/:id/picture", loadRessourceFromParamsMiddleware(User), asyncHandler(async (req, res, next) => {

  upload(req, res, function (err) {
    const user = req.ressource;

    user.picture = {
      name: req.file.filename,
      data: req.file.filename,
      contentType: 'image/jpg'
    }

    // Save that document
    user.save();

    // Send the saved document in the response
    res.status(201).send(user);
  });

  //if (req.fileFormatError) return res.send(req.fileFormatError);*/
}));


/* ---------------------------------------------------------------
    RECUPERER LES UTILISATEURS
--------------------------------------------------------------- */
router.get("/", authenticate, checkPermissions, asyncHandler(async (req, res, next) => {
  const total = await User.count();

  let query = User.find({});

  let page = parseInt(req.query.page, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Parse the "pageSize" param (default to 100 if invalid)
  let pageSize = parseInt(req.query.pageSize, 10);

  if (isNaN(pageSize) || pageSize < 0 || pageSize > 100) {
    pageSize = 100;
  }

  // Apply skip and limit to select the correct page of elements
  query = query.skip((page - 1) * pageSize).limit(pageSize);

  query = await query.exec();

  // Send the saved document in the response
  res.send({
    page: page,
    pageSize: pageSize,
    total: total,
    data: query
  });

}));


/* ---------------------------------------------------------------
    RECUPERER UN UTILISATEUR ET SES ANIMAUX
--------------------------------------------------------------- */
router.get('/:id', loadRessourceFromParamsMiddleware(User), asyncHandler(async (req, res, next) => {
  User.aggregate([
    {
      $match: {
        _id: ObjectId(req.params.id)

      }
    },
    {
      $lookup: {
        from: 'animals',
        localField: '_id',
        foreignField: 'user',
        as: 'animal'
      }
    },
    {
      $unwind: {
        path: '$animal',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        animal: {
          $cond: {
            if: '$animal',
            then: 1,
            else: 0
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        firstname: { $first: '$firstname' },
        lastname: { $first: '$lastname' },
        phone: { $first: '$phone' },
        email: { $first: '$email' },
        role: { $first: '$role' },
        picture: { $first: '$picture' },
        location: { $first: '$location' },
        animal: { $sum: '$animal' },
      }
    }
  ], (err, results) => {
    if (err) {
      return next(err);
    }

    res.send(results[0]);
  });
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

  if (req.body.phone !== undefined) {
    user.phone = req.body.phone;
  }

  if (req.body.email !== undefined) {
    user.email = req.body.email;
  }

  if (req.body.location !== undefined) {
    user.location = req.body.location;
  }

  if (req.body.role !== undefined) {
    if (req.role === "admin") {
      user.role = req.body.role;
    } else {
      res.status(403).send("Tu n'as pas les droits pour changer de rôle :/")
    }
  }

  if (req.body.password !== undefined) {
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    user.password = passwordHash;
  }

  await user.save();
  res.status(200).send(user);

  if (req.body.role !== undefined && req.role === "admin") {
    // BroadcastMessage pour les administrateurs seulement.
    broadcastAdminMessage({ event: "Role changed, new admin : ", user: user });
  }
}));


/* ---------------------------------------------------------------
    SUPPRIMER UN UTILISATEUR
--------------------------------------------------------------- */
router.delete('/:id', authenticate, loadRessourceFromParamsMiddleware(User), checkPermissions, asyncHandler(async (req, res, next) => {
  // Delete the animals of the user
  await Animal.deleteMany({ user: req.params.id });

  const user = req.ressource;

  // Delete image
  const filePath = new URL(`../uploads/${user.picture.name}`, import.meta.url)
  fs.access(filePath, (err) => {
    if (!err) fs.unlinkSync(filePath)
  })

  // Delete user
  await User.deleteOne({
    _id: req.params.id
  });

  const email = user.email;
  res.status(200).send({ user: email, status: 'deleted' });

}));


export default router;