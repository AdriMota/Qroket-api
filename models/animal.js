import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define a schema
const animalSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    fur: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        enum: [ 'lost', 'find' ],
        default: 'lost'
    },
    /* picture: {
        type: Image,
        required: true
    }, */
    // Foreign key for User
    user: [{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }],
    // Foreign key for Location
    location: [{
        type: Schema.Types.ObjectId, 
        ref: 'Location'
    }]
});

// Create the model from the schema and export it
export default mongoose.model('Animal', animalSchema);