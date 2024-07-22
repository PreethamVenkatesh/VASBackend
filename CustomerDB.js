require("dotenv").config();
const connectDB = require("./db/connect");
const Cust = require("./models/customer");

const CustomerJson = require("./customer.json");

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);
        await Cust.create(CustomerJson);
        console.log("Success");
    } catch (error) {
        console.log(error);
    }
};


start();