import mongoose from "mongoose";
import destinationSchema from "./DestinationModels.js";


export const Adventure = mongoose.model("Adventure", destinationSchema, "adventure");
export const Beaches = mongoose.model("Beaches", destinationSchema, "beaches");
export const City = mongoose.model("City", destinationSchema, "city");
export const NatureBeauty = mongoose.model("NatureBeauty", destinationSchema, "nature_beauty");
export const HistoricalAndCultural = mongoose.model("HistoricalAndCultural", destinationSchema, "historical_and_cultural" );
