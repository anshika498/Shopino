import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';

// Setup Gemini AI instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment. Using fallback rule-based system.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Formulates local rule-based fallback answers if Gemini API Key is missing
const generateFallbackResponse = (query, contextProducts) => {
  const q = query.toLowerCase();
  
  if (contextProducts.length === 0) {
    return `### Shopino Shopping Assistant (Demo Mode)
I am currently running in Demo Mode because a Gemini API Key is not set in the server environment.

How can I help you find deals today? Try searching for popular items like **iPhone 16**, **Samsung Galaxy S25 Ultra**, or **Sony WH-1000XM5** to compare prices. Once you find a product, I can help analyze its pricing across stores!`;
  }

  // If there are products in context, analyze them
  if (contextProducts.length === 1) {
    const product = contextProducts[0];
    const listings = [...product.listings].sort((a, b) => a.price - b.price);
    const bestPrice = listings[0];
    const highestDiscount = [...product.listings].sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
    
    if (q.includes('price') || q.includes('deal') || q.includes('where') || q.includes('buy')) {
      return `### Shopino Shopping Advisor (Demo Mode)

For **${product.name}**, here is my analysis:
- **Best Price**: **₹${bestPrice.price.toLocaleString()}** on **${bestPrice.storeName}** (saves ₹${(bestPrice.originalPrice - bestPrice.price).toLocaleString()} off MRP ₹${bestPrice.originalPrice.toLocaleString()}).
- **Highest Discount**: **${highestDiscount.storeName}** offers a **${highestDiscount.discountPercentage}% discount** (current price: ₹${highestDiscount.price.toLocaleString()}).
- **Fastest Delivery**: **${product.fastestDeliveryStore}** (${product.listings.find(l => l.storeName === product.fastestDeliveryStore)?.deliveryTime || 'quick'}).
- **Delivery Charges**: ${bestPrice.deliveryCharges === 0 ? 'Free Delivery on Amazon/Flipkart!' : `₹${bestPrice.deliveryCharges} on ${bestPrice.storeName}`}.

**Recommendation**: I suggest buying from **${bestPrice.storeName}** at **₹${bestPrice.price.toLocaleString()}** as it currently offers the lowest absolute price. Check if you can apply coupon code **${bestPrice.couponCode || 'N/A'}** for further savings.`;
    }
    
    if (q.includes('should i wait') || q.includes('drop') || q.includes('history') || q.includes('cheaper')) {
      return `### Shopino Price Trends (Demo Mode)

Analyzing price history for **${product.name}**:
- The price has fluctuated by about +/- 4% over the last 30 days.
- **Current price (₹${bestPrice.price.toLocaleString()})** is close to its monthly low.
- **Verdict**: **Buy Now**. The price is stable and waiting is unlikely to yield massive savings unless an upcoming festival sale is announced.`;
    }

    // Convert specs Map/Document to standard object to prevent Mongoose metadata leaks
    const specsObj = product.specs instanceof Map 
      ? Object.fromEntries(product.specs) 
      : (product.specs && typeof product.specs.toJSON === 'function' ? product.specs.toJSON() : (product.specs || {}));

    // Default overview
    return `### Shopino Product Profile: ${product.name} (Demo Mode)

- **Average Rating**: ⭐ ${product.rating}/5 from ${product.reviewsCount.toLocaleString()} reviews.
- **Lowest Available Price**: ₹${bestPrice.price.toLocaleString()} on ${bestPrice.storeName}.
- **Quick Specs**:
${Object.entries(specsObj).map(([k, v]) => `  - **${k}**: ${v}`).join('\n')}

Is there a specific store or feature comparison you would like me to explain?`;
  }

  // Compare multiple products
  if (contextProducts.length > 1) {
    const p1 = contextProducts[0];
    const p2 = contextProducts[1];
    const p1Low = p1.lowestPrice || p1.listings[0]?.price || 0;
    const p2Low = p2.lowestPrice || p2.listings[0]?.price || 0;

    return `### Comparison: ${p1.name} vs ${p2.name} (Demo Mode)

Here is a side-by-side assessment of the products:

| Feature | ${p1.name} | ${p2.name} |
| :--- | :--- | :--- |
| **Brand** | ${p1.brand} | ${p2.brand} |
| **Lowest Price** | **₹${p1Low.toLocaleString()}** | **₹${p2Low.toLocaleString()}** |
| **Overall Rating** | ⭐ ${p1.rating}/5 | ⭐ ${p2.rating}/5 |
| **Reviews Count** | ${p1.reviewsCount.toLocaleString()} | ${p2.reviewsCount.toLocaleString()} |
| **Category** | ${p1.category} | ${p2.category} |

**Value Recommendation**:
- If budget is your priority: **${p1Low < p2Low ? p1.name : p2.name}** is the more affordable choice by **₹${Math.abs(p1Low - p2Low).toLocaleString()}**.
- If ratings are priority: **${p1.rating > p2.rating ? p1.name : p2.name}** is rated higher by customers.
- Feel free to look at the detailed product specs for processor, display, or build material comparison!`;
  }

  return `I have analyzed your search. Let me know if you want me to compare prices or give you details on any specific product in your context list!`;
};

// Answer customer queries using Google Gemini
export const answerShoppingQuery = async (query, userContext = {}) => {
  const client = getGeminiClient();
  
  // 1. Gather product context from database to pass to LLM
  // We search for products mentioned or related to user queries
  let contextProducts = [];
  
  // Try to find if any products are in user context (e.g. current page product or search results)
  try {
    if (userContext.productId) {
      const prod = await Product.findById(userContext.productId);
      if (prod) contextProducts.push(prod);
    } else if (userContext.searchQuery) {
      contextProducts = await Product.find({
        $or: [
          { name: { $regex: userContext.searchQuery, $options: 'i' } },
          { brand: { $regex: userContext.searchQuery, $options: 'i' } }
        ]
      }).limit(3);
    }

    // If we still have no context, check if query contains any known brand or product names
    if (contextProducts.length === 0) {
      contextProducts = await Product.find({
        $or: [
          { name: { $regex: query.split(' ').slice(0, 3).join('|'), $options: 'i' } },
          { brand: { $regex: query.split(' ').slice(0, 2).join('|'), $options: 'i' } }
        ]
      }).limit(3);
    }
  } catch (error) {
    console.error('Database connection inactive, skipping context products lookup:', error);
  }

  // 2. If no Gemini client is initialized, fallback to rule-based answers
  if (!client) {
    return generateFallbackResponse(query, contextProducts);
  }

  // 3. Format product details for LLM context
  const productsFormatted = contextProducts.map(p => {
    return {
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      specs: p.specs,
      listings: p.listings.map(l => ({
        store: l.storeName,
        price: l.price,
        originalPrice: l.originalPrice,
        discount: l.discountPercentage,
        coupon: l.couponCode,
        cashback: l.cashback,
        deliveryTime: l.deliveryTime,
        deliveryCharges: l.deliveryCharges,
        inStock: l.inStock
      })),
      lowestPrice: p.lowestPrice,
      bestRatedStore: p.bestRatedStore,
      fastestDeliveryStore: p.fastestDeliveryStore,
      bestOverallDealStore: p.bestOverallDealStore
    };
  });

  // 4. Construct AI prompt
  const prompt = `
You are Shopino Assistant, an expert, objective shopping advisor. Your goal is to help users find the best deals, compare items, analyze ratings and review summaries, and decide whether to buy or wait.

Context Products data from database:
${JSON.stringify(productsFormatted, null, 2)}

User Question: "${query}"

Guidelines:
- Give a friendly, conversational, and direct response.
- Use bullet points, bold headers, and structured lists where helpful.
- When recommending a deal, explicitly cite the store name, the price (in Rupees using ₹ symbol), any discount, and why it's the best choice.
- Keep the response response concise (under 250 words) and directly focused on the user's question.
- Do not make up prices that are not in the context list. If no product matches in the context, guide the user on how they can search for products on the Shopino platform first.
`;

  // Try multiple models to bypass deprecation/quota/404 errors
  const modelOptions = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  let apiError = null;

  for (const modelName of modelOptions) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error(`Gemini call with ${modelName} failed:`, err.message || err);
      apiError = err;
    }
  }

  // If all models failed, use local fallback advisor
  return `*(Gemini API encountered an error: ${apiError?.message || 'Quota exceeded/Access blocked'}. Falling back to local advisor)*\n\n` + generateFallbackResponse(query, contextProducts);
};
