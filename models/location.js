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

// Create the model from the schema and export it
export default mongoose.model('Location', locationSchema);