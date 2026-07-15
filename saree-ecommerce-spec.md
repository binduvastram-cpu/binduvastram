# Saree Business E-Commerce Website — Product Spec

> **Note to Claude (implementer):** A v0.dev-generated Next.js template has already been downloaded and exists in this project. **Do not rebuild from scratch.** Audit the existing template's file structure, components, and styling first, then modify/extend it to match this spec. Reuse existing components wherever they're close to what's needed; only replace what doesn't fit. Stack: Next.js (App Router), Supabase (DB + Auth + Storage), deployed on Vercel.

---

## 1. Business Context

Ethnic wear e-commerce for a saree business selling:
1. Sarees
2. Men's wear
3. Women's wear / dresses
4. Ready-made blouses
5. Jewellery
6. Hand bags
7. Saree petticoats

Target customer: primarily mobile-browsing Indian shoppers, many not highly tech-savvy — flow must be simple, visual, and low-friction.

---

## 2. Core Principle: Don't Ask for Customer Details Until Checkout

This is how real fashion/saree e-commerce sites (Nykaa Fashion, Mirraw, Meena Bazaar, Myntra) operate, and it should be strictly followed:

- **Browsing, wishlist, and cart are all guest-accessible.** No login/signup wall before that.
- Cart is stored in `localStorage`/cookies for guests, synced to Supabase once identity is known.
- The **only** point details are collected is when the customer clicks **"Proceed to Buy"** at checkout.
- Use **phone number + OTP** (Supabase Auth phone provider, or a simple OTP via an SMS API) as the identity step — this is faster and more trusted than email/password for this audience.
- Ask only what's needed: name, phone, delivery address, pincode. Email optional.

### Purchase Flow (step by step)

```
Home → Category / Product Listing → Product Detail Page
   → Add to Cart (no login needed)
   → Cart Review (edit qty, apply coupon, see live discount)
   → "Proceed to Buy" → Login/OTP (phone number)
   → Shipping Address (save for future) → Order Summary
   → Payment Method (UPI / Card / Netbanking / COD)
   → Payment Confirmation → Order Success Page
   → WhatsApp + SMS/Email order confirmation auto-sent
```

- Product detail pages should support **multiple images + video** (saree drape videos matter a lot for this category — customers want to see fall and texture).
- Show **estimated delivery date** and **COD availability** on the product page itself (builds trust).
- "Buy Now" (skips to checkout directly) and "Add to Cart" (continues browsing) should both exist.

---

## 3. Payment Integration

Since COD + UPI + Netbanking + Cards are all required, use a single Indian payment gateway aggregator rather than integrating each individually:

- **Recommended: Razorpay** (or Cashfree as alternative) — both support UPI, Netbanking, Cards, and Wallets in one checkout widget, have solid Next.js/Node SDKs, and webhook support to confirm payment status server-side.
- **Cash on Delivery** is not a gateway transaction — it's just an order flag (`payment_method = 'COD'`, `payment_status = 'pending'`) set at checkout; optionally cap COD order value or restrict COD to serviceable pincodes.
- Payment confirmation must be verified via **webhook**, not just client-side redirect, so orders aren't marked paid without actual confirmation.
- Store `payment_status` separately from `order_status` (a COD order can be "Delivered" while `payment_status` is "Paid on delivery").

---

## 4. Customer-Facing Features

- Homepage with hero banner/carousel (admin-editable, see §5)
- Category grid (the 7 categories above) with attractive imagery
- Product listing pages with filters: price range, size, color, fabric, occasion
- Product detail page: image gallery + video, price, discount badge, size/variant selector, bio/description, "properties" (fabric, work type, blouse included, wash care, etc.), stock status
- Wishlist (guest-friendly, localStorage-based)
- Cart with live coupon application and price breakdown (MRP, discount, coupon, delivery, total)
- Guest checkout via phone OTP
- Order tracking page (status timeline: Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered)
- WhatsApp button (floating, sticky) on every page for quick queries — deep-links to business WhatsApp number with a pre-filled message
- Order confirmation sent via WhatsApp (using WhatsApp Cloud API or a `wa.me` link with pre-filled text triggered post-order) + SMS/email
- Return/refund policy and size guide pages
- Mobile-first responsive design (most traffic will be mobile)

---

## 5. Admin Dashboard Features

### Product Management
- Add/edit/delete products
- Upload **2–3 images per product** (Supabase Storage), min 2 required
- Fields: name, price, MRP (for showing discount), bio/description, category, properties (dynamic key-value: fabric, work, size, color, etc.), stock quantity, SKU
- Optional discount (% or flat amount)
- Mark product active/inactive (soft delete / hide without deleting)

### Offers & Homepage Banners
- Create/edit/delete promotional banners with image, title, link (e.g., to a category or product)
- Reorder/schedule banners (start date–end date) so seasonal offers auto-expire
- Toggle "Featured Products" / "Best Sellers" sections shown on homepage

### Coupons
- Create coupons: code, type (flat / percentage), value, min order value, max discount cap, expiry date, usage limit (total and/or per-customer)
- **Real-time validation** on the cart page: customer enters code → instantly see discount amount and new total (validate via Supabase function/API route, not just client-side)

### Orders
- View all orders with customer details, items, payment method, payment status
- Update order status (Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered / Cancelled / Returned) — each status change can trigger a WhatsApp/SMS update to customer
- Filter/search orders by status, date, customer, payment method
- Auto order-confirmation message sent to customer on order placement (templated, includes order ID + items + total)

### Analytics / Income Tracking
- Revenue dashboard: daily/weekly/monthly income, chart-based (line/bar)
- Category-wise and product-wise sales breakdown
- Best-selling products, low-stock alerts
- Coupon usage stats (how much discount given out)
- Real-time or near-real-time (Supabase Realtime subscriptions work well here — new orders can appear live on the dashboard without refresh)

### Settings
- WhatsApp business number (used for the floating button + order confirmations)
- Store details (name, address, return policy text, delivery charges/free delivery threshold)
- COD availability toggle / pincode restrictions

---

## 6. Suggested Supabase Schema (high level)

```
categories        (id, name, slug, image_url)
products          (id, category_id, name, price, mrp, discount, bio, properties jsonb, stock, is_active)
product_images    (id, product_id, image_url, sort_order)  -- 2-3 rows per product
coupons           (id, code, type, value, min_order, max_discount, expiry, usage_limit, times_used)
customers         (id, phone, name, email)
addresses         (id, customer_id, line1, line2, city, pincode, state, is_default)
orders            (id, customer_id, address_id, total, discount, coupon_id, payment_method,
                    payment_status, order_status, created_at)
order_items       (id, order_id, product_id, qty, price_at_purchase)
order_status_log  (id, order_id, status, changed_at)  -- powers the tracking timeline
banners           (id, image_url, title, link_url, start_date, end_date, sort_order)
```

Use **Row Level Security**: customers can only read their own orders/addresses; admin dashboard uses a service role or an `is_admin` claim to bypass RLS for management operations.

---

## 7. Design Direction

Saree/ethnic wear buyers respond to richness and craft — avoid a generic minimal SaaS look.

- **Color palette:** deep maroon, gold/mustard accents, emerald or teal, off-white/cream backgrounds — evokes festive/traditional feel without looking cluttered
- **Typography:** an elegant serif or light script for headings (product names, section titles), clean sans-serif for body text and prices
- **Imagery:** large, high-quality product photography; product videos for sarees (drape/fall) prioritized on detail pages
- **Homepage sections:** hero banner carousel → category tiles → "New Arrivals" → "Best Sellers" → current offers/banners → testimonials (optional) → footer with WhatsApp/contact
- **Trust signals:** "COD Available," "Easy Returns," "Authentic Handpicked Fabrics" badges near add-to-cart
- **Micro-interactions:** smooth image zoom on hover/tap for product photos, subtle fade/slide transitions between category filters, live coupon discount animation on cart update
- **Sticky elements:** floating WhatsApp icon (bottom-right), sticky "Add to Cart / Buy Now" bar on mobile product pages

---

## 8. Build Priority (suggested phases)

1. Audit existing v0 template structure; map its components to the categories/flow above
2. Supabase schema + Storage buckets for images
3. Product listing/detail pages wired to real data
4. Cart + coupon logic (client + server validation)
5. Checkout flow with OTP auth + address capture
6. Payment gateway integration (Razorpay/Cashfree) + webhook handling
7. Order confirmation (WhatsApp/SMS/email) + order tracking page
8. Admin dashboard: product CRUD → orders → coupons → banners → analytics
9. Polish: design pass, mobile responsiveness, loading/empty states
