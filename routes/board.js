const express = require('express');
const fs = require('fs');
const path = require('path');
const fsPromises = require("fs").promises;
const router = express.Router();
const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",4);
const cookieparser = require("cookie-parser");
router.use(cookieparser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
require("date-utils")

async function has_id(id,threadid) {
    try {
        let jsondata = ""
        try {
            jsondata = await fs.promises.readFile(path.join(__dirname,`../data/id/id${threadid}.json`));
        } catch (error) {
            const initial = [id];
            await fs.promises.writeFile(path.join(__dirname,`../data/id/id${threadid}.json`),JSON.stringify(initial,null,2),"utf-8");
            jsondata = await fs.promises.readFile(path.join(__dirname,`../data/id/id${threadid}.json`));
        }
        const obj = JSON.parse(jsondata);
        const search = (data) => {
            return data.includes(id);
        }
        const found = search(obj);
        if (found) {
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.error("error!",error);
    }
}

async function get_thread_list() {
    try {
        const data = await fsPromises.readFile(path.join(__dirname,"../data/board.json"), "utf-8");
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
    const thread_title = req.body.thread_title;
    const main_text = req.body.main_text
    const date = new Date().toFormat("YYYY/MM/DD HH24時MI分SS秒");
    console.log(date)
    const thread_list = await get_thread_list();
    console.log(thread_list.length);
    const thread_id = String(thread_list.length + 1)
    const new_thread = {
        "title":thread_title,
        "id":thread_id,
        "date":date
    }
    let id = nanoid();
    while (!await has_id(id,thread_id)) {
       id = nanoid(); 
       console.log("change id:",id);
    }
    res.cookie("id",id);
    try {
        thread_list.push(new_thread);
        console.log(new_thread);
        await fsPromises.writeFile(path.join(__dirname,"../data/board.json"),JSON.stringify(thread_list,null,2));
        const initial = 
        [
            {
                "id":id,
                "text":main_text,
                "date":date
            }
        ]
        await fs.promises.writeFile(
            path.join(__dirname,`../data/threads/thread${thread_id}.json`),
            JSON.stringify(initial),
            { encoding:"utf-8"}
        );
        res.redirect(`../thread/thread.html?id=${thread_id}`);
    } 
    catch(err) {
        res.status(500).send(`err:${err}`)
    }
});
module.exports = router;