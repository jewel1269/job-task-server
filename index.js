const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB setup
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://jewel1269:ZMrIfyj7hV7DaN7h@cluster0.ueeqib1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const userCollection = client.db('Laptop-shop').collection('users');
        const productCollection = client.db('Laptop-shop').collection('products');

        app.post('/users', async (req, res) => {
            try {
                const users = req.body;
                const { email } = users;
                const existingUser = await userCollection.findOne({ email });
                if (existingUser) {
                    res.send({ message: 'User already exists' });
                    return;
                }
                const result = await userCollection.insertOne(users);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error adding user', error });
            }
        });

       app.get("/products", async (req, res) => {
         try {
           const {
             page = 1,
             limit = 12,
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
           } else if (minPrice) {
             query.price = { $gte: parseFloat(minPrice) };
           } else if (maxPrice) {
             query.price = { $lte: parseFloat(maxPrice) };
           }

           // Sorting options
           let sortOptions = {};
           if (sortBy) {
             sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
           } else {
             sortOptions["creationDate"] = -1;
           }

          
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
           console.error("Error fetching products:", error); 
           res.status(500).send({ message: "Error fetching products", error });
         }
       });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('The server is running........');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

