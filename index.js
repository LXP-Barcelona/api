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

app.get('/api/products/info', (req, res) => {
    const maxProduct = database.length;
    res.send({
        max: maxProduct
    })
})

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

//STRIPE
const STRIPE_TEST_KEY = "sk_test_51NwSUtDNLrrLTVOHXibHDuEVNUzEXTJXgVQ1V3ADlMZSTTCt1EDx2iAAHt1EV71wmexPsHKKxikdRaZnTM16DvOA00cYudArVE";
const YOUR_DOMAIN = "http://localhost:8080/frontend";
// This is your test secret API key.
const stripe = require("stripe")(STRIPE_TEST_KEY);


app.post("/create-checkout-session", async (req, res) => {
    console.log("Connecting with Stripe...");
  
    const session = await stripe.checkout.sessions.create({
      line_items: req.body,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });
  
    res.json({ url: session.url });
  });

app.listen(8080, () => console.log(`Server is running in port 8080`));
