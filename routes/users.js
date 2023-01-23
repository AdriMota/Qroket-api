import express, { Router } from "express";
import User from "../models/user.js";
import Animal from "../models/animal.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import bcrypt from 'bcrypt';
import { checkPermissions, loadRessourceFromParamsMiddleware, compare } from "../lib/utils.js";
import mongoose from 'mongoose';
import { broadcastAdminMessage } from '../ws.js';
import { upload } from "../lib/loadImage.js";
import fs from "fs";


const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;


/**
 * @api {post} /users Create a user
 * @apiName CreateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Registers a new user.
 * Firstname, lastname, email, password properties are required.
 *
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 *
 * @apiExample Example
 *     POST /users HTTP/1.1
 *     Content-Type: application/json
 * 
 *     {
 *        "firstname": "Jack",
 *        "lastname": "Sparrow",
 *        "phone": "0041780000000",
 *        "email": "jack@sparrow.com",
 *        "role": "user",
 *        "password": "password",
 *        "location": "63725379e0cac34a8803fdcc"
 *    }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://https://qroket-api.onrender.com/users/
 *
 *     {
 *        "firstname": "Jack",
 *        "lastname": "Sparrow",
 *        "phone": "0041780000000",
 *        "email": "jack@sparrow.com",
 *        "role": "user",
 *        "location": "63725379e0cac34a8803fdcc"
 *        "id": "637a63006839a2f609eba864",
 *    }
 */
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
    await newUser.save();

    // Send the saved document in the response
    res.status(200).send(newUser);

    if (newUser.role === "admin") {
      // BroadcastMessage pour les administrateurs seulement.
      broadcastAdminMessage({ event: "New admin added : ", user: newUser });
    }
  }

}));


/**
 * @api {patch} /users/:id/picture Add a picture to an user
 * @apiName AddPictureUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Add one picture to an user.
 * Firstname, lastname, email, password properties are required.
 * @apiParam {id} id User id
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     PATCH /users/637a63006839a2f609eba864/picture HTTP/1.1
 *     Content-Type: application/octet-stream
 *
 *     {
 *          pictures: "User.jpg",
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *        "firstname": "Jack",
 *        "lastname": "Sparrow",
 *        "phone": "0041780000000",
 *        "email": "jack@sparrow.com",
 *        "role": "user",
 *        "picture": {
 *          "name": "qroket_1668962510362-137621094.jpg",
 *          "data": {
 *            "type": "Buffer",
 *            "data": [
 *              113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 54, 50, 45, 49, 51, 55, 54, 50, 49, 48, 57, 52, 46, 106, 112, 103
 *            ]
 *          },
 *          "contentType": "image/jpg",
 *          "_id": "637a58ce1bbe9bf3795c84e6"
 *        }
 *        "location": "63725379e0cac34a8803fdcc"
 *        "id": "637a63006839a2f609eba864",
 *    }
 * 
 * 
 */
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
    RÉCUPERER UNE IMAGE D'UN UTILISATEUR
--------------------------------------------------------------- */
router.get("/:id/picture", loadRessourceFromParamsMiddleware(User), asyncHandler(async (req, res, next) => {
  const user = req.ressource;

  if (!user.picture) {
    res.status(404).send({ message: "Image not found" });
    return;
  }

  // res.set("Content-Type", user.picture.contentType);
  res.status(200).send(user.picture);
}));


/**
 * @api {get} /users Retrieve users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieves users.
 *
 * @apiUse UserInResponseBody
 *
 * @apiExample Example
 *     GET /users HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *    {
 *      "page": 1,
 *      "pageSize": 100,
 *      "total": 2,
 *      "data": [
 *        {
 *          "firstname": "Jack",
 *          "lastname": "Sparrow",
 *          "phone": "0041780000000",
 *          "email": "jack@sparrow.com",
 *          "role": "user",
 *          "location": "63725379e0cac34a8803fdcc"
 *          "id": "637a63006839a2f609eba864",
 *        },
 *        {
 *          "firstname": "Angelina",
 *          "lastname": "Jolie",
 *          "phone": "0041790000000",
 *          "email": "angelina@jolie.com",
 *          "role": "user",
 *          "location": "63725379e0cac34a8803fdcc"
 *          "id": "637a63006839a2f609eba248",
 *        }
 *      ]
 *    } 
 *   
 */
/* ---------------------------------------------------------------
    RECUPERER LES UTILISATEURS
--------------------------------------------------------------- */
router.get("/", authenticate, asyncHandler(async (req, res, next) => {
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

  query.sort(compare);

  // Send the saved document in the response
  res.status(200).send({
    page: page,
    pageSize: pageSize,
    total: total,
    data: query
  });

}));


/**
 * @api {get} /users/:id Retrieve a user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one user.
 * @apiParam {id} id User id
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInResponseBody
 * @apiUse UserIncludes
 * @apiUse UserNotFoundError
 * @apiUse Pagination
 *
 * @apiExample Example
 *     GET /users/637a63006839a2f609eba864 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *        "_id": "637a63006839a2f609eba864",
 *        "firstname": "Jack",
 *        "lastname": "Sparrow",
 *        "phone": 41780000000,
 *        "email": "jack@sparrow.com",
 *        "role": "user",
 *        "picture": {
 *          "name": "qroket_1668965478181-477686067.jpg",
 *          "data": "cXJva2V0XzE2Njg5NjU0NzgxODEtNDc3Njg2MDY3LmpwZw==",
 *          "contentType": "image/jpg"
 *        },
 *        "location": "63725379e0cac34a8803fdcc",
 *        "animal": 0
 *      }
 */
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

/**
 * @api {patch} /users/:id Partially update an user
 * @apiName PartiallyUpdateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Partially updates user's data (only the properties found in the request body will be updated).
 * @apiParam {id} id User id
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     PATCH /users/637a63006839a2f609eba864 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *          "firstname": "Jackline"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *        "_id": "637a63006839a2f609eba864",
 *        "firstname": "Jackeline",
 *        "lastname": "Sparrow",
 *        "phone": 41780000000,
 *        "email": "jack@sparrow.com",
 *        "role": "user",
 *        "picture": {
 *          "name": "qroket_1668965478181-477686067.jpg",
 *          "data": "cXJva2V0XzE2Njg5NjU0NzgxODEtNDc3Njg2MDY3LmpwZw==",
 *          "contentType": "image/jpg"
 *        },
 *        "location": "63725379e0cac34a8803fdcc",
 *        "animal": 0
 *      }
 */
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
      return res.status(403).send("Tu n'as pas les droits pour changer de rôle :/")
    }
  }

  if (req.body.password !== undefined) {
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    user.password = passwordHash;
  }

  // NE FONCTIONNE PAS MAIS ON S'EST DIT QU'IL Y AVAIT DEJA LE PATCH PICTURE
  /* if (req.body.picture !== undefined) {
    const filePath = new URL(`../uploads/${user.picture.name}`, import.meta.url)
    fs.access(filePath, (err) => {
      if (!err) fs.unlinkSync(filePath)
    })
  } */

  await user.save();
  res.status(200).send(user);

  if (req.body.role !== undefined && req.role === "admin") {
    // BroadcastMessage pour les administrateurs seulement.
    broadcastAdminMessage({ event: "Role changed, new admin : ", user: user });
  }
}));


/**
 * @api {delete} /users/:id Delete an user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes an user.
 * @apiParam {id} id User id
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     DELETE /users/637a63006839a2f609eba864 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "user": "jack@sparrow.com",
 *          "status": "deleted"
 * 
 *     }
 */
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


/**
 * @apiDefine UserIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the user to retrieve
 */

/**
 * @apiDefine UserInRequestBody
 * @apiBody (Request body) {String} firstname The firstname of the user
 * @apiBody (Request body) {String} lastname The lastname of the user
 * @apiBody (Request body) {Number} phone The cell phone of the user
 * @apiBody (Request body) {String} email The email of the user
 * @apiBody (Request body) {String} role Describe the role of the user
 * @apiBody (Request body) {String} password The password of the user
 * @apiBody (Request body) {String} location The id of the location of the user
 */

/**
 * @apiDefine UserInResponseBody
 * @apiSuccess (Request body) {String} firstname The firstname of the user
 * @apiSuccess (Request body) {String} lastname The lastname of the user
 * @apiSuccess (Request body) {Number} phone The cell phone of the user
 * @apiSuccess (Request body) {String} email The email of the user
 * @apiSuccess (Request body) {String} role Describe the role of the user
 * @apiSuccess (Request body) {Object} picture The name, data, content-type and id of the picture of the user
 * @apiSuccess (Request body) {String} location The id of the location of the user
 * @apiSuccess (Request body) {String} id The id of the user
 */

/**
 * @apiDefine Pagination
 */

/**
 * @apiDefine UserIncludes
 * @apiQuery (URL query parameters) {String} id The unique identifier of the User
 */

/**
 * @apiDefine UserNotFoundError
 *
 * @apiError {Object} 404/NotFound No user was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     Aucun ressource avec l'ID 63725379e0cac34a8803fass trouvée.
 */


export default router;