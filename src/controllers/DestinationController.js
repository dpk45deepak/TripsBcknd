import {
    Adventure,
    Beaches,
    City,
    NatureBeauty,
    HistoricalAndCultural,
} from "../models/index.js";

const collectionsMap = {
    adventure: Adventure,
    beaches: Beaches,
    city: City,
    nature_beauty: NatureBeauty,
    historical_and_cultural: HistoricalAndCultural,
};

// Helper: get the right model safely
const getModel = (type) => {
    const model = collectionsMap[type?.toLowerCase()];
    if (!model) throw new Error(`Invalid collection type: ${type}`);
    return model;
};

// Fetch destination by ID
export const getDestinationById = async (req, res) => {
    try {
        const { type, id } = req.params; // e.g. /api/destinations/adventure/30
        const Model = getModel(type);

        const destination = await Model.findOne({ id: Number(id) });
        if (!destination)
            return res
                .status(404)
                .json({ success: false, message: `No record found with ID ${id}` });

        res.status(200).json({ success: true, data: destination });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Filter by name, country, region
export const getDestinationsByFilter = async (req, res) => {
    try {
        // debug: show what came in
        console.log('getDestinationsByFilter params:', req.params, 'query:', req.query);

        // prefer path param but fallback to query param for compatibility
        let { type } = req.params;
        if (!type) type = req.query.type;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Missing collection type. Use route: /destinations/:type/search or include ?type=beaches",
            });
        }

        const { name, country, region } = req.query;
        const Model = getModel(type);

        const query = {};
        if (name) query.name = { $regex: new RegExp(name, "i") };
        if (country) query.country = { $regex: new RegExp(country, "i") };
        if (region) query.region = { $regex: new RegExp(region, "i") };

        const results = await Model.find(query);
        if (!results.length)
            return res
                .status(404)
                .json({ success: false, message: "No matching destinations found" });

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Filter by best time to visit
export const getDestinationsByBestTime = async (req, res) => {
    try {
        const { type } = req.params; // e.g. /api/destinations/city/best-time-to-visit?month=December
        const { month } = req.query;
        const Model = getModel(type);

        if (!month)
            return res
                .status(400)
                .json({ success: false, message: "Please provide a month" });

        const results = await Model.find({
            best_time_to_visit: { $regex: new RegExp(month, "i") },
        });

        if (!results.length)
            return res.status(404).json({
                success: false,
                message: `No destinations found for ${month}`,
            });

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Create, Update, Delete, and Get all collections

export const CreateDestination = async (req, res) => {
    try {
        const data = req.body;
        const { type } = data;
        if (!type) return res.status(400).json({ success: false, message: "Missing 'type' in request body" });

        const Model = getModel(type);
        // remove type from data to avoid storing it in the document unless desired
        const { type: _t, ...payload } = data;

        const created = await Model.create(payload);
        res.status(201).json({ success: true, data: created });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const UpdateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { type } = data;
        if (!type) return res.status(400).json({ success: false, message: "Missing 'type' in request body" });

        const Model = getModel(type);
        const { type: _t, ...updateData } = data;

        const updated = await Model.findOneAndUpdate(
            { id: Number(id) },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: `No record found with ID ${id}` });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const DeleteDestination = async (req, res) => {
    try {
        const { id } = req.params;
        // accept type via query or body if provided; otherwise attempt to find & delete across collections
        const type = req.query.type || req.body?.type;

        if (type) {
            const Model = getModel(type);
            const deleted = await Model.findOneAndDelete({ id: Number(id) });
            if (!deleted) return res.status(404).json({ success: false, message: `No record found with ID ${id} in ${type}` });
            return res.status(200).json({ success: true, message: `Deleted ID ${id} from ${type}` });
        }

        // No type provided: try each collection until found
        for (const [key, Model] of Object.entries(collectionsMap)) {
            const deleted = await Model.findOneAndDelete({ id: Number(id) });
            if (deleted) return res.status(200).json({ success: true, message: `Deleted ID ${id} from ${key}` });
        }

        res.status(404).json({ success: false, message: `No record found with ID ${id}` });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const GetDestinations = async (req, res) => {
    try {
        const entries = Object.entries(collectionsMap);
        const resultsPerCollection = await Promise.all(
            entries.map(([key, Model]) =>
                Model.find().lean().exec().then(docs => docs.map(d => ({ ...d, collection: key })))
            )
        );

        const all = resultsPerCollection.flat();
        if (!all.length) return res.status(404).json({ success: false, message: "No destinations found" });

        res.status(200).json({ success: true, count: all.length, data: all });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const GetDestinationsByType = async (req, res) => {
    try {
        const { type } = req.params; // e.g. /api/destinations/beaches
        const Model = getModel(type);
        const results = await Model.find().lean().exec();
        if (!results.length) return res.status(404).json({ success: false, message: `No ${type} destinations found` });

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};