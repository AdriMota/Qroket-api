import express, { request, Router } from "express";
import Location from "../models/location.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import { checkPermissions, loadRessourceFromParamsMiddleware } from "../lib/utils.js";
import { broadcastMessage } from '../ws.js';

const router = express.Router();

/**
 * @api {post} /locations Create a location
 * @apiName CreateLocation
 * @apiGroup Location
 * @apiVersion 1.0.0
 * @apiDescription Registers a new location.
 *
 * @apiUse LocationInRequestBody
 * @apiUse LocationInResponseBody
 *
 * @apiExample Example
 *     POST /locations HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *          "npa": "1200",
 *          "city": "Genève",
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [46.2043907, 6.1431577]
 *          }
 *      }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://https://qroket.onrender.com/locations/
 *
 *     {
 *          "npa": 1200,
 *          "city": "Genève",
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [
 *                  46.2043907,
 *                  6.1431577
 *              ]
 *          },
 *          "_id": "63773e4c473df09e582f82e3",
 *          "__v": 0
 *      }
 */
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
}));


/**
 * @api {get} /locations/:id Retrieve a location
 * @apiName RetrieveLocation
 * @apiGroup Location
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one location.
 * @apiParam {id} id Location id
 *
 * @apiUse LocationIdInUrlPath
 * @apiUse LocationInResponseBody
 * @apiUse LocationIncludes
 * @apiUse LocationNotFoundError
 *
 * @apiExample Example
 *     GET /locations/63773e4c473df09e582f82e3 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "npa": 1400,
 *          "city": "Yverdon-les-Bains",
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [
 *                  46.7784736,
 *                  6.641183
 *              ]
 *          },
 *          "_id": "63725379e0cac34a8803fdcc",
 *          "__v": 0
 *      }
 */
/* ---------------------------------------------------------------
    RECUPERER UNE LOCALISATION
--------------------------------------------------------------- */
router.get("/:id", authenticate, loadRessourceFromParamsMiddleware(Location), asyncHandler(async (req, res, next) => {
    let location = Location.findOne({ id: req.params.id });
  
    location = await location.exec();
  
      // Send the saved document in the response
      res.send(location);
  }));


/**
 * @api {get} /locations Retrieve locations
 * @apiName RetrieveLocations
 * @apiGroup Location
 * @apiVersion 1.0.0
 * @apiDescription Retrieves locations.
 *
 * @apiUse LocationInResponseBody
 *
 * @apiExample Example
 *     GET /locations HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [
 *                  46.7784736,
 *                  6.641183
 *              ]
 *          },
 *          "_id": "63725379e0cac34a8803fdcc",
 *          "npa": 1400,
 *          "city": "Yverdon-les-Bains",
 *          "__v": 0
 *      },
 *      {
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [
 *                  47.1034892,
 *                  6.8327838
 *              ]
 *          },
 *          "_id": "637253e4e0cac34a8803fdd3",
 *          "npa": 2300,
 *          "city": "La Chaux-de-Fonds",
 *          "__v": 0
 *      }
 */
/* ---------------------------------------------------------------
    RECUPERER LES LOCALISATIONS
--------------------------------------------------------------- */
router.get("/", authenticate, asyncHandler(async (req, res, next) => {
    let locations = Location.find({});

    locations = await locations.exec();

    // Send the saved document in the response
    res.send(locations);
}));


/**
 * @api {patch} /locations/:id Partially update a location
 * @apiName PartiallyUpdateLocation
 * @apiGroup Location
 * @apiVersion 1.0.0
 * @apiDescription Partially updates a location's data (only the properties found in the request body will be updated).
 * All properties are required.
 * @apiParam {id} id Location id
 *
 * @apiUse LocationIdInUrlPath
 * @apiUse LocationInRequestBody
 * @apiUse LocationInResponseBody
 * @apiUse LocationNotFoundError
 *
 * @apiExample Example
 *     PATCH /locations/63773e4c473df09e582f82e3 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *          "npa": "1201"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [
 *                  46.2043907,
 *                  6.1431577
 *              ]
 *          },
 *          "_id": "63773e4c473df09e582f82e3",
 *          "npa": 1201,
 *          "city": "Genève",
 *          "__v": 0
 *      }
 */
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


/**
 * @api {delete} /locations/:id Delete a location
 * @apiName DeleteLocation
 * @apiGroup Location
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a location.
 * @apiParam {id} id Location id
 *
 * @apiUse LocationIdInUrlPath
 * @apiUse LocationNotFoundError
 *
 * @apiExample Example
 *     DELETE /locations/63773e4c473df09e582f82e3 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "location": "Genève",
 *          "status": "deleted"
 * 
 *     }
 */
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


/**
 * @apiDefine LocationIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the location to retrieve
 */

/**
 * @apiDefine LocationInRequestBody
 * @apiBody (Request body) {Number{4}} npa The npa of the location
 * @apiBody (Request body) {String{1..60}} city The city of the location
 * @apiBody (Request body) {Object} location The type and coordinates of the location
 */

/**
 * @apiDefine LocationInResponseBody
 * @apiSuccess (Response body) {Object} location The type and coordinates of the location
 * @apiSuccess (Response body) {String} id The unique identifier of the location
 * @apiSuccess (Response body) {Number} npa The npa of the location
 * @apiSuccess (Response body) {String} city The city of the location
 */

/**
 * @apiDefine LocationIncludes
 * @apiQuery (URL query parameters) {String} id The unique identifier of the location
 */

/**
 * @apiDefine LocationNotFoundError
 *
 * @apiError {Object} 404/NotFound No location was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     Aucun ressource avec l'ID 63725379e0cac34a8803fass trouvée.
 */


export default router;