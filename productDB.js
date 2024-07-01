require("dotenv").config();
const connectDB = require("./db/connect");
const Vas = require("./models/volunteers");

const ProductJson = require("./products.json");

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