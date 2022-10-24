import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
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
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: [8, 'trop court'],
        maxlength: [20, 'trop long']
    },
    /* picture: {
        type: Image,
        required: false
    }, */
    // Foreign key for Animal
    animal: [{
        type: Schema.Types.ObjectId, 
        ref: 'Animal'
    }],
    // Foreign key for Location
    location: [{
        type: Schema.Types.ObjectId, 
        ref: 'Location'
    }]
});

userSchema.virtual('password');

userSchema.pre('save', async function() {
  if (this.password) {
    const passwordHash = await bcrypt.hash(this.password, config.bcryptCostFactor);
    this.passwordHash = passwordHash;
  }
});

userSchema.set("toJSON", {
  transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
 // Remove the hashed password from the generated JSON.
 delete json.passwordHash;
 delete json.__v;
 json.id = json._id;
 delete json._id;
 return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);