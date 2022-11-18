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
        required: true,
        validate: {
            validator: function(date) {
                return date <= Date.now()
            },
            message: "La date ne peut pas être dans le futur."
        }
    },
    type: {
        type: String,
        enum: [ 'lost', 'find' ],
        default: 'lost'
    },
    pictures: [{
        name: String,
        data: Buffer,
        contentType: String,
        required: false
    }],
    // Foreign key for User
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    // Foreign key for Location
    location: {
        type: Schema.Types.ObjectId, 
        ref: 'Location',
        required: true
    }
});

// Create the model from the schema and export it
export default mongoose.model('Animal', animalSchema);