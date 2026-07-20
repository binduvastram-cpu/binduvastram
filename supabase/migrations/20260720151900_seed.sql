-- Bindu Vastram — seed data (catalog taxonomy, attributes, demo products + images/sizes,
-- a couple of sample offers and a review) so the storefront and admin aren't empty on first load.
-- Applied via `supabase db push` only.

insert into public.categories (value, label, image_url, filter_kinds) values
  ('sarees', 'Sarees', '/images/saree-studio-blue.jpg', array['fabric', 'color', 'price']),
  ('womens-wear', 'Women''s Wear', '/images/saree-portrait-pillar.jpg', array['fabric', 'size', 'color', 'price']),
  ('salwar-suits', 'Salwar Suits', null, array['fabric', 'size', 'color', 'price']),
  ('designer', 'Designer', null, array['fabric', 'size', 'color', 'price']),
  ('blouses', 'Blouses', null, array['fabric', 'size', 'color', 'price']),
  ('jewellery', 'Jewellery', null, array['price']),
  ('mens-wear', 'Men''s Wear', null, array['fabric', 'size', 'color', 'price']),
  ('handbags', 'Hand Bags', null, array['material', 'color', 'price']),
  ('petticoats', 'Petticoats', null, array['fabric', 'size', 'color', 'price'])
on conflict (value) do nothing;

insert into public.collection_families (slug, label) values
  ('silk', 'Silk'),
  ('cotton', 'Cotton'),
  ('silk-cotton', 'Silk Cotton'),
  ('tussars', 'Tussars'),
  ('linens', 'Linens'),
  ('fancy', 'Fancy')
on conflict (slug) do nothing;

insert into public.collection_groups (family_id, slug, label)
select f.id, v.slug, v.label from (values
  ('kanjivaram-silk', 'Kanjivaram Silk', 'silk'),
  ('banaras', 'Banaras', 'silk'),
  ('other-silks', 'Other Silks', 'silk')
) as v(slug, label, family_slug)
join public.collection_families f on f.slug = v.family_slug
on conflict (slug) do nothing;

insert into public.collection_items (family_id, group_id, slug, label)
select f.id, g.id, v.slug, v.label from (values
  ('festive-kanjivarams', 'Festive Kanjivarams', 'silk', 'kanjivaram-silk'),
  ('subham-collection', 'Subham Collection', 'silk', 'kanjivaram-silk'),
  ('maharani-collection', 'Maharani Collection', 'silk', 'kanjivaram-silk'),
  ('soft-silk', 'Soft Silk', 'silk', 'kanjivaram-silk'),
  ('banaras-silks', 'Banaras Silks', 'silk', 'banaras'),
  ('banarasi-raw-silks', 'Banarasi Raw Silks', 'silk', 'banaras'),
  ('tissue-paithani-sarees', 'Tissue Paithani Sarees', 'silk', 'banaras'),
  ('chiniya-silks', 'Chiniya Silks', 'silk', 'banaras'),
  ('semi-banarasi-sarees', 'Semi Banarasi Sarees', 'silk', 'banaras'),
  ('venkatagiri', 'Venkatagiri', 'silk', 'other-silks'),
  ('gadwal-silk', 'Gadwal Silk', 'silk', 'other-silks'),
  ('katan-silks', 'Katan Silks', 'silk', 'other-silks'),
  ('mangalgiri', 'Mangalgiri', 'silk', 'other-silks'),
  ('mysore-silks', 'Mysore Silks', 'silk', 'other-silks'),
  ('art-silk', 'Art Silk', 'silk', 'other-silks')
) as v(slug, label, family_slug, group_slug)
join public.collection_families f on f.slug = v.family_slug
join public.collection_groups g on g.slug = v.group_slug
on conflict (slug) do nothing;

insert into public.collection_items (family_id, group_id, slug, label)
select f.id, null, v.slug, v.label from (values
  ('chettinad-cottons', 'Chettinad Cottons', 'cotton'),
  ('khadi-cotton', 'Khadi Cotton', 'cotton'),
  ('narayanpet-cotton', 'Narayanpet Cotton', 'cotton'),
  ('bengal-cottons', 'Bengal Cottons', 'cotton'),
  ('kanchi-cotton', 'Kanchi Cotton', 'cotton'),
  ('jaipur-cotton', 'Jaipur Cotton', 'cotton'),
  ('chanderi-cotton', 'Chanderi Cotton', 'cotton'),
  ('munga-cotton', 'Munga Cotton', 'cotton'),
  ('raagam-silk-cottons', 'Raagam - Silk Cottons', 'silk-cotton'),
  ('kanchi-silk-cotton', 'Kanchi Silk Cotton', 'silk-cotton'),
  ('ikat-silk-cotton', 'Ikat Silk Cotton', 'silk-cotton'),
  ('kuppadam-silk-cotton', 'Kuppadam Silk Cotton', 'silk-cotton'),
  ('mangalgiri-silk-cotton', 'Mangalgiri Silk Cotton', 'silk-cotton'),
  ('kora-silk-cotton', 'Kora Silk Cotton', 'silk-cotton'),
  ('silk-cotton', 'Silk Cotton', 'silk-cotton'),
  ('pure-tussars', 'Pure Tussars', 'tussars'),
  ('semi-tussars', 'Semi Tussars', 'tussars'),
  ('munga-tussars', 'Munga Tussars', 'tussars'),
  ('madhubani-tussars', 'Madhubani Tussars', 'tussars'),
  ('tussar-with-floral-prints', 'Tussar with Floral Prints', 'tussars'),
  ('tussar-embroidery-sarees', 'Tussar Embroidery Sarees', 'tussars'),
  ('tussar-with-classic-designs', 'Tussar with Classic Designs', 'tussars'),
  ('contemporary-style-tussars', 'Contemporary Style Tussars', 'tussars'),
  ('organza-sarees', 'Organza Sarees', 'fancy'),
  ('semi-raw-silks', 'Semi Raw Silks', 'fancy'),
  ('semi-soft-silk', 'Semi Soft Silk', 'fancy'),
  ('modal-silks', 'Modal Silks', 'fancy'),
  ('bamboo-silks', 'Bamboo Silks', 'fancy'),
  ('kota-sarees', 'Kota Sarees', 'fancy'),
  ('jute-sarees', 'Jute Sarees', 'fancy'),
  ('dola-silk', 'Dola Silk', 'fancy'),
  ('ikat-silk', 'Ikat Silk', 'fancy')
) as v(slug, label, family_slug)
join public.collection_families f on f.slug = v.family_slug
on conflict (slug) do nothing;

insert into public.attributes (kind, value) values
  ('fabric', 'Pure Silk'),
  ('fabric', 'Kanjivaram Silk'),
  ('fabric', 'Handloom Cotton Silk'),
  ('fabric', 'Silk'),
  ('fabric', 'Banarasi Silk'),
  ('fabric', 'Chiffon'),
  ('fabric', 'Georgette'),
  ('fabric', 'Satin Georgette'),
  ('fabric', 'Silk Blend'),
  ('fabric', 'Raw Silk'),
  ('fabric', 'Jacquard'),
  ('fabric', 'Cotton'),
  ('fabric', 'Cotton Silk'),
  ('work', 'Zari Weaving'),
  ('work', 'Temple Border Zari'),
  ('work', 'Zari Border'),
  ('work', 'Woven Zari'),
  ('work', 'Lace Border'),
  ('work', 'Embroidery'),
  ('work', 'Sequin Embroidery'),
  ('work', 'Embroidered Yoke'),
  ('work', 'Hand Embroidery'),
  ('work', 'Kundan & Pearl'),
  ('work', 'Temple Jewellery'),
  ('work', 'Stone Embellishment'),
  ('work', 'Thread Embroidery'),
  ('work', 'Block Print'),
  ('color', 'Royal Blue'),
  ('color', 'Magenta & Gold'),
  ('color', 'Cream & Gold'),
  ('color', 'Magenta'),
  ('color', 'Red & Pink'),
  ('color', 'Maroon'),
  ('color', 'Yellow & Red'),
  ('color', 'Green'),
  ('color', 'Green & Gold'),
  ('color', 'Red & Multicolour'),
  ('color', 'Emerald Green'),
  ('color', 'Wine Red'),
  ('color', 'Gold'),
  ('color', 'Cream'),
  ('color', 'Off-White'),
  ('color', 'Black'),
  ('color', 'Teal'),
  ('color', 'Indigo'),
  ('occasion', 'Wedding & Festive'),
  ('occasion', 'Wedding'),
  ('occasion', 'Festive'),
  ('occasion', 'Daywear'),
  ('occasion', 'Party & Reception'),
  ('occasion', 'Wedding & Religious'),
  ('occasion', 'Festive & Wedding'),
  ('occasion', 'Party & Festive'),
  ('occasion', 'Festive & Daily Wear'),
  ('material', 'Silk Brocade'),
  ('material', 'Satin'),
  ('size', 'S'),
  ('size', 'M'),
  ('size', 'L'),
  ('size', 'XL'),
  ('size', 'XXL'),
  ('size', '32'),
  ('size', '34'),
  ('size', '36'),
  ('size', '38'),
  ('size', '40')
on conflict (kind, value) do nothing;

insert into public.products (code, name, tagline, description, price, mrp, category_id, collection_item_id, properties, estimated_delivery_min, estimated_delivery_max, created_at, bought_count)
select v.code, v.name, v.tagline, v.description, v.price, v.mrp, c.id,
  (select id from public.collection_items where slug = v.collection_slug),
  v.properties, v.delivery_min, v.delivery_max, v.created_at::timestamptz, v.bought_count
from (values
  ('SL001', 'Royal Banarasi Silk Saree', 'Regal silver zari on deep royal blue', 'A handwoven Banarasi silk saree with intricate silver zari work, draped in a rich studio setting that shows off its fall and sheen.', 4999, 6999, 'sarees', 'silk', '{"fabric":"Pure Silk","work":"Zari Weaving","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Wedding & Festive","color":"Royal Blue"}'::jsonb, 4, 7, '2026-06-05T12:00:00.000Z', 18),
  ('SL002', 'Heritage Kanjivaram Silk Saree', 'Temple-border weave with a story', 'A classic Kanjivaram silk saree in magenta and gold zari, woven near a heritage stone wall — timeless elegance for festive occasions.', 6499, null, 'sarees', 'kanjivaram-silk', '{"fabric":"Kanjivaram Silk","work":"Temple Border Zari","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Wedding","color":"Magenta & Gold"}'::jsonb, 5, 8, '2026-07-18T12:00:00.000Z', 9),
  ('SC001', 'Cream & Gold Handloom Saree', 'Soft drape, quiet luxury', 'A cream and gold handloom saree with a delicate red blouse pairing, styled with jhumka earrings for an understated festive look.', 2499, 2999, 'sarees', 'silk-cotton', '{"fabric":"Handloom Cotton Silk","work":"Zari Border","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Festive","color":"Cream & Gold"}'::jsonb, 4, 7, '2026-05-29T12:00:00.000Z', null),
  ('SL003', 'Magenta Pillar Silk Saree', 'Jasmine, gold, and grace', 'A magenta silk saree with a hot-pink blouse and fresh jasmine hair adornment — a rich, photogenic pick for celebrations.', 3299, null, 'sarees', 'silk', '{"fabric":"Silk","work":"Zari Border","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Festive","color":"Magenta"}'::jsonb, 4, 7, '2026-05-22T12:00:00.000Z', null),
  ('SL004', 'Banarasi Duo Collection Saree', 'Editorial richness, everyday elegance', 'Part of a curated Banarasi-style collection in red and pink, photographed against a heritage wall for a true sense of texture and drape.', 5499, 6999, 'sarees', 'banaras', '{"fabric":"Banarasi Silk","work":"Woven Zari","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Wedding & Festive","color":"Red & Pink"}'::jsonb, 5, 8, '2026-05-15T12:00:00.000Z', null),
  ('SR001', 'Garden Breeze Chiffon Saree', 'Light as air, effortless to drape', 'A flowing maroon chiffon saree with a fluttering pallu, perfect for daytime events and easy everyday elegance.', 2899, null, 'sarees', null, '{"fabric":"Chiffon","work":"Lace Border","blouseIncluded":true,"washCare":"Hand Wash Cold","occasion":"Daywear","color":"Maroon"}'::jsonb, 3, 6, '2026-07-15T12:00:00.000Z', null),
  ('SL005', 'Vintage Kanjivaram Saree', 'Warm tones, old-world charm', 'A yellow and red Kanjivaram silk saree with a vintage colour grade, styled simply on a wooden chair to let the weave speak for itself.', 5299, null, 'sarees', 'kanjivaram-silk', '{"fabric":"Kanjivaram Silk","work":"Zari Border","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Wedding & Festive","color":"Yellow & Red"}'::jsonb, 5, 8, '2026-07-12T12:00:00.000Z', null),
  ('SL006', 'Pastel Drape Silk Saree', 'Soft hues, editorial elegance', 'A green silk saree styled with flowing pastel pink and orange sheer fabric, gold jhumkas finishing the look.', 3799, null, 'sarees', 'silk', '{"fabric":"Silk","work":"Zari Border","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Festive","color":"Green"}'::jsonb, 4, 7, '2026-05-08T12:00:00.000Z', null),
  ('SL007', 'Golden Hour Silk Saree', 'Warm light, timeless silk', 'A green and gold silk saree photographed by a brass lamp with scattered jasmine flowers — rich colour that photographs beautifully for every celebration.', 4199, 4799, 'sarees', 'silk', '{"fabric":"Silk","work":"Zari Border","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Festive","color":"Green & Gold"}'::jsonb, 4, 7, '2026-05-01T12:00:00.000Z', null),
  ('SL008', 'Heritage Walk Silk Saree', 'Grace within temple corridors', 'A red and multicolour silk saree captured within a grand temple corridor, golden light catching every fold of the drape.', 4599, null, 'sarees', 'silk', '{"fabric":"Silk","work":"Zari Border","blouseIncluded":true,"washCare":"Dry Clean Only","occasion":"Wedding & Festive","color":"Red & Multicolour"}'::jsonb, 5, 8, '2026-04-24T12:00:00.000Z', null),
  ('WW001', 'Anarkali Evening Dress', 'Flowing silhouette, festive detailing', 'A floor-length Anarkali dress with delicate embroidery, designed for evening functions and celebrations.', 3499, 3999, 'womens-wear', null, '{"fabric":"Georgette","work":"Embroidery","washCare":"Dry Clean Only","occasion":"Festive","color":"Emerald Green"}'::jsonb, 5, 8, '2026-07-09T12:00:00.000Z', 6),
  ('WW002', 'Indo-Western Gown', 'Contemporary cut, ethnic soul', 'A fusion gown blending Indian embroidery with a modern silhouette — a versatile pick for receptions and parties.', 4299, null, 'womens-wear', null, '{"fabric":"Satin Georgette","work":"Sequin Embroidery","washCare":"Dry Clean Only","occasion":"Party & Reception","color":"Wine Red"}'::jsonb, 5, 9, '2026-04-17T12:00:00.000Z', null),
  ('BL001', 'Designer Readymade Blouse', 'Pair-perfect with any silk saree', 'A readymade designer blouse with statement sleeves and back detailing, cut for a comfortable, flattering fit.', 899, 1099, 'blouses', null, '{"fabric":"Silk Blend","work":"Embroidered Yoke","washCare":"Dry Clean Only","occasion":"Festive","color":"Gold"}'::jsonb, 3, 6, '2026-04-10T12:00:00.000Z', null),
  ('BL002', 'Embroidered Silk Blouse', 'Handworked detailing, timeless fit', 'A rich silk blouse with hand embroidery along the neckline, made to pair beautifully with Kanjivaram and Banarasi sarees.', 1199, null, 'blouses', null, '{"fabric":"Pure Silk","work":"Hand Embroidery","washCare":"Dry Clean Only","occasion":"Wedding","color":"Maroon"}'::jsonb, 4, 7, '2026-04-03T12:00:00.000Z', null),
  ('JW001', 'Kundan Necklace Set', 'Bridal-ready statement piece', 'A Kundan-studded necklace set with matching earrings, designed to be the centerpiece of any festive or bridal look.', 2499, 2999, 'jewellery', null, '{"work":"Kundan & Pearl","occasion":"Wedding & Festive","color":"Gold"}'::jsonb, 3, 6, '2026-03-27T12:00:00.000Z', 15),
  ('JW002', 'Temple Jhumka Earrings', 'Classic gold-tone temple work', 'Lightweight temple-style jhumka earrings with a gold-tone finish, an everyday festive essential.', 999, null, 'jewellery', null, '{"work":"Temple Jewellery","occasion":"Festive & Daily Wear","color":"Gold"}'::jsonb, 2, 5, '2026-03-20T12:00:00.000Z', null),
  ('MW001', 'Men''s Silk Kurta Set', 'Festive-ready in two pieces', 'A classic kurta and pyjama set in raw silk, tailored for a comfortable festive fit.', 1799, 2199, 'mens-wear', null, '{"fabric":"Raw Silk","washCare":"Dry Clean Only","occasion":"Festive","color":"Cream"}'::jsonb, 4, 7, '2026-03-13T12:00:00.000Z', 11),
  ('MW002', 'Men''s Nehru Jacket', 'Sharp layering for any occasion', 'A tailored Nehru jacket that layers effortlessly over kurtas for weddings and festive gatherings.', 2299, null, 'mens-wear', null, '{"fabric":"Jacquard","washCare":"Dry Clean Only","occasion":"Wedding & Festive","color":"Maroon"}'::jsonb, 4, 8, '2026-07-06T12:00:00.000Z', null),
  ('MW003', 'Men''s Silk Dhoti', 'Traditional drape, festive gold border', 'A pure silk dhoti with a woven gold border, ready to drape for weddings and religious occasions.', 1299, null, 'mens-wear', null, '{"fabric":"Pure Silk","work":"Zari Border","washCare":"Dry Clean Only","occasion":"Wedding & Religious","color":"Cream & Gold"}'::jsonb, 4, 7, '2026-03-06T12:00:00.000Z', null),
  ('HB001', 'Embroidered Potli Bag', 'A handheld finishing touch', 'A hand-embroidered potli bag with a drawstring closure, sized to carry the essentials for any festive outing.', 799, 999, 'handbags', null, '{"material":"Silk Brocade","work":"Hand Embroidery","occasion":"Festive & Wedding","color":"Maroon & Gold"}'::jsonb, 3, 6, '2026-02-27T12:00:00.000Z', 8),
  ('HB002', 'Ethnic Embellished Clutch', 'Compact, festive, versatile', 'A structured clutch with embellished detailing, designed to complement both sarees and Indo-western outfits.', 1099, null, 'handbags', null, '{"material":"Satin","work":"Stone Embellishment","occasion":"Party & Festive","color":"Emerald Green"}'::jsonb, 3, 6, '2026-02-20T12:00:00.000Z', null),
  ('PC001', 'Cotton Saree Petticoat', 'Everyday comfort under any drape', 'A breathable cotton petticoat with an adjustable drawstring waist, made to support daily-wear sarees comfortably.', 399, 499, 'petticoats', null, '{"fabric":"Cotton","washCare":"Machine Wash","color":"Off-White"}'::jsonb, 2, 5, '2026-02-13T12:00:00.000Z', 22),
  ('PC002', 'Satin Shapewear Petticoat', 'A smooth base for silk sarees', 'A satin shapewear petticoat designed to give silk and georgette sarees a smooth, clean fall.', 599, null, 'petticoats', null, '{"fabric":"Satin","washCare":"Hand Wash Cold","color":"Black"}'::jsonb, 2, 5, '2026-07-03T12:00:00.000Z', null),
  ('SS001', 'Anarkali Salwar Suit Set', 'Flowing silhouette, everyday grace', 'A 3-piece unstitched salwar suit set with a floor-length Anarkali kameez, matching salwar, and dupatta.', 2799, 3299, 'salwar-suits', null, '{"fabric":"Cotton Silk","work":"Thread Embroidery","washCare":"Dry Clean Only","occasion":"Festive & Daily Wear","color":"Teal"}'::jsonb, 4, 7, '2026-06-30T12:00:00.000Z', 7),
  ('SS002', 'Printed Straight-Cut Suit Set', 'Everyday elegance, effortless print', 'A straight-cut cotton salwar suit set with a block-print kameez, palazzo, and matching dupatta — comfortable daily wear with festive polish.', 1899, null, 'salwar-suits', null, '{"fabric":"Cotton","work":"Block Print","washCare":"Machine Wash","occasion":"Daywear","color":"Indigo"}'::jsonb, 3, 6, '2026-02-06T12:00:00.000Z', 5)
) as v(code, name, tagline, description, price, mrp, category_value, collection_slug, properties, delivery_min, delivery_max, created_at, bought_count)
join public.categories c on c.value = v.category_value
on conflict (code) do nothing;

insert into public.product_images (product_id, image_url, sort_order)
select p.id, v.image_url, v.sort_order from (values
  ('SL001', '/images/saree-studio-blue.jpg', 0),
  ('SL002', '/images/saree-heritage-wall.jpg', 0),
  ('SC001', '/images/saree-portrait-earring.jpg', 0),
  ('SL003', '/images/saree-portrait-pillar.jpg', 0),
  ('SL004', '/images/saree-duo-editorial.jpg', 0),
  ('SR001', '/images/saree-garden-breeze.jpg', 0),
  ('SL005', '/images/saree-vintage-kanjivaram.jpg', 0),
  ('SL006', '/images/saree-pastel-drapes.jpg', 0),
  ('SL007', '/images/saree-brass-lamp.jpg', 0),
  ('SL007', '/images/saree-candid-jasmine.jpg', 1),
  ('SL008', '/images/saree-temple-corridor.jpg', 0),
  ('WW001', '/placeholder.svg', 0),
  ('WW001', '/placeholder.svg', 1),
  ('WW001', '/placeholder.svg', 2),
  ('WW002', '/placeholder.svg', 0),
  ('BL001', '/placeholder.svg', 0),
  ('BL002', '/placeholder.svg', 0),
  ('JW001', '/placeholder.svg', 0),
  ('JW001', '/placeholder.svg', 1),
  ('JW001', '/placeholder.svg', 2),
  ('JW002', '/placeholder.svg', 0),
  ('MW001', '/placeholder.svg', 0),
  ('MW001', '/placeholder.svg', 1),
  ('MW001', '/placeholder.svg', 2),
  ('MW002', '/placeholder.svg', 0),
  ('MW003', '/placeholder.svg', 0),
  ('HB001', '/placeholder.svg', 0),
  ('HB001', '/placeholder.svg', 1),
  ('HB001', '/placeholder.svg', 2),
  ('HB002', '/placeholder.svg', 0),
  ('PC001', '/placeholder.svg', 0),
  ('PC001', '/placeholder.svg', 1),
  ('PC001', '/placeholder.svg', 2),
  ('PC002', '/placeholder.svg', 0),
  ('SS001', '/placeholder.svg', 0),
  ('SS001', '/placeholder.svg', 1),
  ('SS002', '/placeholder.svg', 0)
) as v(code, image_url, sort_order)
join public.products p on p.code = v.code;

insert into public.product_sizes (product_id, size, stock)
select p.id, v.size, v.stock from (values
  ('WW001', 'S', 3),
  ('WW001', 'M', 4),
  ('WW001', 'L', 2),
  ('WW001', 'XL', 0),
  ('WW002', 'S', 2),
  ('WW002', 'M', 2),
  ('WW002', 'L', 2),
  ('WW002', 'XL', 1),
  ('BL001', '32', 4),
  ('BL001', '34', 4),
  ('BL001', '36', 4),
  ('BL001', '38', 4),
  ('BL001', '40', 4),
  ('BL002', '32', 4),
  ('BL002', '34', 3),
  ('BL002', '36', 3),
  ('BL002', '38', 3),
  ('BL002', '40', 3),
  ('MW001', 'M', 5),
  ('MW001', 'L', 6),
  ('MW001', 'XL', 4),
  ('MW001', 'XXL', 0),
  ('MW002', 'M', 3),
  ('MW002', 'L', 3),
  ('MW002', 'XL', 3),
  ('MW002', 'XXL', 2),
  ('PC001', 'S', 8),
  ('PC001', 'M', 10),
  ('PC001', 'L', 7),
  ('PC001', 'XL', 5),
  ('PC001', 'XXL', 0),
  ('PC002', 'S', 4),
  ('PC002', 'M', 4),
  ('PC002', 'L', 4),
  ('PC002', 'XL', 4),
  ('PC002', 'XXL', 4),
  ('SS001', 'S', 4),
  ('SS001', 'M', 6),
  ('SS001', 'L', 5),
  ('SS001', 'XL', 2),
  ('SS002', 'S', 6),
  ('SS002', 'M', 8),
  ('SS002', 'L', 6),
  ('SS002', 'XL', 4),
  ('SS002', 'XXL', 2)
) as v(code, size, stock)
join public.products p on p.code = v.code
on conflict (product_id, size) do nothing;

update public.products p set stock = v.stock
from (values
  ('SL001', 12),
  ('SL002', 8),
  ('SC001', 15),
  ('SL003', 10),
  ('SL004', 6),
  ('SR001', 14),
  ('SL005', 7),
  ('SL006', 9),
  ('SL007', 11),
  ('SL008', 8),
  ('JW001', 10),
  ('JW002', 25),
  ('MW003', 14),
  ('HB001', 22),
  ('HB002', 13)
) as v(code, stock)
where p.code = v.code;

insert into public.offers (title, description, scope, category_id, discount_type, discount_value, is_active) values
  ('Festive Saree Sale', '10% off every saree, for a limited time.', 'category', (select id from public.categories where value = 'sarees'), 'percent', 10, true);

insert into public.offers (title, description, scope, product_id, discount_type, discount_value, is_active)
select 'Kurta Set Special', 'Flat ₹200 off this festive kurta set.', 'product', p.id, 'flat', 200, true
from public.products p where p.code = 'MW001';

insert into public.reviews (product_id, customer_name, rating, text, status)
select p.id, 'Ananya R.', 5, 'Beautiful drape and the zari work is even better in person. Highly recommend!', 'approved'
from public.products p where p.code = 'SL001';

