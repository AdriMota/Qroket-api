import express, { request, Router } from "express";
import Animal from "../models/animal.js";
import { authenticate } from "./auth.js";
import asyncHandler from "express-async-handler";
import { checkPermissionsAnimal, loadRessourceFromParamsMiddleware } from "../lib/utils.js";
import { broadcastMessage } from '../ws.js';
import { uploads } from "../lib/loadImage.js";
import fs from "fs";

const router = express.Router();


/**
 * @api {post} /animals Create an animal
 * @apiName CreateAnimal
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Registers a new animal.
 * Description, fur, date, user and location properties are required.
 *
 * @apiUse AnimalInRequestBody
 * @apiUse AnimalInResponseBody
 *
 * @apiExample Example
 *     POST /animals HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *          "name": "Dyron",
 *          "age": "8",
 *          "description": "Grand chat très têtu et indépendant. N'aime pas les câlins. Commence à avoir un grand bidou !",
 *          "fur": "Poils gris, gris foncé et noir",
 *          "date": "2022-11-20",
 *          "type": "lost",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "user": "6372538ce0cac34a8803fdcf"
 *      }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://https://qroket-api.onrender.com/animal/
 *
 *     {
 *          "_id": "637a53d3fda25eaf8fbd14e5",
 *          "name": "Dyron",
 *          "age": 8,
 *          "description": "Grand chat très têtu et indépendant. N'aime pas les câlins. Commence à avoir un grand bidou !",
 *          "fur": "Poils gris, gris foncé et noir",
 *          "date": "2022-11-20T00:00:00.000Z",
 *          "type": "lost",
 *          "user": "637a2f9d533c85c1ef1f757c",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [],
 *          "__v": 0
 *      }
 */
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
    broadcastMessage({ event: "New animal added : ", animal: newAnimal });
}));


/**
 * @api {patch} /animals/:id/pictures Add pictures to an animal
 * @apiName AddPicturesAnimal
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Add pictures to an animal.
 * Description, fur, date, user and location properties are required.
 * @apiParam {id} id Animal id
 *
 * @apiUse AnimalIdInUrlPath
 * @apiUse AnimalInRequestBody
 * @apiUse AnimalInResponseBody
 * @apiUse AnimalNotFoundError
 *
 * @apiExample Example
 *     PATCH /animals/637a53d3fda25eaf8fbd14e5/pictures HTTP/1.1
 *     Content-Type: application/octet-stream
 *
 *     {
 *          pictures: "Dyron_1.jpg",
 *          pictures: "Dyron_2.jpg"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "_id": "637a53d3fda25eaf8fbd14e5",
 *          "name": "Dyron",
 *          "age": 8,
 *          "description": "Grand chat très têtu et indépendant. N'aime pas les câlins. Commence à avoir un grand bidou !",
 *          "fur": "Poils gris, gris foncé et noir",
 *          "date": "2022-11-20T00:00:00.000Z",
 *          "type": "lost",
 *          "user": "637a2f9d533c85c1ef1f757c",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [
 *              {
 *                  "name": "qroket_1668962510362-137621094.jpg",
 *                  "data": {
 *                      "type": "Buffer",
 *                      "data": [
 *                          113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 54, 50, 45, 49, 51, 55, 54, 50, 49, 48, 57, 52, 46, 106, 112, 103
 *                      ]
 *                  },
 *                  "contentType": "image/jpg",
 *                  "_id": "637a58ce1bbe9bf3795c84e6"
 *              },
 *              {
 *                  "name": "qroket_1668962510392-101732063.jpg",
 *                  "data": {
 *                      "type": "Buffer",
 *                      "data": [
 *                          113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 57, 50, 45, 49, 48, 49, 55, 51, 50, 48, 54, 51, 46, 106, 112, 103
 *                      },
 *                  "contentType": "image/jpg",
 *                  "_id": "637a58ce1bbe9bf3795c84e7"
 *              }
 *          ],
 *          "__v": 0
 *      }
 * 
 * 
 */
/* ---------------------------------------------------------------
    AJOUTER PLUSIEURS IMAGES A UN ANIMAL
--------------------------------------------------------------- */
router.patch("/:id/pictures", loadRessourceFromParamsMiddleware(Animal), asyncHandler(async (req, res, next) => {

    uploads(req, res, function (err) {
        const animal = req.ressource;

        req.files.forEach(picture => {
            animal.pictures.push({
                name: picture.filename,
                data: picture.filename,
                contentType: 'image/jpg'
            })
        });

        // Save that document
        animal.save();

        // Send the saved document in the response
        res.status(201).send(animal);
    });

    //if (req.fileFormatError) return res.send(req.fileFormatError);*/
}));


/**
 * @api {get} /animals Retrieve animals
 * @apiName RetrieveAnimals
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Retrieves animals.
 *
 * @apiUse AnimalInResponseBody
 *
 * @apiExample Example
 *     GET /animals HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "_id": "637a53d3fda25eaf8fbd14e5",
 *          "name": "Dyron",
 *          "age": 8,
 *          "description": "Grand chat très têtu et indépendant. N'aime pas les câlins. Commence à avoir un grand bidou !",
 *          "fur": "Poils gris, gris foncé et noir",
 *          "date": "2022-11-20T00:00:00.000Z",
 *          "type": "lost",
 *          "user": "637a2f9d533c85c1ef1f757c",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [
 *              {
 *                  "name": "qroket_1668962510362-137621094.jpg",
 *                  "data": {
 *                      "type": "Buffer",
 *                      "data": [
 *                          113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 54, 50, 45, 49, 51, 55, 54, 50, 49, 48, 57, 52, 46, 106, 112, 103
 *                      ]
 *                  },
 *                  "contentType": "image/jpg",
 *                  "_id": "637a58ce1bbe9bf3795c84e6"
 *              },
 *              {
 *                  "name": "qroket_1668962510392-101732063.jpg",
 *                  "data": {
 *                      "type": "Buffer",
 *                      "data": [
 *                          113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 57, 50, 45, 49, 48, 49, 55, 51, 50, 48, 54, 51, 46, 106, 112, 103
 *                      },
 *                  "contentType": "image/jpg",
 *                  "_id": "637a58ce1bbe9bf3795c84e7"
 *              }
 *          ],
 *          "__v": 0
 *      },
 *      {
 *          "_id": "6377faeabc72312a883bef41",
 *          "name": "Pantoufle",
 *          "age": 2,
 *          "description": "Petit chien tout poilu",
 *          "fur": "Long poil blanc",
 *          "date": "2022-08-10T00:00:00.000Z",
 *          "type": "find",
 *          "user": "6372538ce0cac34a8803fdcf",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [],
 *          "__v": 0
 *      }
 */
/* ---------------------------------------------------------------
    RECUPERER LES ANIMAUX
--------------------------------------------------------------- */
router.get("/", authenticate, asyncHandler(async (req, res, next) => {
    let animals = Animal.find({});

    animals = await animals.exec();

    // Send the saved document in the response
    res.send(animals);
}));


/**
 * @api {get} /animals/:id Retrieve an animal
 * @apiName RetrieveAnimal
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one animal.
 * @apiParam {id} id Animal id
 *
 * @apiUse AnimalIdInUrlPath
 * @apiUse AnimalInResponseBody
 * @apiUse AnimalIncludes
 * @apiUse AnimalNotFoundError
 *
 * @apiExample Example
 *     GET /animals/637a53d3fda25eaf8fbd14e5 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "_id": "637a53d3fda25eaf8fbd14e5",
 *          "name": "Dyron",
 *          "age": 8,
 *          "description": "Grand chat très têtu et indépendant. N'aime pas les câlins. Commence à avoir un grand bidou !",
 *          "fur": "Poils gris, gris foncé et noir",
 *          "date": "2022-11-20T00:00:00.000Z",
 *          "type": "lost",
 *          "user": "637a2f9d533c85c1ef1f757c",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [
 *              {
 *                  "name": "qroket_1668962510362-137621094.jpg",
 *                  "data": {
 *                      "type": "Buffer",
 *                      "data": [
 *                          113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 54, 50, 45, 49, 51, 55, 54, 50, 49, 48, 57, 52, 46, 106, 112, 103
 *                      ]
 *                  },
 *                  "contentType": "image/jpg",
 *                  "_id": "637a58ce1bbe9bf3795c84e6"
 *              },
 *              {
 *                  "name": "qroket_1668962510392-101732063.jpg",
 *                  "data": {
 *                      "type": "Buffer",
 *                      "data": [
 *                          113, 114, 111, 107, 101, 116, 95, 49, 54, 54, 56, 57, 54, 50, 53, 49, 48, 51, 57, 50, 45, 49, 48, 49, 55, 51, 50, 48, 54, 51, 46, 106, 112, 103
 *                      },
 *                  "contentType": "image/jpg",
 *                  "_id": "637a58ce1bbe9bf3795c84e7"
 *              }
 *          ],
 *          "__v": 0
 *      }
 */
/* ---------------------------------------------------------------
    RECUPERER UN ANIMAL
--------------------------------------------------------------- */
router.get("/:id", authenticate, asyncHandler(async (req, res, next) => {
    let animal = Animal.findById(req.params.id );

    animal = await animal.exec();

    // Send the saved document in the response
    res.send(animal);
}));


/**
 * @api {get} /animals Retrieve animals missing
 * @apiName RetrieveAnimalsMissing
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Retrieves animals missing.
 *
 * @apiUse AnimalInResponseBody
 *
 * @apiExample Example
 *     GET /animals HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *      {
 *          "_id": "6377faeabc72312a883bef41",
 *          "name": "Pantoufle",
 *          "age": 2,
 *          "description": "Petit chien tout poilu",
 *          "fur": "Long poil blanc",
 *          "date": "2022-08-10T00:00:00.000Z",
 *          "type": "find",
 *          "user": "6372538ce0cac34a8803fdcf",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [],
 *          "__v": 0
 *      }
 */
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


/**
 * @api {patch} /animals/:id Partially update an animal
 * @apiName PartiallyUpdateAnimal
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Partially updates animal's data (only the properties found in the request body will be updated).
 * @apiParam {id} id Animal id
 *
 * @apiUse AnimalIdInUrlPath
 * @apiUse AnimalInRequestBody
 * @apiUse AnimalInResponseBody
 * @apiUse AnimalNotFoundError
 *
 * @apiExample Example
 *     PATCH /animals/6377faeabc72312a883bef41 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *          "name": "Bueno"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "_id": "6377faeabc72312a883bef41",
 *          "name": "Bueno",
 *          "age": 2,
 *          "description": "Petit chien tout poilu",
 *          "fur": "Long poil blanc",
 *          "date": "2022-08-10T00:00:00.000Z",
 *          "type": "find",
 *          "user": "6372538ce0cac34a8803fdcf",
 *          "location": "637253e4e0cac34a8803fdd3",
 *          "pictures": [],
 *          "__v": 0
 *      }
 */
/* ---------------------------------------------------------------
    METTRE A JOUR UN ANIMAL
--------------------------------------------------------------- */
router.patch('/:id', authenticate, loadRessourceFromParamsMiddleware(Animal), checkPermissionsAnimal, asyncHandler(async (req, res, next) => {
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

    if (req.body.user !== undefined) {
        animal.user = req.body.user;
    }

    if (req.body.location !== undefined) {
        animal.location = req.body.location;
    }

    if (req.body.pictures !== undefined) {
        user.pictures = req.body.pictures;
      }

    await animal.save();
    res.status(200).send(animal);

}));


/**
 * @api {delete} /animals/:id Delete an animal
 * @apiName DeleteAnimal
 * @apiGroup Animal
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes an animal.
 * @apiParam {id} id Animal id
 *
 * @apiUse AnimalIdInUrlPath
 * @apiUse AnimalNotFoundError
 *
 * @apiExample Example
 *     DELETE /animals/6377faeabc72312a883bef41 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *          "animal": "Bueno",
 *          "status": "deleted"
 * 
 *     }
 */
/* ---------------------------------------------------------------
    SUPPRIMER UN ANIMAL
--------------------------------------------------------------- */
router.delete('/:id', authenticate, loadRessourceFromParamsMiddleware(Animal), checkPermissionsAnimal, asyncHandler(async (req, res, next) => {
    const animal = req.ressource;

    // Delete image
    /* let pictures = animal.pictures;
    for (const picture of pictures) {
        const filePath = new URL(`../uploads/${picture.name}`, import.meta.url);
        
        fs.access(filePath, (err) => {
            if (!err) fs.unlinkSync(filePath);
        })
    } */
    
    // Delete animal
    await Animal.deleteOne({
        _id: req.params.id
    });

    const name = animal.name;
    res.status(200).send({ animal: name, status: 'deleted' });

}));


/**
 * @apiDefine AnimalIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the animal to retrieve
 */

/**
 * @apiDefine AnimalInRequestBody
 * @apiBody (Request body) {String} name The name of the animal
 * @apiBody (Request body) {Number} age The age of the animal
 * @apiBody (Request body) {String} description The description of the animal
 * @apiBody (Request body) {String} fur The description of the fur of the animal
 * @apiBody (Request body) {Date} date The date of the lost/find of the animal
 * @apiBody (Request body) {String} type Describe if the animal is lost or find
 * @apiBody (Request body) {String} location The id of the location where the animal was find or lost
 * @apiBody (Request body) {String} user The id of the user who found or lost an animal
 */

/**
 * @apiDefine AnimalInResponseBody
 * @apiSuccess (Request body) {String} name The name of the animal
 * @apiSuccess (Request body) {Number} age The age of the animal
 * @apiSuccess (Request body) {String} description The description of the animal
 * @apiSuccess (Request body) {String} fur The description of the fur of the animal
 * @apiSuccess (Request body) {Date} date The date of the lost/find of the animal
 * @apiSuccess (Request body) {String} type Describe if the animal is lost or find
 * @apiSuccess (Request body) {Buffer} pictures The pictures of the animal
 * @apiSuccess (Request body) {String} location The id of the location where the animal was find or lost
 * @apiSuccess (Request body) {String} user The id of the user who found or lost an animal
 */

/**
 * @apiDefine AnimalIncludes
 * @apiQuery (URL query parameters) {String} id The unique identifier of the animal
 */

/**
 * @apiDefine AnimalNotFoundError
 *
 * @apiError {Object} 404/NotFound No animal was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     Aucun ressource avec l'ID 63725379e0cac34a8803fass trouvée.
 */


export default router;