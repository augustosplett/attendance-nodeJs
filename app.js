const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const studentFile = 'src/data/student.json'
const app = express();
const port = 3000;


app.use(express.json());

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
              console.error('Erro ao salvar os dados:', err);
              res.status(500).send('Erro interno do servidor');
            } else {
              console.log('Dados atualizados com sucesso!');
              res.send('Dados atualizados com sucesso!');
            }
          });
        }
      }
    });
});

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

function generateUniqueId() {
    const newId = uuidv4();
    return newId;
}

app.listen(port, () => {
  console.log(`Servidor em execução em http://localhost:${port}`);
});