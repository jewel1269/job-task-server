const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cors())
// app.use(express.static("public"));

// mongodb data  [change this data]
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = "mongodb+srv://jewel1269:ZMrIfyj7hV7DaN7h@cluster0.ueeqib1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const userCollection = client.db('best-outfit').collection('users')
        const productCollection = client.db('best-outfit').collection('products')

        app.post('/users', async (req, res) => {
            const users = req.body;
            const {email, name} = users;
            console.log(users);
            const existingUser = await userCollection.findOne({ email });
            if (existingUser) {
                res.send({message: 'user already exist'})
                return;
            }
            const result = await userCollection.insertOne(users);
            res.send(result)
        })

        
    app.get("/products", async (req, res) => {
        try {
          // all things here
          const {
            page = 1,
            limit = 10,
            search = "",
            brand,
            category,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder = "asc",
          } = req.query;
  
          // Build the query object for filtering
          let query = {};
  
          if (search) {
            query.productName = { $regex: search, $options: "i" };
          }
          if (brand) {
            query.brandName = brand;
          }
          if (category) {
            query.category = category;
          }
          if (minPrice && maxPrice) {
            query.price = {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            };
          }
  
          // Sorting options
          let sortOptions = {};
          if (sortBy) {
            sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
          } else {
            sortOptions["creationDate"] = -1;
          }
  
          // Pagination options
          const skip = (page - 1) * limit;
  
          const products = await productCollection
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();
  
          const totalProducts = await productCollection.countDocuments(query);
  
          res.send({
            products,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: parseInt(page),
          });
        } catch (error) {
          res.status(500).send({ message: "Error fetching products", error });
        }
      });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('the server is running........')
})
app.listen(port, () => {
    console.log(`the server: ${port}`);
})
