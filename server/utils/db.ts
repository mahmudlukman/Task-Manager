require("dotenv").config();
import mongoose from "mongoose";

const dbUrl: string = process.env.DB_URL || "";
const port = process.env.PORT || 8000;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`);
      console.log(`Swagger Docs available at http://localhost:${port}/docs`);
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
