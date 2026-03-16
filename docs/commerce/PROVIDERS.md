# Commerce product providers (major retailers)

**Current recommendation feature:** The home page uses **Style insights** (wardrobe gaps, complete-the-look tips, style/occasion pairing advice) — text-only, no product catalog or APIs required. See [IMPLEMENTATION.md](./IMPLEMENTATION.md).

The providers below are for **optional** external product suggestions (e.g. “Suggested for your wardrobe” with product links). They are not required for Style insights. OutfAI pulls **live product data only** from configured sources. No mock or fake catalogs. If a source is not configured or fails, the app surfaces that explicitly.

## Provider order

The system tries providers in this order until one returns products:

1. **Amazon** (Product Advertising API 5.0)
2. **Walmart** (Affiliate API)
3. **Macy's** (Catalog API – partner access)
4. **Best Buy** (Developer API)
5. **JSON feed** (configurable URL)

## 1. Amazon

- **API:** [Product Advertising API 5.0 (PA-API)](https://webservices.amazon.com/paapi5/documentation/).  
  _Note: PA-API is deprecated April 2026; migrate to [Creators API](https://affiliate-program.amazon.com/creatorsapi/docs) when ready._
- **Requirements:** Amazon Associates account and PA-API approval; then access key, secret key, and partner (associate) tag.
- **Env vars:**
  - `AMAZON_ACCESS_KEY` – PA-API access key
  - `AMAZON_SECRET_KEY` – PA-API secret key
  - `AMAZON_PARTNER_TAG` – Associate tag (e.g. `yourapp-20`)
- **Setup:** [Register for Associates](https://affiliate-program.amazon.com/) and [request PA-API access](https://webservices.amazon.com/paapi5/documentation/). Use `SearchIndex=All` (or `Fashion` where supported) for apparel-related queries.

## 2. Walmart

- **API:** [Walmart Affiliate (Open) API](https://www.walmart.io/reference). Product lookup and (where available) search; exact endpoints can depend on your affiliate network (e.g. Impact).
- **Requirements:** [Walmart Affiliate Program](https://affiliates.walmart.com/) and API registration at [walmart.io](https://www.walmart.io/). RSA key pair for signed requests.
- **Env vars:**
  - `WALMART_PUBLISHER_ID` – Your publisher/affiliate ID (required)
  - `WALMART_CONSUMER_ID` – Consumer ID from walmart.io (for signed requests)
  - `WALMART_PRIVATE_KEY` – PEM private key for request signing (for signed requests)
- **Setup:** Create an application at walmart.io, generate an RSA key pair, upload the public key, and use the private key in `WALMART_PRIVATE_KEY`. If your affiliate network exposes a different search/browse endpoint, you can use `COMMERCE_FEED_URL` with a feed that proxies or mirrors that data.

## 3. Macy's

- **API:** [Macy's Developer API](https://developer.macys.com/) (Catalog Services, e.g. Category Browse Product v3).
- **Requirements:** **Approved Macy's partner.** API keys are only for pre-approved partners.
- **Env vars:**
  - `MACYS_API_KEY` – 24-character API key (x-macys-webservice-client-id)
- **Setup:** Register at [developer.macys.com](https://developer.macys.com/) and request API access. Access is granted at Macy's discretion.

## 4. Best Buy

- **API:** [Best Buy Developer API](https://developer.bestbuy.com/) (product search).
- **Requirements:** Free API key from the Best Buy Developer portal.
- **Env vars:**
  - `BEST_BUY_API_KEY` – Best Buy API key
- **Setup:** [Sign up](https://developer.bestbuy.com/) and create an app to get an API key. Best Buy’s catalog is electronics-focused; apparel results may be limited.

## 5. JSON feed (generic)

- **Source:** Any HTTPS URL that returns JSON (array of products or `{ "products": [] }`).
- **Env vars:**
  - `COMMERCE_FEED_URL` – Full URL to the JSON feed
- **Expected shape:** Each item must have at least `name` and `productUrl`. Optional: `id`, `category`, `price`, `currency`, `imageUrl`, `brand`, `retailer`, `affiliateUrl`, etc. Used for partner/affiliate feeds or when you host a normalized feed yourself.

## Behavior when no provider is configured

- If **no** provider has the required env vars set, the product recommendation API returns:
  - `recommendations: []`
  - `providerStatus: { available: false, reason: "...", code: "UNAVAILABLE" }`
- The UI can show a clear message (e.g. “Product suggestions require a configured retailer. None are available right now.”) and must **not** show fake or mock product cards.

## Security

- Keep all keys and secrets in environment variables or a secrets manager; never in client code or repo.
- Provider code runs only on the server; outbound requests use server-side env vars only.
