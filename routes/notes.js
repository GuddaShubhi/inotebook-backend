const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const fetchUser = require("../middleware/fetchUser");


// to fetch all the user's note created endpoint /api/notes/fetchnotes using : GET, token required
router.get('/fetchnotes', fetchUser, async (req, res) => {
    try {
        console.log(req.user);
        const allNotes = await Notes.find({user: req.user});
        res.json(allNotes);
    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
})


// add user's note created endpoint /api/notes/addnotes using : POST, token required
router.post('/addnotes', [body("title", "Enter valid note title").isLength(3), body("description", "Enter valid note description").isLength(5)], fetchUser, async (req, res) => {

    // if validation not matched then will send error object as response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const notes = await Notes.create({
            title: req.body.title,
            description: req.body.description,
            tag: !req.body.tag ? 'General' : req.body.tag,
            user: req.user
        })

        res.json(notes);
    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
})


// update user's note created endpoint /api/notes/updatenotes using : PUT, token required
router.put('/updatenotes/:id', fetchUser, async (req, res) => {

    try {
        const {title, description, tag} = req.body;
        let note = await Notes.findById(req.params.id);

        // checking, note present in DB
        if(!note) {
            return res.status(404).json({mssg: "No data found"});
        }

        // checking the note is being updated by same user
        if(note.user.toString() !== req.user) {
            return res.status(400).json({mssg: "User not valid user to update the note."});
        }

        const newNotes = {};
        if(title) { newNotes.title = title };
        if(description) { newNotes.description = description };
        if(tag) { newNotes.tag = tag };

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNotes}, {new: true});
        res.json(note);   
    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
})


// delete user's note created endpoint /api/notes/deletenote using : DELETE, token required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {

    try {
        let note = await Notes.findById(req.params.id);

        // checking, note present in DB
        if(!note) {
            return res.status(404).json({mssg: "No data found"});
        }

        // checking the note is being updated by same user
        if(note.user.toString() !== req.user) {
            return res.status(400).json({mssg: "User not valid user to update the note."});
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({success: "deleted", note});   
    } catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error");
    }
})

module.exports = router