const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const studentFile = 'src/data/student.json'
const app = express();
const port = 3000;


app.use(express.json());
app.use(cors());
//get all students
app.get('/student', (req, res) => {
    fs.readFile(studentFile, (err, jsonData) => {
      if (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        res.status(500).send('Erro interno do servidor');
      } else {
        const data = JSON.parse(jsonData);
        res.json(data);
      }
    });
});
//get a student by id
app.get('/student/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(studentFile, (err, jsonData) => {
      if (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        res.status(500).send('Erro interno do servidor');
      } else {
        let existingData = [];
        if (jsonData.length > 0) {
          existingData = JSON.parse(jsonData);
        }
  
        const dataIndex = existingData.findIndex(item => item.id === id);
  
        if (dataIndex === -1) {
          res.status(404).send('Registro não encontrado');
        } else {
            res.json(existingData[dataIndex]);
        }
      }
    });
});
//create a new student
app.post('/student', (req, res) => {
    const newData = req.body;
    fs.readFile(studentFile, (err, jsonData) => {
      if (err) {
        if (err.code === 'ENOENT') {
          const newId = generateUniqueId();
          const newDataWithId = { id: newId, photo: false, ...newData };
          const initialData = [newDataWithId];
          fs.writeFile(studentFile, JSON.stringify(initialData), (err) => {
            if (err) {
              console.error('Erro ao criar o arquivo JSON:', err);
              res.status(500).send('Erro interno do servidor');
            } else {
              console.log('Arquivo JSON criado com sucesso!');
              res.send('Arquivo JSON criado com sucesso!');
            }
          });
        } else {
          console.error('Erro ao ler o arquivo JSON:', err);
          res.status(500).send('Erro interno do servidor');
        }
      } else {
        let existingData = [];
        if (jsonData.length > 0) {
          existingData = JSON.parse(jsonData);
        }
        
        const newId = generateUniqueId();
        const newDataWithId = { id: newId, photo:false, ...newData };
        existingData.push(newDataWithId);
        fs.writeFile(studentFile, JSON.stringify(existingData), (err) => {
          if (err) {
            console.error('Erro ao salvar os dados:', err);
            res.status(500).send('Erro interno do servidor');
          } else {
            console.log('Dados adicionados ao arquivo com sucesso!');
            res.send('Dados adicionados ao arquivo com sucesso!');
          }
        });
      }
    });
});
//update a student
app.put('/student/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
  
    fs.readFile(studentFile, (err, jsonData) => {
      if (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        res.status(500).send('Erro interno do servidor');
      } else {
        let existingData = [];
        if (jsonData.length > 0) {
          existingData = JSON.parse(jsonData);
        }
  
        const dataIndex = existingData.findIndex(item => item.id === id);
  
        if (dataIndex === -1) {
          res.status(404).send('Registro não encontrado');
        } else {
          existingData[dataIndex] = { ...existingData[dataIndex], ...updatedData };
  
          fs.writeFile(studentFile, JSON.stringify(existingData), (err) => {
            if (err) {
              //console.error('Erro ao salvar os dados:', err);
              res.status(500).send('Erro interno do servidor');
            } else {
              //console.log('Dados atualizados com sucesso!');
              res.status(200).send(existingData[dataIndex]);
            }
          });
        }
      }
    });
});
//delete a student
app.delete('/student/:id', (req, res) => {
    const { id } = req.params;
  
    fs.readFile(studentFile, (err, jsonData) => {
      if (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        res.status(500).send('Erro interno do servidor');
      } else {
        let existingData = [];
        if (jsonData.length > 0) {
          existingData = JSON.parse(jsonData);
        }
  
        const filteredData = existingData.filter(item => item.id !== id);
  
        if (filteredData.length === existingData.length) {
          res.status(404).send('Registro não encontrado');
        } else {
          fs.writeFile(studentFile, JSON.stringify(filteredData), (err) => {
            if (err) {
              console.error('Erro ao salvar os dados:', err);
              res.status(500).send('Erro interno do servidor');
            } else {
              console.log('Registro removido com sucesso!');
              res.send('Registro removido com sucesso!');
            }
          });
        }
      }
    });
});
//function to create unique Ids.
function generateUniqueId() {
    const newId = uuidv4();
    return newId;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const id = req.params.id; // Get the ID from the URL parameter
      const directory = path.join(__dirname, 'src', 'labels', id); // Path to the ID folder
  
      // Check if the folder already exists
      if (!fs.existsSync(directory)) {
        // Create the folder if it doesn't exist
        fs.mkdirSync(directory, { recursive: true });
      }
  
      cb(null, directory);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  // Route to receive images
  app.post('/photos/:id', upload.single('imagem'), (req, res) => {
    if (!req.file) {
      res.status(400).send('No image was uploaded');
    } else {
      res.send('Image saved successfully!');
    }
  });

//get images
app.get('/photos/:subfolder/:img', (req, res) => {
    //const imageFilename = req.params.image_filename;
    const subfolder = req.params.subfolder
    const img = req.params.img
    console.log(subfolder)
    //const imagePath = `src/labels/${subfolder}/0.png`;
    const imagePath = path.join(__dirname, 'src/labels', subfolder, `${img}.png`);
    console.log(imagePath)
    res.sendFile(imagePath, (err) => {
        if (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('Image not found');
        } else {
            res.status(500).send('Internal Server Error');
        }
        }
    });
});



app.listen(port, () => {
  console.log(`Servidor em execução em http://localhost:${port}`);
});

