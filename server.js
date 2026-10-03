const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const server = express();

const filePath = path.join(__dirname, 'db.json');

const { cacheWare, invalidateCache } = require('./middleware/cache');

// middleware
server.use(cacheWare);
server.use(invalidateCache);

server.use(express.json());

// services

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

async function getProducts() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return await readData();
}

async function getProductById(id) {
    const products = await getProducts();
    return products.find((prod) => prod.id == id);
}

async function createProduct(productData) {
    const products = await readData();

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...productData };
    
    products.push(newProduct);
    await writeData(products);
    return newProduct;
}

async function updateProduct(id, productData, isPatch = false) {
    const products = await readFile();
    const index = products.findIndex((prod) => prod.id == id);
    
    if (index === -1) return null;

    if (isPatch) {

        products[index] = { ...products[index], ...productData };
    } else {

        products[index] = { id: Number(id), ...productData };
    }
    await writeFile(products);
    return products[index];
}

async function deleteProduct(id) {
    const products = await readFile();
    const index = products.findIndex((prod) => prod.id == id);
    
    if (index === -1) return false;

    products.splice(index, 1); 
    await writeFile(products);
    return true;
}


// urls

server.get('/', async (req, res) => {
    const data = await readData();
    res.json(data);
});

server.get('/:id', async (req, res) => {
    const id = req.params.id;
    const product = await getProductById(id);
    res.json(product);
});

server.post('/', async (req, res) => {
    const productData = req.body;
    const newProduct = await createProduct(productData);
    res.status(201).json(newProduct);
});

server.put('/:id', async (req, res) => {
    const id = req.params.id;
    const productData = req.body;
    const updatedProduct = await updateProduct(id, productData, false);
    
    if (updatedProduct) {
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

server.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const productData = req.body;
    const updatedProduct = await updateProduct(id, productData, true);
    
    if (updatedProduct) {
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

server.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const success = await deleteProduct(id);
    
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Running the server

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});