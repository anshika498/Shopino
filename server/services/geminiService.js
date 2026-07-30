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

// Mock Policy Document for RAG
const MOCK_POLICY_DOCUMENT = `
Shopino Policies & FAQ:
1. Return Policy: You can return most items within 30 days of delivery. Electronics have a 14-day return window. Items must be in original condition.
2. Shipping: Standard shipping takes 3-5 business days. Expedited shipping takes 1-2 days. Free shipping on orders over ₹1000.
3. Refunds: Refunds are processed within 5-7 business days after the returned item is received.
4. Warranty: Most electronics come with a 1-year manufacturer warranty. Check product details for specifics.
5. Price Match: Shopino automatically finds the lowest prices across Amazon, Flipkart, etc. We do not price match outside these platforms.
6. Support: Contact support@shopino.com for help.
`;

// Semantic Router: Classify Intent
const classifyQuery = async (query, client) => {
  if (!client) return 'PRODUCT_SEARCH';
  const prompt = `Classify the following user query into one of three categories:
1. CHITCHAT: General conversation, greetings, how are you, thanks, ok, etc.
2. POLICY_SEARCH: Questions about returns, shipping, refunds, warranty, or company policies.
3. PRODUCT_SEARCH: Questions about buying, prices, product features, comparisons, finding deals, or anything related to shopping for items.

Query: "${query}"

Respond with ONLY ONE WORD: CHITCHAT, POLICY_SEARCH, or PRODUCT_SEARCH.`;
  
  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().toUpperCase();
    
    // Clean up any potential markdown or extra punctuation
    text = text.replace(/[^A-Z_]/g, '');
    
    if (['CHITCHAT', 'POLICY_SEARCH', 'PRODUCT_SEARCH'].includes(text)) {
      console.log(`[Semantic Router] Classified query as: ${text}`);
      return text;
    }
    return 'PRODUCT_SEARCH';
  } catch (error) {
    console.error('[Semantic Router] Error classifying, falling back to PRODUCT_SEARCH');
    return 'PRODUCT_SEARCH';
  }
};

// Chitchat Handler
const handleChitchat = async (query, chatHistory, client) => {
  if (!client) return "Hello! I'm Shopino AI. How can I help you today?";
  const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');
  const prompt = `You are a friendly Shopino Shopping Assistant. Respond to the user's chitchat naturally and nicely. Keep it brief.
Chat History:
${historyText}
User: ${query}
Assistant:`;
  
  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    return "Hello! I'm your Shopino assistant.";
  }
};

// Policy Search Handler (Mock RAG)
const handlePolicySearch = async (query, chatHistory, client) => {
  if (!client) return "Please check our Help Center for policies.";
  const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');
  const prompt = `You are the Shopino Support Assistant. Answer the user's question using ONLY the policy document below. If the answer is not in the document, say you don't know and direct them to support@shopino.com.

Policy Document:
${MOCK_POLICY_DOCUMENT}

Chat History:
${historyText}

User Question: ${query}
Answer:`;
  
  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    return "I cannot fetch the policy right now. Please email support@shopino.com.";
  }
};

// Product Search Handler
const handleProductSearch = async (query, userContext, chatHistory, client) => {
  // 1. Gather product context from database
  let contextProducts = [];
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

    // Try finding products by query words (excluding generic words to avoid random matches)
    if (contextProducts.length === 0) {
      // Very basic keyword extraction for demo purposes
      const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3 && !['what', 'where', 'best', 'cheap', 'show', 'find'].includes(w));
      if (words.length > 0) {
        contextProducts = await Product.find({
          $or: [
            { name: { $regex: words.slice(0, 3).join('|'), $options: 'i' } },
            { brand: { $regex: words.slice(0, 2).join('|'), $options: 'i' } },
            { category: { $regex: words.slice(0, 2).join('|'), $options: 'i' } }
          ]
        }).limit(3);
      }
    }
  } catch (error) {
    console.error('Database connection inactive, skipping context products lookup:', error);
  }

  if (!client) {
    return generateFallbackResponse(query, contextProducts);
  }

  // 2. Format product details
  const productsFormatted = contextProducts.map(p => {
    return {
      name: p.name,
      brand: p.brand,
      category: p.category,
      rating: p.rating,
      lowestPrice: p.lowestPrice,
      listings: p.listings.map(l => ({
        store: l.storeName,
        price: l.price,
        discount: l.discountPercentage
      }))
    };
  });

  const historyText = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');

  // 3. Construct AI prompt with conversational memory
  const prompt = `You are Shopino Assistant, an expert shopping advisor. Help users find best deals, compare items, and decide.

Context Products data from database:
${JSON.stringify(productsFormatted, null, 2)}

Chat History:
${historyText}

User Question: "${query}"

Guidelines:
- Give a friendly, conversational, and direct response.
- Rely heavily on the context products. If a product was mentioned in Chat History, assume the user is still talking about it.
- Keep the response concise (under 200 words).
- If no context products match and history has no relevant product, guide the user to search the platform.`;

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
      console.error(`Gemini product search with ${modelName} failed:`, err.message || err);
      apiError = err;
    }
  }

  return `*(Gemini API error: ${apiError?.message}). Falling back to local advisor.*\n\n` + generateFallbackResponse(query, contextProducts);
};

// Answer customer queries using Google Gemini (Main Orchestrator)
export const answerShoppingQuery = async (query, userContext = {}, chatHistory = []) => {
  const client = getGeminiClient();
  
  // 1. Route the query using our Semantic Router
  const intent = await classifyQuery(query, client);
  
  // 2. Delegate to the specific handler based on intent classification
  switch (intent) {
    case 'CHITCHAT':
      return handleChitchat(query, chatHistory, client);
      
    case 'POLICY_SEARCH':
      return handlePolicySearch(query, chatHistory, client);
      
    case 'PRODUCT_SEARCH':
    default:
      return handleProductSearch(query, userContext, chatHistory, client);
  }
};

// Recommend related or alternative products using Gemini
export const getRecommendedProducts = async (targetProduct, candidates) => {
  const client = getGeminiClient();
  if (!client) return null;

  const candidatesFormatted = candidates.map(c => ({
    id: c._id.toString(),
    name: c.name,
    brand: c.brand,
    category: c.category,
    description: c.description,
    price: c.lowestPrice || (c.listings && c.listings[0] ? c.listings[0].price : 0)
  }));

  const prompt = `
You are Shopino AI Recommendation Assistant.
Given a target product, recommend the top 3 best matching options from the candidate products list.
These can be direct alternatives (similar products) or complementary items.

Target Product:
Name: \${targetProduct.name}
Brand: \${targetProduct.brand}
Category: \${targetProduct.category}
Description: \${targetProduct.description}
Price: \${targetProduct.lowestPrice || (targetProduct.listings && targetProduct.listings[0] ? targetProduct.listings[0].price : 0)}

Candidate Products:
\${JSON.stringify(candidatesFormatted, null, 2)}

Instructions:
1. Select exactly 3 products (or fewer if fewer candidates are provided) from the Candidate Products list.
2. For each recommended product, write a single-sentence recommendation reasoning explaining why it matches/recommends relative to the Target Product (e.g. "A budget-friendly option from \${targetProduct.brand}", or "A high-end alternative with similar specifications").
3. Return ONLY a valid JSON array of objects, with no markdown code fence or extra text. Each object must have these exact keys:
   - "id": (string, must exactly match the candidate's id)
   - "reason": (string, 1-sentence recommendation reason)

Format:
[
  { "id": "candidate_id_1", "reason": "Reason why candidate 1 is recommended." },
  ...
]
`;

  const modelOptions = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.5-flash'
  ];

  for (const modelName of modelOptions) {
    try {
      const model = client.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(text);
    } catch (err) {
      console.error(`Gemini recommendation call with ${modelName} failed:`, err.message || err);
    }
  }
  return null;
};
