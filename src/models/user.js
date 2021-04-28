const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const task = require('./tasks');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.getPublicProfile = function() {
    const _user = this;
    const userObject = _user.toObject();
    delete userObject.tokens;
    delete userObject.password;

    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const _user = this;
    const token = await jwt.sign({_id: _user._id.toString()}, process.env.JWT_SECRET);
    _user.tokens = _user.tokens.concat({token});
    await _user.save();
    return token
}

userSchema.statics.findByUserCreds = async (email, password) => {
    const _user = await user.findOne({email});
    if(!_user) {
        throw new Error('unable to login')
    }
    const isMatch = await bcrypt.compare(password, _user.password);
    if(!isMatch) {
        throw new Error('unable to login')
    }
    return _user;
}

// hash the password before saved to mongo
userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Delete task along with user
userSchema.pre('remove', async function(next) {
    const user = this;
    await task.deleteMany({
        owner: user._id
    })
    next();

})

const user = mongoose.model('User', userSchema);
module.exports = user;