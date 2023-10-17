const express = require('express');
const database = require('./database.json');
const cors = require('cors');
const STRIPE_TEST_KEY = "sk_test_51NwSUtDNLrrLTVOHXibHDuEVNUzEXTJXgVQ1V3ADlMZSTTCt1EDx2iAAHt1EV71wmexPsHKKxikdRaZnTM16DvOA00cYudArVE";
const stripe = require("stripe")(STRIPE_TEST_KEY);

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

app.post("/create-checkout-session", async (req, res) => {
  if (!req.body) return res.send('pas de body');
  const langParam = req.query['lang'] || "en";
  const items = req.body.map(item => {
    const itemDatabase = database.find(i => i.id === item.id);
    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: itemDatabase.name[langParam] || itemDatabase.name.en,
          images: [itemDatabase.image]
        },
        unit_amount: itemDatabase.price * 100
      },
      quantity: item.amount
    }
  });
   const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items,
    mode: "payment",
    success_url: `https://sensorial.vercel.app/code/payment/success.html`,
    cancel_url: `https://sensorial.vercel.app/code/payment/cancel.html`,
  });
  
  res.json({ url: session.url });
});

app.listen(8080, () => console.log(`Server is running in port 8080`));
