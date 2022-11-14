import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define a schema
const locationSchema = new Schema({
    npa: {
        type: Number,
        required: true,
        length: 4
    },
    city: {
        type: String,
        required: true,
        minlength: [1, 'trop court'],
        maxlength: [60, 'trop long']
    },
    location: {
        type: {
            type: String,
            required: true,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: validateGeoJsonCoordinates,
                message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
            }
        }
    },
    // Foreign key for User
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Foreign key for Animal
    animal: [{
        type: Schema.Types.ObjectId,
        ref: 'Animal'
    }]
});


// Create a geospatial index on the location property.
locationSchema.index({ location: '2dsphere' });

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
    return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
    return value >= -90 && value <= 90;
}

function isLongitude(value) {
    return value >= -180 && value <= 180;
}

// Create the model from the schema and export it
export default mongoose.model('Location', locationSchema);