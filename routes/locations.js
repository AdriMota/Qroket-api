import express, { request, Router } from "express";
import Location from "../models/location.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import { checkPermissions, loadRessourceFromParamsMiddleware } from "../lib/utils.js";
import { broadcastMessage } from '../ws.js';

const router = express.Router();

/* ---------------------------------------------------------------
    AJOUTER UNE LOCALISATION
--------------------------------------------------------------- */
router.post("/", authenticate, asyncHandler(async (req, res, next) => {
    // Create a new document from the JSON in the request body 
    const newLocation = new Location(req.body);

    // Save that document
    await newLocation.save();

    // Send the saved document in the response
    res.status(201).send(newLocation);
    broadcastMessage({ location: newLocation });
}));


/* ---------------------------------------------------------------
    RECUPERER LES ANIMAUX
--------------------------------------------------------------- */
router.get("/", authenticate, asyncHandler(async (req, res, next) => {
    let locations = Location.find({});

    locations = await locations.exec();

    // Send the saved document in the response
    res.send(locations);
}));


/* ---------------------------------------------------------------
    METTRE A JOUR UNE LOCALISATION
--------------------------------------------------------------- */
router.patch('/:id', authenticate, loadRessourceFromParamsMiddleware(Location), checkPermissions, asyncHandler(async (req, res, next) => {
    const location = req.ressource;
    if (req.body.npa !== undefined) {
        location.npa = req.body.npa;
    }

    if (req.body.city !== undefined) {
        location.city = req.body.city;
    }

    if (req.body.location !== undefined) {
        location.location = req.body.location;
    }

    await location.save();
    res.status(200).send(location);

}));


/* ---------------------------------------------------------------
    SUPPRIMER UNE LOCALISATION
--------------------------------------------------------------- */
router.delete('/:id', authenticate, loadRessourceFromParamsMiddleware(Location), checkPermissions, asyncHandler(async (req, res, next) => {
    const location = req.ressource;
    
    await Location.deleteOne({
      _id: req.params.id
    });
  
    const city = location.city;
    res.status(200).send({location: city, status: 'deleted'});
  
}));


export default router;