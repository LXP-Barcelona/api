const express = require('express');
const database = require('./database.json');

const app = express();

app.use(express.json());

app.get('/api/products', (req, res) => {
    const langParam = req.query['lang'] || "en";
    const result = database.map(item => ({
        ...item,
        name: item.name[langParam] || item.name.en,
        description: item.description[langParam] || item.description.en,
        specification: item.specification[langParam] || item.specification.en,
        category: item.category[langParam] || item.category.en,
    }));
    res.send(result);
});

app.get('/api/product/:id', (req, res) => {
    const id = req.params["id"];
    const langParam = req.query['lang'] || "en";
    if (!id) return res.send("error id");
    try {
        let item = database.find(item => item.id === parseInt(id));
        if (!item) return res.send("error item");
        item = {
            ...item,
            name: item.name[langParam] || item.name.en,
            description: item.description[langParam] || item.description.en,
            specification: item.specification[langParam] || item.specification.en,
            category: item.category[langParam] || item.category.en,
        };
        res.send(item);
    } catch (_) {
        console.log(_);
        res.send('id is not number')
    }
    
})

app.listen(8080, () => console.log(`Server is running in port 8080`));
