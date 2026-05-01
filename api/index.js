import express from 'express';
import cors from 'cors'; // Fixed: Now using import
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const corsOptions = {
    origin: ['https://sastadost-frontend.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/search', async (req, res) => {
    const { q, sort, limit } = req.query;

    if (!q) return res.status(400).json({ error: "Search query required" });

    try {
        let dbQuery = supabase
            .from('product')
            .select('*')
            .ilike('name', `%${q}%`);

        if (sort === 'price_low') {
            dbQuery = dbQuery.order('price', { ascending: true });
        } else if (sort === 'price_high') {
            dbQuery = dbQuery.order('price', { ascending: false });
        }

        dbQuery = dbQuery.limit(limit || 50);

        const { data, error } = await dbQuery;

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Database search failed" });
    }
});

// For local testing
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 SastaDost Server: http://localhost:${PORT}`);
    });
}

// Fixed: Vercel needs "export default" instead of "module.exports"
export default app;