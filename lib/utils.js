import User from "../models/user.js";
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

/* ---------------------------------------------------------------
    UTILISATEUR EXISTANT
--------------------------------------------------------------- */
export const loadRessourceFromParamsMiddleware = function (ressourceModel) {
    
    return async function (req, res, next) {
        const ressourceId = req.params.id;

        if (!ObjectId.isValid(ressourceId)) {
            return ressourceNotFound(res, ressourceId);
        }

        const ressource = await ressourceModel.findById(req.params.id);

        if (!ressource) {
            return ressourceNotFound(res, ressourceId)
        }

        req.ressource = ressource;
        next();
    }
}

function ressourceNotFound(res, ressourceId) {
    return res.status(404).type('text').send(`Aucun ressource avec l'ID ${ressourceId} trouvée.`);
}

/* export async function loadUserFromParamsMiddleware(req, res, next) {
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
        return ressourceNotFound(res, userId);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return ressourceNotFound(res, userId)
    }

    req.user = user;
    next();
} */


/* ---------------------------------------------------------------
    PERMISSIONS UTILISATEUR
--------------------------------------------------------------- */
export function checkPermissions(req, res, next) {
    const authorized = req.role === 'admin' || req.userId.toString() === req.ressource.id;
    if (!authorized) {
        return res.status(403).send("Tu n'as pas les droits :/")
    }
    next();
}