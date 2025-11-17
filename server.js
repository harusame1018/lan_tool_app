const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;
const cors = require('cors');
const  path = require('path');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const uploadPath = path.join(__dirname, 'uploads');
const boardrouter = require("./routes/board.js");
const threadrouter = require("./routes/thread.js");
app.use(cookieParser());
app.use("/board",boardrouter)
app.use("/thread",threadrouter)
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached'
}));
// Enable CORS
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json());
// Sample route
app.get('/', (req, res) => {
  fs.readFile("index.html", (err, data) => {
    if (err) {
      res.status(500).send('Error reading file');
      return;
    }
    res.send(data);
  });
});
app.get("/get_file" , (req, res) => {
  const download_file = req.query.filename;
  console.log("Downloading file: " + download_file);
  res.download("./uploads/" + download_file);
});
app.post("/upload" , (req, res) => {
  const file = req.files.uploadfile;
  const name = file.name;
  const filepath = "./uploads/" + "-" + Date.now() + name;
  file.mv(filepath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('File uploaded to ' + filepath);
  });
});
app.post("/get_file" , (req, res) => {
  const dir = path.join(__dirname,"uploads")
  const files = fs.readdirSync(dir);
  res.send(files);
});
app.get("/memo", (req, res) => {
  const dir = path.join(__dirname,"memo","memo.json",)
  fs.readFile(dir, (err, data) => {
    if (err) {
      res.status(500).send('Error reading memo file');
      return;
    }
    res.send(data);
  });
});
app.post("/delete_memo", (req, res) => {
  const delete_memo = req.body.delete_memo;
  console.log("Deleting memo: " + delete_memo);
  const dir = path.join(__dirname,"memo","memo.json");
  const memos = JSON.parse(fs.readFileSync(dir));
  const updatedMemos = memos.filter(memo => memo.name !== delete_memo);
  fs.writeFile(dir, JSON.stringify(updatedMemos, null, 2), (err) => {
    if (err) {
      res.status(500).send('Error deleting memo');
      return;
    }
    res.redirect('/memo.html');
  });
});
app.post("/clear_memo", (req, res) => {
  const dir = path.join(__dirname,"memo")
  fs.writeFile(dir,"memo.json", "[]", (err) => {
    if (err) {
      res.status(500).send('Error clearing memo file');
      return;
    }
    res.redirect('/memo.html');
  });
});
app.post("/add_memo", express.urlencoded({ extended: true }), (req, res) => {
  const memoName = req.body.memo_name;
  const memoDescription = req.body.memo_description;
  const dir = path.join(__dirname,"memo","memo.json");
  fs.readFile(dir, (err, data) => {
    if (err) {
      res.status(500).send('Error reading memo file');
      return;
    }
    let memos = JSON.parse(data);
    memos.push({ name: memoName, description: memoDescription });

    fs.writeFile(dir, JSON.stringify(memos, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error writing to memo file');
        return;
      }
      res.redirect('/memo.html');
    });
  });
});

async function editmemo(oldname,newname, newdescription) {
  const memoPath = path.join(__dirname, 'memo', 'memo.json');
  try {
    const data = await fs.promises.readFile(memoPath, 'utf-8');
    const memos = JSON.parse(data);
    const updatedMemos = memos.map(memo => {
      if (memo.name === oldname) {
        return { name: newname, description: newdescription };
      }
      return memo;
    });
    await fs.promises.writeFile(memoPath, JSON.stringify(updatedMemos, null, 2));
    return updatedMemos;
  } catch (err) {
    console.error('Error reading memo file:', err);
    return [];
  }
}
app.post('/edit_memo', async (req, res) => {
  const updatedMemos = await editmemo(req.body.oldname,req.body.name, req.body.new_description);
  res.json(updatedMemos);
});
app.post("/delete_file" , (req, res) => {
  const delete_file = req.body.filename;
  console.log("Deleting file: " + delete_file);
  const dir = path.join(__dirname,"uploads");
  const file_path = path.join(dir,delete_file)
  fs.unlink(file_path, (err) => {
    if (err) {
      return res.status(500).send('Error deleting file');
    }
    res.redirect('/file.html');
  });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
