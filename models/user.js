import mongoose from 'mongoose';
import 'mongoose-type-email';
const Schema = mongoose.Schema;

// Define a schema
const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        minlength: [3, 'trop court'],
        maxlength: [25, 'trop long']
    },
    lastname: {
        type: String,
        required: true,
        minlength: [3, 'trop court'],
        maxlength: [50, 'trop long']
    },
    phone: {
        type: Number,
        required: false
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'trop court']
    },
    picture: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: [ 'admin', 'user' ],
        default: 'user'
    },
    location: {
        type: String, 
        required: true
    }
});

userSchema.set("toJSON", {
  transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
 // Remove the hashed password from the generated JSON.
 delete json.password; //passwordHash
 delete json.__v;
 json.id = json._id;
 delete json._id;
 return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);