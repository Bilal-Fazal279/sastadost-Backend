import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log("ANON Key Check:", process.env.SUPABASE_ANON_KEY); // Add this line
// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

app.get('/api/search', async (req, res) => {
    const { q, sort, limit } = req.query;

    if (!q) return res.status(400).json({ error: "Search query required" });

    try {
        // Build the query
        let dbQuery = supabase
            .from('product') // Ensure your table is named 'products'
            .select('*')
            .ilike('name', `%${q}%`); // Case-insensitive partial match

        // Apply sorting (Low to High is best for 'Sasta' searches)
        if (sort === 'price_low') {
            dbQuery = dbQuery.order('price', { ascending: true });
        } else if (sort === 'price_high') {
            dbQuery = dbQuery.order('price', { ascending: false });
        }

        // Apply limit to prevent crashing the frontend with 1000s of rows
        dbQuery = dbQuery.limit(limit || 50);

        const { data, error } = await dbQuery;

        if (error) throw error;

        res.json(data);
        console.log("DATA is:", data);
    } catch (error) {
        console.error("Search Error:", error.message);
        console.dir(error);
        res.status(500).json({ error: "Database search failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SastaDost Server: http://localhost:${PORT}`);
});

module.exports = app;