const fs = require('fs');
const path = require('path');
const fsPromises = require("fs").promises;
exports.has_id = async function (id,threadid) {
    try {
        let jsondata = ""
        try {
            jsondata = await fs.promises.readFile(path.join(__dirname,`../data/id/id${threadid}.json`),"utf-8");
        } catch (error) {
            const initial = [id];
            await fs.promises.writeFile(path.join(__dirname,`../data/id/id${threadid}.json`),JSON.stringify(initial,null,2),"utf-8");
            jsondata = await fs.promises.readFile(path.join(__dirname,`../data/id/id${threadid}.json`));
            return true;
        }
        const obj = JSON.parse(jsondata);
        if (!obj.includes(id)) {
            obj.push(id);
            return true
        }
    } catch (error) {
        console.error("error!",error);
    }
}
