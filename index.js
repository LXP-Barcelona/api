const express = require('express');
const database = require('./database.json');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
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
    const result = [];
    const ids = id.includes(",") ? id.split(/,/g) : [id];
    console.log(ids);

    for (let i = 0; i < ids.length; i++) {
        try {
            let item = database.find(item => item.id === parseInt(ids[i]));
            if (!item) return res.send("error item");
            item = {
                ...item,
                name: item.name[langParam] || item.name.en,
                description: item.description[langParam] || item.description.en,
                specification: item.specification[langParam] || item.specification.en,
                category: item.category[langParam] || item.category.en,
            };
            result.push(item);
        } catch (_) {
            console.log(_);
        }
    }
    res.send(result);
})

app.listen(8080, () => console.log(`Server is running in port 8080`));

