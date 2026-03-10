const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.post('/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an assistant that extracts installment sale data from free text. 
Return ONLY valid JSON with these fields (use null if not found):
{
  "customer_name": string,
  "product_name": string,
  "product_category": string|null,
  "total_price": number|null,
  "deposit": number|null,
  "installment_period": number|null,
  "installment_amount": number|null
}`
            },
            { role: 'user', content: text }
          ],
          temperature: 0,
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
      return res.json(parsed);
    } catch (e) {
      // fall through to rule-based
    }
  }

  // Rule-based fallback parser
  const result = {
    customer_name: null,
    product_name: null,
    product_category: null,
    total_price: null,
    deposit: null,
    installment_period: null,
    installment_amount: null,
  };

  const priceMatch = text.match(/(\d[\d,]*(?:\.\d+)?)\s*(?:EGP|جنيه|LE|pound)/i);
  if (priceMatch) result.total_price = parseFloat(priceMatch[1].replace(',', ''));

  const depositMatch = text.match(/(?:deposit|advance|paid|دفع)\s*[:\s]*(\d[\d,]*(?:\.\d+)?)/i);
  if (depositMatch) result.deposit = parseFloat(depositMatch[1].replace(',', ''));

  const periodMatch = text.match(/(\d+)\s*(?:months?|شهر|أشهر)/i);
  if (periodMatch) result.installment_period = parseInt(periodMatch[1]);

  const installMatch = text.match(/(?:each|monthly|installment|قسط)[:\s]*(\d[\d,]*(?:\.\d+)?)/i);
  if (installMatch) result.installment_amount = parseFloat(installMatch[1].replace(',', ''));

  const nameMatch = text.match(/^([A-Za-z\u0600-\u06FF]+(?:\s+[A-Za-z\u0600-\u06FF]+)?)/);
  if (nameMatch) result.customer_name = nameMatch[1].trim();

  const productWords = ['shirt', 'phone', 'laptop', 'tv', 'sofa', 'dress', 'فستان', 'جهاز', 'تلفزيون', 'كنبة', 'موبايل'];
  for (const word of productWords) {
    if (text.toLowerCase().includes(word)) { result.product_name = word; break; }
  }
  if (!result.product_name) {
    const prodMatch = text.match(/(?:purchased?|bought?|sold?)\s+(?:a\s+)?([a-z\u0600-\u06FF]+(?:\s+[a-z\u0600-\u06FF]+)?)/i);
    if (prodMatch) result.product_name = prodMatch[1];
  }

  res.json(result);
});

module.exports = router;
