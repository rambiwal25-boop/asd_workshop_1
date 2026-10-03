const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const server = express();

const filePath = path.join(__dirname, 'db.json');

server.use(express.json());

async function readData() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

async function writeData(data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing file:', err);
    }
}

server.get('/', async (req, res) => {
    const data = await readData();
    res.json(data);
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});