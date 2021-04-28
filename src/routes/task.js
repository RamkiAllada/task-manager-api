const express = require('express');
const router = new express.Router();
const task = require('../models/tasks');
const auth = require('../middleware/auth');

router.post('/task', auth, async(req, res) => {
    const _task = new task({
                            ...req.body,
                            owner: req.user._id
                        });
    try {
        const task = await _task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/tasks', auth, async(req, res) => {
    try {
        // const tasks = await task.find({owner: req.user._id});
        const match = {};
        if(req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        const sort = {};
        if(req.query.sortBy) {
            const sortParts = req.query.sortBy.split(':');
            sort[sortParts[0]] = sortParts[1]==='asc' ? 1 : -1;
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(404).send(error);
    }
});
router.get('/task/:id', auth, async(req, res) => {
    const _id = req.params.id;
    try {
        const _task = await task.findOne({_id, owner: req.user._id});
        if(!_task) {
            return res.status(404).send();
        }
        res.send(_task);
    } catch (error) {
        res.status(500).send(error)
    }
});
router.patch('/task/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    try {
        const _task = await task.findOne({_id, owner: req.user._id});
        if(!_task) {
            return res.status(404).send();
        }
        updates.forEach(update => _task[update] = req.body[update]);
        await _task.save();
        res.send(_task)
    } catch (error) {
        res.status(500).send();   
    }
})

router.delete('/task/:id', auth, async(req, res) => {
    const _id = req.params.id;
    try {
        const _task = await task.findOneAndDelete({_id, owner: req.user._id});
        if(!_task) {
            return res.status(404).send();
        } 
        res.send(_task)
    } catch (error) {
        res.status(500).send() 
    }
})

module.exports = router;
