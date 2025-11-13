const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;
const cors = require('cors');
const  path = require('path');
const uploadPath = path.join(__dirname, 'uploads');
// Middleware to handle file uploads
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached'
}));
// Enable CORS
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.static('routes/public'));

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
  res.download("routes/uploads/" + download_file);
});
app.post("/upload" , (req, res) => {
  const file = req.files.uploadfile;
  const name = file.name;
  const filepath = "routes/uploads/" + "-" + Date.now() + name;
  file.mv(filepath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('File uploaded to ' + filepath);
  });
});
app.post("/get_file" , (req, res) => {
  const files = fs.readdirSync("routes/uploads/");
  res.send(files);
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
