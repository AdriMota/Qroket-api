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


/* ---------------------------------------------------------------
    PERMISSIONS UTILISATEUR
--------------------------------------------------------------- */
export function checkPermissions(req, res, next) {
    const authorized = req.role === 'admin' || req.userId.toString() === req.params.id;
    if (!authorized) {
        return res.status(403).send("Tu n'as pas les droits :/")
    }
    next();
}


/* ---------------------------------------------------------------
    TRIER TABLEAU D'OBJETS
--------------------------------------------------------------- */
export function compare(a, b) {
    if (a.firstname < b.firstname) {
        return -1;
    }
    if (a.firstname > b.firstname) {
        return 1;
    }
    return 0;
}
