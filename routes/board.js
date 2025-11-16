const express = require('express');
const fs = require('fs');
const path = require('path');
const fsPromises = require("fs").promises;
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
require("date-utils")
async function get_thread_list() {
    try {
        const data = await fsPromises.readFile(path.join("lan_tool_app/data/board.json"), "utf-8")
        return JSON.parse(data);
    }
    catch(err) {
        console.log("error:",err);
        return [];
    }
}
// Route to get the memo content
router.get("/list", async (req, res) => {
    const thread_list = await get_thread_list()
    res.json(thread_list);
});

router.post("/post", async (req,res) => {
    const title = req.body.thread_title;
    //const thread_id = req.body.thread_id;
    const main_text = req.body.main_text
    const date = new Date().toFormat("YYYY/MM/DD HH24時MI分SS秒");
    console.log(date)
   // const itch_id = req.body.itch_id;
    const thread_list = await get_thread_list();
    console.log(thread_list.length)
});
module.exports = router;