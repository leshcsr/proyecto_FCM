
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI;

async function connectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(err) {
    // Ensures that the client will close when you finish/error
    console.error("Error connecting to MongoDB:", err);
  }
}
module.exports = connectDB;

