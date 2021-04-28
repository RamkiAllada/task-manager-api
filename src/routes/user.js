const express = require('express');
const multer = require('multer');
const router = new express.Router();
const user = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail} = require('../emails/account');

router.post('/user', async (req, res) => {
    const _user = new user(req.body);
    try {
        await _user.save();  
        const token = await _user.generateAuthToken();
        sendWelcomeEmail(_user.email, _user.name)
        res.status(201).send({user:_user.getPublicProfile(), token});
    } catch (error) {
        res.status(400).send(error)
        }
});

router.post('/user/login', async (req, res) => {
    try {
        const _user = await  user.findByUserCreds(req.body.email, req.body.password);   
        const token = await _user.generateAuthToken();
        res.send({user:_user.getPublicProfile(), token});
    } catch (error) {
        res.status(400).send();
    }
});

router.get('/users', auth, async (req, res) => {
    try {
        const users = await user.find({});
        res.send(users);  
    } catch (error) {
        res.status(500).send();
    }
})

router.get('/user/me', auth, async (req, res) => {
    try {
        res.send(req.user);  
    } catch (error) {
        res.status(500).send();
    }
})

const uploads = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('please upload file with format jpg, jpeg, png'))
        }
        cb(undefined, true)
    }
})

router.post('/user/me/avatar', auth, uploads.single('avatar'), async(req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
},(error, req, res, next) => {
    res.status(400).send({'error': error.message})
});

router.delete('/user/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/user/:id/avatar', async(req, res) => {
    try {
       const _user = await user.findById(req.params.id);
       if(!_user || !_user.avatar) {
           throw new Error();
       }
       res.set('content-Type', 'image/jpg');
       res.send(_user.avatar);
    } catch (error) {
        res.status(404).send();
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/user/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    // const _id = req.params.id;
    try {
        const _user = req.user;
        updates.forEach((update) => _user[update] = req.body[update])
        await _user.save();
        res.send(_user.getPublicProfile());
    } catch (error) {
        res.status(500).send()
    }
})

router.delete('/user/me', auth, async(req, res) => {
    try {
        await req.user.remove();
        res.send({user:req.user.getPublicProfile()})
    } catch (error) {
        res.status(500).send() 
    }
})


module.exports = router;