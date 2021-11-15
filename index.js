const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qurrs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db('camera_shop');
      const productCollection = database.collection('products');
      const userOrderCollection = database.collection('orders');
      const addReviewCollection = database.collection('add_review');
      const usersCollection = database.collection('users');

      // GET products
      app.get('/products' , async(req , res)=>{
        const cursor = productCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
    });

      // POST Orders API
      app.post('/userorders' , async(req , res)=>{
        // console.log(req.body);
        const result = await userOrderCollection.insertOne(req.body);
        res.send(result);
    });

    // Get MY ORDERS
    app.get('/myorders/:email' , async(req , res)=>{
      const result = await userOrderCollection.find({email: req.params.email}).toArray();
      res.send(result);
    });

    // MANAGE ALL ORDERS
    app.get('/manageallorders' , async(req , res)=>{
      const cursor = userOrderCollection.find({});
      const allOrders = await cursor.toArray();
      res.send(allOrders);
  });

    // Delete Order
    app.delete("/deleteorder/:id" , async(req , res)=>{
      // console.log(req.params);
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await userOrderCollection.deleteOne(query);
      res.json(result);
  });
  
  // UPDATE pending
  app.put('/updateorder/:id' , async(req , res)=>{
      const id = req.params.id;
      const updatedorder = req.body;
      const filter ={ _id: ObjectId(id)};
      const updateDoc = {
          $set:{
              status: "Confirmed",
          },
      };
      const result = await userOrderCollection.updateOne(filter , updateDoc);
      res.json(result);
  });

  // ADD REVIEW
  app.post('/addreviews' , async(req , res)=>{
    console.log(req.body);
    const result = await addReviewCollection.insertOne(req.body);
    res.send(result);
  });

  // SHOW/GET REVIEW
  app.get('/showreviews' , async(req , res)=>{
    const cursor = addReviewCollection.find({});
    const result = await cursor.toArray();
    res.send(result);
});
  // POST USERS
  app.post('/users' , async(req ,res)=>{
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.json(result);
});
  // GET USERS BY EMAIL and if ADMIN
  app.get('/users/:email', async(req ,res)=>{
    const email = req.params.email;
    const query = { email : email};
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin = true;
    }
    res.json({ admin : isAdmin });
  } );
  // USERS insert or update
  app.put('/users' , async(req , res)=>{
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert : true};
    const updateDoc = {$set: user};

    const result =await usersCollection.updateOne(filter , updateDoc , options);
    res.json(result);

  });
  // MAKE ADMIN
  app.put('/users/admin' , async(req , res)=>{
    const user = req.body;
    const filter = {email : user.email};
    const updateDoc = {$set : {role : 'admin'}};
    const result = await usersCollection.updateOne(filter , updateDoc);
    res.json(result);
  } );

  // Add PRODUCTS
  app.post('/addproducts' , async(req , res)=>{
    // console.log(req.body);
    const result = await productCollection.insertOne(req.body);
    res.send(result);
});

  // DELETE PRODUCT
  app.delete("/deleteproduct/:id" , async(req , res)=>{
    // console.log(req.params);
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await productCollection.deleteOne(query);
    res.json(result);
});




    } 
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello');
  })
  
  app.listen(port, () => {
    console.log(`listening at ${port}`);
  })