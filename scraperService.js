// import { ApifyClient } from 'apify-client';
// import 'dotenv/config';

// const client = new ApifyClient({
//     token: process.env.APIFY_TOKEN,
// });

// // Improved helper to handle strings and numbers correctly
// const parsePrice = (priceStr) => {
//     if (priceStr === undefined || priceStr === null || priceStr === 'N/A') return Infinity;
//     // Remove Rs, commas, and whitespace, then convert to number
//     const numeric = parseInt(priceStr.toString().replace(/[^\d]/g, ''), 10);
//     return isNaN(numeric) ? Infinity : numeric;
// };

// export const getPrices = async (productName) => {
//     try {
//         console.log(`🚀 SastaDost: Searching for "${productName}"...`);

//         const darazInput = { "searchQuery": productName, "maxProducts": 1 }; // Increased for better comparison
//         // const priceOyeInput = { "url": `https://priceoye.pk/search?q=${encodeURIComponent(productName)}` };
//         const telemartInput = { "url": `https://www.telemart.pk/search?query=${encodeURIComponent(productName)}` };

//         // 1. Run Actors in Parallel
//         const [darazRun, priceOyeRun, telemartRun] = await Promise.all([
//             client.actor("shahidirfan/daraz-pk-scraper").call(darazInput),
//             // client.actor("quintuple_karat/priceoye-actor").call(priceOyeInput),
//             client.actor("quintuple_karat/telemart-actor").call(telemartInput),
//         ]);

//         // 2. Fetch Items from Datasets
//         // const [darazRes, priceOyeRes, telemartRes] = await Promise.all([
//         const [darazRes, telemartRes] = await Promise.all([
//             client.dataset(darazRun.defaultDatasetId).listItems(),
//             client.dataset(telemartRun.defaultDatasetId).listItems()
//         ]);
//         // client.dataset(priceOyeRun.defaultDatasetId).listItems(),
//         console.log("telemart response isss: ", telemartRes);

//         // 3. Normalize Daraz Data
//         const darazItems = darazRes.items.map(item => ({
//             store: 'Daraz',
//             title: item.title || item.name || 'Unknown Product',
//             price: item.price || 'N/A',
//             originalPrice: item.originalPrice || item.price || 'N/A',
//             discountTag: item.discount || null,
//             rating: item.ratingScore || item.rating || 0,
//             reviewCount: item.reviewCount || 0,
//             link: item.link || item.productUrl || (item.itemUrl ? `https://www.daraz.pk${item.itemUrl}` : "#"),
//             image: item.image || item.imageUrl || item.mainImage
//         }));

//         // 4. Normalize PriceOye Data (WITH NEW FIELDS)
//         // const priceOyeItems = priceOyeRes.items.map(item => {
//         //     // Calculate savings if not provided by actor but prices exist
//         //     const curr = parsePrice(item.price || item.currentPrice);
//         //     const old = parsePrice(item.originalPrice || item.retailPrice);
//         //     const calculatedSavings = (old !== Infinity && curr !== Infinity && old > curr) ? (old - curr) : null;

//         //     return {
//         //         store: 'PriceOye',
//         //         title: item.name || item.title || 'Unknown Product',
//         //         price: item.price || item.currentPrice || 'N/A',
//         //         originalPrice: item.originalPrice || item.retailPrice || item.price || 'N/A',
//         //         discountTag: item.discountTag || item.discount || null,
//         //         savings: item.savings || calculatedSavings,
//         //         rating: item.rating || 0,
//         //         reviewCount: item.reviewCount || 0,
//         //         link: item.url || item.productUrl || item.link || "#",
//         //         image: item.image || item.imageUrl || item.thumbnail || ""
//         //     };
//         // });

//         // 4. Normalize telemart Data 
//         const telemartItems = telemartRes.items.map(item => {
//             // Calculate savings if not provided by actor but prices exist
//             const curr = parsePrice(item.price || item.currentPrice);
//             const old = parsePrice(item.originalPrice || item.retailPrice);
//             const calculatedSavings = (old !== Infinity && curr !== Infinity && old > curr) ? (old - curr) : null;

//             return {
//                 store: 'telemart',
//                 title: item.name || item.title || 'Unknown Product',
//                 price: item.price || item.currentPrice || 'N/A',
//                 originalPrice: item.originalPrice || item.retailPrice || item.price || 'N/A',
//                 discountTag: item.discountPercentage || item.discount || null,
//                 // savings: item.savings || calculatedSavings,
//                 rating: item.rating || 0,
//                 reviewCount: item.reviewsCount || 0,
//                 link: item.url || item.productUrl || item.link || "#",
//                 image: item.image || item.imageUrl || item.thumbnail || ""
//             };
//         });
//         console.log("telemart items areeee:", telemartItems);
//         console.log(`✅ Final Counts: Daraz (${darazItems.length}) | PriceOye (${priceOyeItems.length})`);

//         // 5. Combine and Sort by Numeric Price
//         const combinedResults = [...darazItems, ...priceOyeItems, ...telemartItems];

//         return combinedResults.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

//     } catch (error) {
//         console.error("❌ Scraper Service Error:", error);
//         throw error;
//     }
// };
////////////////////////////////////
import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

// Helper to convert strings like "Rs. 150,000" into numbers like 150000
const parsePrice = (priceStr) => {
    if (priceStr === undefined || priceStr === null || priceStr === 'N/A') return Infinity;
    const numeric = parseInt(priceStr.toString().replace(/[^\d]/g, ''), 10);
    return isNaN(numeric) ? Infinity : numeric;
};

export const getPrices = async (productName) => {
    try {
        console.log(`🚀 SastaDost: Searching for "${productName}"...`);

        // Prepare inputs for active scrapers
        const darazInput = { "searchQuery": productName, "maxProducts": 1 };
        const telemartInput = { "url": `https://www.telemart.pk/search?query=${encodeURIComponent(productName)}` };
        const priceOyeInput = { "url": `https://priceoye.pk/search?q=${encodeURIComponent(productName)}` };

        // // 1. Run Actors in Parallel (Only 2 active slots)
        // const [darazRun, telemartRun, priceOyeRun] = await Promise.all([
        //     client.actor("shahidirfan/daraz-pk-scraper").call(darazInput),
        //     client.actor("quintuple_karat/telemart-actor").call(telemartInput),
        //     client.actor("quintuple_karat/priceoye-actor").call(priceOyeInput),

        // ]);
        // --- 1. Run Actors with a slight delay between them ---
        const darazRun = await client.actor("shahidirfan/daraz-pk-scraper").call(darazInput);

        // Wait 2 seconds before starting the next one to avoid "Connection Reset"
        await new Promise(resolve => setTimeout(resolve, 2000));
        const telemartRun = await client.actor("quintuple_karat/telemart-actor").call(telemartInput);

        await new Promise(resolve => setTimeout(resolve, 2000));
        const priceOyeRun = await client.actor("quintuple_karat/priceoye-actor").call(priceOyeInput);

        // 2. Fetch Items from Datasets
        const [darazRes, telemartRes, priceOyeRes] = await Promise.all([
            client.dataset(darazRun.defaultDatasetId).listItems(),
            client.dataset(telemartRun.defaultDatasetId).listItems(),
            client.dataset(priceOyeRun.defaultDatasetId).listItems()
        ]);

        // 3. Normalize Daraz Data
        const darazItems = (darazRes.items || []).map(item => ({
            store: 'Daraz',
            title: item.title || item.name || 'Unknown Product',
            price: item.price || 'N/A',
            originalPrice: item.originalPrice || item.price || 'N/A',
            discountTag: item.discount || null,
            rating: item.ratingScore || item.rating || 0,
            reviewCount: item.reviewCount || 0,
            link: item.link || item.productUrl || (item.itemUrl ? `https://www.daraz.pk${item.itemUrl}` : "#"),
            image: item.image || item.imageUrl || item.mainImage
        }));

        // 4. Normalize Telemart Data 
        const telemartItems = (telemartRes.items || []).map(item => {
            const curr = parsePrice(item.price || item.currentPrice);
            const old = parsePrice(item.originalPrice || item.retailPrice);
            const calculatedSavings = (old !== Infinity && curr !== Infinity && old > curr) ? (old - curr) : 0;

            return {
                store: 'Telemart',
                title: item.name || item.title || 'Unknown Product',
                price: item.price || item.currentPrice || 'N/A',
                originalPrice: item.originalPrice || item.retailPrice || item.price || 'N/A',
                discountTag: item.discountPercentage || item.discount || null,
                savings: calculatedSavings,
                rating: item.rating || 0,
                reviewCount: item.reviewsCount || 0,
                link: item.url || item.productUrl || item.link || "#",
                image: item.image || item.imageUrl || item.thumbnail || ""
            };
        });

        //   4. Normalize PriceOye Data (WITH NEW FIELDS)
        const priceOyeItems = priceOyeRes.items.map(item => {
            // Calculate savings if not provided by actor but prices exist
            const curr = parsePrice(item.price || item.currentPrice);
            const old = parsePrice(item.originalPrice || item.retailPrice);
            const calculatedSavings = (old !== Infinity && curr !== Infinity && old > curr) ? (old - curr) : null;

            return {
                store: 'PriceOye',
                title: item.name || item.title || 'Unknown Product',
                price: item.price || item.currentPrice || 'N/A',
                originalPrice: item.originalPrice || item.retailPrice || item.price || 'N/A',
                discountTag: item.discountTag || item.discount || null,
                savings: item.savings || calculatedSavings,
                rating: item.rating || 0,
                reviewCount: item.reviewCount || 0,
                link: item.url || item.productUrl || item.link || "#",
                image: item.image || item.imageUrl || item.thumbnail || ""
            };
        });

        console.log(`✅ Final Counts: Daraz (${darazItems.length}) | Telemart (${telemartItems.length})
            | PriceOye (${priceOyeItems.length})`);

        // 5. Combine and Sort by Lowest Price First
        const combinedResults = [...darazItems, ...telemartItems, ...priceOyeItems];

        return combinedResults.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

    } catch (error) {
        console.error("❌ Scraper Service Error:", error);
        throw error;
    }
};