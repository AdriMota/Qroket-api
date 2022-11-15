import express, { request, Router } from "express";
import Animal from "../models/animal.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import { checkPermissions, loadRessourceFromParamsMiddleware } from "../lib/utils.js";
import { broadcastMessage } from '../ws.js';

const router = express.Router();

/* ---------------------------------------------------------------
    AJOUTER UN ANIMAL
--------------------------------------------------------------- */
router.post("/", authenticate, asyncHandler(async (req, res, next) => {
    // Create a new document from the JSON in the request body 
    const newAnimal = new Animal(req.body);

    // Save that document
    await newAnimal.save();

    // Send the saved document in the response
    res.status(201).send(newAnimal);
    broadcastMessage({ animal: newAnimal });
}));


/* ---------------------------------------------------------------
    RECUPERER LES ANIMAUX
--------------------------------------------------------------- */
router.get("/", authenticate, asyncHandler(async (req, res, next) => {
    let animals = Animal.find({});

    animals = await animals.exec();

    // Send the saved document in the response
    res.send(animals);
}));


/* ---------------------------------------------------------------
    RECUPERER LES ANCIENNES ANONCES D'ANIMAUX
--------------------------------------------------------------- */
router.get("/missing", authenticate, asyncHandler(async (req, res, next) => {
    let query = Animal.find({});

    let today = new Date();
    let redDate = new Date(new Date().setDate(today.getDate() - 30));

    // lte -> signifie <=
    query = query.where('date').lte(redDate);

    query = await query.exec();

    // Send the saved document in the response
    res.send(query);
}));


/* ---------------------------------------------------------------
    METTRE A JOUR UN ANIMAL
--------------------------------------------------------------- */
router.patch('/:id', authenticate, loadRessourceFromParamsMiddleware(Animal), checkPermissions, asyncHandler(async (req, res, next) => {
    const animal = req.ressource;
    if (req.body.name !== undefined) {
        animal.name = req.body.name;
    }
  
    if (req.body.age !== undefined) {
      animal.age = req.body.age;
    }
  
    if (req.body.description !== undefined) {
      animal.description = req.body.description;
    }
  
    if (req.body.fur !== undefined) {
        animal.fur = req.body.fur;
    }

    if (req.body.date !== undefined) {
        animal.date = req.body.date;
    }

    if (req.body.type !== undefined) {
        animal.type = req.body.type;
    }
  
    // // ????????????????????????????????????????????????????????????????????????
    // // PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE PICTURE
    // // ????????????????????????????????????????????????????????????????????????
  
    await animal.save();
    res.status(200).send(animal);
  
}));


/* ---------------------------------------------------------------
    SUPPRIMER UN ANIMAL
--------------------------------------------------------------- */
router.delete('/:id', authenticate, loadRessourceFromParamsMiddleware(Animal), checkPermissions, asyncHandler(async (req, res, next) => {
    const animal = req.ressource;
    
    await Animal.deleteOne({
      _id: req.params.id
    });
  
    const name = animal.name;
    res.status(200).send({animal: name, status: 'deleted'});
  
}));


export default router;