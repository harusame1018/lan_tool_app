const express = require('express');
const fs = require('fs');
const path = require('path');
const fsPromises = require("fs").promises;
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
require("date-utils")
router.post("/get_thread", async (req,res) => {
    const thread_id = req.body.thread_id;
    try {
        await fs.promises.access(path.join(__dirname,`../data/threads/thread${thread_id}.json`));
        const data = await fs.promises.readFile(path.join(__dirname,`../data/threads/thread${thread_id}.json`));
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router