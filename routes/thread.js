const express = require('express');
const fs = require('fs');
const path = require('path');
const fsPromises = require("fs").promises;
const router = express.Router();
const cors = require('cors');
const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",4);
const cookieparser = require("cookie-parser");
const has_id = require("./has_id");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieparser());
router.use(cors());
require("date-utils");
router.post("/get_thread", async (req,res) => {
    const thread_id = String(req.body.thread_id);
    try {
        await fs.promises.access(path.join(__dirname,`../data/threads/thread${thread_id}.json`));
        const data = await fs.promises.readFile(path.join(__dirname,`../data/threads/thread${thread_id}.json`),"utf-8");
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});
router.post("/getid",async (req,res) => {
    const thread_id = String(req.body.thread_id);
    console.log(req.cookies[`id${thread_id}`]);
    res.json({
        id:req.cookies[`id${thread_id}`]
    });
});
router.post("/post_res", async (req,res) => {
    
    const thread_id = String(req.body.thread_id);
    const new_res = req.body.new_res;
    let id
    console.log(!req.cookies[`id${thread_id}`])
    if(!req.cookies[`id${thread_id}`]) {
        id = nanoid();
        console.log("id is ",id)
        while (!await has_id.has_id(id,thread_id)) {
            id = nanoid(); 
            console.log("change id:",id);
        }
        res.cookie(`id${thread_id}`,id,{
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            path: "/",
        });
        console.log(req.cookies[`id${thread_id}`]);
    }
    const user_id = req.body.user_id;
    const date = new Date().toFormat("YYYY/MM/DD HH24時MI分SS秒");
    let post_data
    if (user_id) {
        post_data = {
            id:user_id,
            text:new_res,
            date:date
        }
    }
    else {
        post_data = {
            id:id,
            text:new_res,
            date:date
        }
    }
    try {
        const thread_data = JSON.parse(await fs.promises.readFile(path.join(__dirname,`../data/threads/thread${thread_id}.json`)));
        thread_data.push(post_data);
        await fs.promises.writeFile(path.join(__dirname,`../data/threads/thread${thread_id}.json`),JSON.stringify(thread_data,null,2));
        res.json({ok:true});
    } catch (error) {
        console.error("error!" + error);
    }
});
module.exports = router