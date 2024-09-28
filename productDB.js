require("dotenv").config(); // Loading environment variables from .env file into process.env
const connectDB = require("./db/connect");
const Vas = require("./models/volunteers");
const ProductJson = require("./products.json");

// Function to initialize the server and populate the database
const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);
        await Vas.create(ProductJson);
        console.log("Success");
    } catch (error) {
        console.log(error);
    }
};


start();