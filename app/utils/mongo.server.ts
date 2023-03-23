import type { Mongoose } from "mongoose";
import mongoose from "mongoose";

let mongo: Mongoose | any;

declare global {
  var __mongo: Mongoose | undefined;
}

async function connect(dbUri: string) {
  try {
    mongoose.set("strictQuery", true);
    if (!global.__mongo) {
      mongo = await mongoose.connect(dbUri);
    }
    mongo = global.__mongo;
    console.log("Connected to the mongodb database");
  } catch (err: any) {
    console.log(err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

connect(process.env.DATABASE_URL as string);

export { mongo };
