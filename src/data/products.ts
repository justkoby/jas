import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Amara Ruched Midi Dress",
    slug: "amara-ruched-midi-dress",
    category: "clothing",
    subcategory: "Dresses",
    description: "An elegant, body-skimming midi dress featuring delicate ruching along the sides, a subtle sweetheart neckline, and a low scoop back. Made from a premium, breathable modal-cotton blend that offers stretch and comfort. Perfect for Accra evenings or weekend brunches.",
    price: 650,
    originalPrice: 780,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Dusty Rose", value: "#C27D80" },
      { name: "Burgundy", value: "#9A3B5A" },
      { name: "Charcoal", value: "#1F1F1F" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variationType: "size",
    stock: 12,
    rating: 4.8,
    reviewCount: 24,
    isFeatured: true,
    isNew: false,
    isSale: true,
    details: [
      "92% Modal, 8% Elastane blend",
      "Rouched side-seams for a flattering shape",
      "Double-lined body for premium opacity",
      "Made ethically in Ghana"
    ],
    care: [
      "Hand wash cold with similar colors",
      "Lay flat to dry in shade",
      "Low iron if necessary"
    ]
  },
  {
    id: "prod-002",
    name: "Naya Linen Two-Piece Set",
    slug: "naya-linen-two-piece-set",
    category: "clothing",
    subcategory: "Sets",
    description: "A breezy summer essential consisting of a relaxed-fit button-down linen top and matching wide-leg trousers. High-waisted pants feature a soft elasticated waistband and side slip pockets. Crafted from premium pure European flax linen.",
    price: 850,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Oatmeal", value: "#EAE3D5" },
      { name: "Sage Green", value: "#96A08D" },
      { name: "Off-White", value: "#FAF9F6" }
    ],
    sizes: ["S", "M", "L", "XL"],
    variationType: "size",
    stock: 8,
    rating: 4.9,
    reviewCount: 16,
    isFeatured: true,
    isNew: true,
    isSale: false,
    details: [
      "100% Organic Linen",
      "Corozo nut buttons",
      "Relaxed silhouette top with cuffable sleeves",
      "Pants feature elasticated back and structured front waist"
    ],
    care: [
      "Machine wash gentle cycle cold",
      "Do not bleach",
      "Hang dry only",
      "Iron warm while damp"
    ]
  },
  {
    id: "prod-003",
    name: "Sade Sculpted Heels",
    slug: "sade-sculpted-heels",
    category: "shoes",
    subcategory: "Heels",
    description: "Expertly crafted heels featuring a modern square toe and a unique, architectural block heel. Dual soft-leather footbed cushions every step, combining high design with all-day comfort. Handmade by Ghanaian leather artisans.",
    price: 720,
    originalPrice: 850,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Warm Taupe", value: "#8C7A6B" },
      { name: "Noir", value: "#121212" }
    ],
    sizes: ["37", "38", "39", "40", "41"],
    variationType: "size",
    stock: 5,
    rating: 4.6,
    reviewCount: 12,
    isFeatured: false,
    isNew: false,
    isSale: true,
    details: [
      "100% Genuine Nappa leather upper and lining",
      "70mm (2.75 inch) custom sculpted wooden heel",
      "Padded memory foam insole",
      "Handcrafted in Accra"
    ],
    care: [
      "Clean with a soft damp cloth",
      "Use specialized leather conditioner regularly",
      "Store in provided dust bag away from direct sunlight"
    ]
  },
  {
    id: "prod-004",
    name: "Mira Everyday Slides",
    slug: "mira-everyday-slides",
    category: "shoes",
    subcategory: "Flats",
    description: "The slide you will reach for day after day. A minimalistic double-strap profile made from buttery soft leather that molds to your feet over time. Lightweight design, perfect for casual styling and warm weather strolls.",
    price: 350,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Tan", value: "#B07D62" },
      { name: "Black", value: "#1A1A1A" },
      { name: "Cream", value: "#F4F1EA" }
    ],
    sizes: ["36", "37", "38", "39", "40", "41"],
    variationType: "size",
    stock: 20,
    rating: 4.7,
    reviewCount: 38,
    isFeatured: true,
    isNew: false,
    isSale: false,
    details: [
      "Full grain calf leather straps",
      "Breathable leather outsole",
      "Flexible, slip-resistant rubber heel tab",
      "Fits true to size"
    ],
    care: [
      "Avoid immersion in water",
      "Wipe clean with dry cloth",
      "Keep dry and store in dry storage"
    ]
  },
  {
    id: "prod-005",
    name: "Lani Structured Handbag",
    slug: "lani-structured-handbag",
    category: "bags-accessories",
    subcategory: "Bags",
    description: "An elegant, architectural top-handle bag with clean geometric lines. Closes securely with a gold-plated clasp and offers a detachable shoulder strap for hands-free versatility. Fits your daily essentials in style.",
    price: 1200,
    originalPrice: 1400,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Cognac Leather", value: "#8B5A2B" },
      { name: "Noir Black", value: "#1C1C1C" },
      { name: "Forest Green", value: "#2E4F3B" }
    ],
    sizes: ["One Size"],
    variationType: "size",
    stock: 4,
    rating: 5.0,
    reviewCount: 8,
    isFeatured: true,
    isNew: false,
    isSale: true,
    details: [
      "Premium structured pebbled leather",
      "Polished brass hardware",
      "Interior zip pocket and card holder slots",
      "Dimension: 24cm W x 18cm H x 10cm D"
    ],
    care: [
      "Do not wash or dry clean",
      "Wipe clean with a damp white cloth",
      "Stuff with paper to maintain shape when storing"
    ]
  },
  {
    id: "prod-006",
    name: "Zuri Mini Shoulder Bag",
    slug: "zuri-mini-shoulder-bag",
    category: "bags-accessories",
    subcategory: "Bags",
    description: "A compact, 90s-inspired baguette bag that fits neatly under the arm. Features a soft crescent shape, zippered top closure, and beautiful contrast stitching details. Lightweight and versatile.",
    price: 480,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Burgundy", value: "#9A3B5A" },
      { name: "Olive", value: "#707E60" },
      { name: "Beige", value: "#D9D0C1" }
    ],
    sizes: ["One Size"],
    variationType: "size",
    stock: 15,
    rating: 4.5,
    reviewCount: 22,
    isFeatured: false,
    isNew: true,
    isSale: false,
    details: [
      "Soft vegan PU leather",
      "YKK zip closure",
      "Lined interior with phone pocket",
      "Dimension: 21cm W x 12cm H x 6cm D"
    ],
    care: [
      "Wipe down with a damp cloth",
      "Avoid contact with oil, makeup and dye transfer"
    ]
  },
  {
    id: "prod-007",
    name: "JAS No. 01 Eau de Parfum",
    slug: "jas-no-01-eau-de-parfum",
    category: "beauty-fragrance",
    subcategory: "Perfumes",
    description: "Our signature fragrance. An evocative blend of warm amber, woody cedar, and spicy black pepper, sweetened by a soft top note of jasmine and fresh orange blossom. A sophisticated scent that lingers beautifully in tropical heat.",
    price: 950,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Glass Bottle", value: "#ECE8E2" }
    ],
    sizes: ["50ml", "100ml"],
    variationType: "volume",
    stock: 14,
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isNew: true,
    isSale: false,
    details: [
      "Top Notes: Jasmine, Orange Blossom",
      "Heart Notes: Ambergris, Cedarwood",
      "Base Notes: Black Pepper, Musks",
      "Concentrated Eau de Parfum formulated for long wear"
    ],
    care: [
      "Store in a cool, dry place",
      "Keep bottle away from direct sunlight and heat"
    ]
  },
  {
    id: "prod-008",
    name: "Velvet Rose Body Mist",
    slug: "velvet-rose-body-mist",
    category: "beauty-fragrance",
    subcategory: "Mists",
    description: "A lightweight, refreshing body mist capturing the dew-kissed petals of damask rose infused with warm vanilla bean and a touch of white musk. Formulated with soothing aloe vera extract to hydrate the skin.",
    price: 320,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Clear Pink", value: "#E8C8C9" }
    ],
    sizes: ["150ml"],
    variationType: "volume",
    stock: 25,
    rating: 4.4,
    reviewCount: 30,
    isFeatured: false,
    isNew: false,
    isSale: false,
    details: [
      "Scent family: Warm Floral",
      "Enriched with natural aloe extract",
      "Alcohol-denat base, fine mist actuator",
      "Cruelty-free, vegan formula"
    ],
    care: [
      "For external use only",
      "Keep away from flames and high heat"
    ]
  },
  {
    id: "prod-009",
    name: "Sculpted Gold Earrings",
    slug: "sculpted-gold-earrings",
    category: "bags-accessories",
    subcategory: "Jewellery",
    description: "Statement-making gold earrings featuring an organic, liquid-metal texture. These medium-sized drops are hollowed out so they remain lightweight on the lobes. Hypoallergenic design for sensitive skin.",
    price: 250,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "18K Gold Plated", value: "#D4AF37" }
    ],
    sizes: ["One Size"],
    variationType: "size",
    stock: 35,
    rating: 4.8,
    reviewCount: 51,
    isFeatured: true,
    isNew: false,
    isSale: false,
    details: [
      "Brass base with 18k gold vermeil plating",
      "Hollow core for lightweight feel",
      "Sterling silver posts, push-back closure",
      "Length: 3cm"
    ],
    care: [
      "Remove before swimming, bathing or exercising",
      "Store in a dry velvet jewelry pouch",
      "Avoid direct contact with perfumes and body oils"
    ]
  },
  {
    id: "prod-010",
    name: "Soft Glow Table Lamp",
    slug: "soft-glow-table-lamp",
    category: "home-living",
    subcategory: "Lighting",
    description: "A dome-shaped rechargeable table lamp that casts a warm, atmospheric glow in any corner. Features a touch-sensitive base with three dimming levels. Wireless design allows easy placement on bedside tables or shelves.",
    price: 580,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Muted Ochre", value: "#C79D5E" },
      { name: "Cream", value: "#ECE8E2" }
    ],
    sizes: ["Standard"],
    variationType: "material",
    stock: 9,
    rating: 4.7,
    reviewCount: 15,
    isFeatured: true,
    isNew: true,
    isSale: false,
    details: [
      "Powder coated metal dome and base",
      "3-step touch dimmer (Warm White LED)",
      "USB-C rechargeable (charging cable included)",
      "Battery life: 8 to 40 hours depending on brightness"
    ],
    care: [
      "Wipe clean with a dry microfiber cloth",
      "Keep away from direct moisture"
    ]
  },
  {
    id: "prod-011",
    name: "Textured Ceramic Vase",
    slug: "textured-ceramic-vase",
    category: "home-living",
    subcategory: "Decor",
    description: "An earthy, sculptural ceramic vase featuring a sandy, raw stoneware finish. Beautiful both as an independent decorative piece or displaying dried botanicals. Hand-thrown in local clay.",
    price: 420,
    originalPrice: 480,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Sandy White", value: "#EFECE6" },
      { name: "Terracotta", value: "#C87A53" }
    ],
    sizes: ["Small", "Large"],
    variationType: "size",
    stock: 6,
    rating: 4.8,
    reviewCount: 9,
    isFeatured: false,
    isNew: false,
    isSale: true,
    details: [
      "Stoneware clay with textured volcanic glaze",
      "Waterproof interior coating",
      "Felt pads on bottom to protect surfaces",
      "Small: 18cm H; Large: 26cm H"
    ],
    care: [
      "Hand wash with mild soap if needed",
      "Handle with care to prevent chipping"
    ]
  },
  {
    id: "prod-012",
    name: "Scented Home Candle",
    slug: "scented-home-candle",
    category: "home-living",
    subcategory: "Diffusers & Candles",
    description: "A slow-burning coconut-soy wax candle hand-poured in a matte ceramic vessel. Releases a rich, relaxing scent of sandalwood, cardamom, and fresh fig leaf, creating an instant sanctuary in your living room.",
    price: 180,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Fig & Sandalwood", value: "#766C63" },
      { name: "Vanilla & Amber", value: "#D2C5B5" }
    ],
    sizes: ["220g"],
    variationType: "volume",
    stock: 40,
    rating: 4.9,
    reviewCount: 34,
    isFeatured: true,
    isNew: false,
    isSale: false,
    details: [
      "Coconut-soy wax blend, lead-free cotton wick",
      "Clean, soot-free burn of approx. 50 hours",
      "Reusable food-grade ceramic cup",
      "Scented with premium essential oils"
    ],
    care: [
      "Trim wick to 5mm before every lighting",
      "Burn for at least 2 hours on first use to prevent tunneling",
      "Never leave burning candle unattended"
    ]
  },
  {
    id: "prod-013",
    name: "Silk Slip Dress",
    slug: "silk-slip-dress",
    category: "clothing",
    subcategory: "Dresses",
    description: "A luxurious 100% mulberry silk slip dress with a cowl neck and adjustable cross-back straps. Slits on both sides allow dynamic movement. A bias-cut classic that cascades smoothly over curves.",
    price: 680,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Dusty Rose", value: "#C27D80" },
      { name: "Emerald", value: "#1E4D3E" },
      { name: "Champagne", value: "#F1E5D5" }
    ],
    sizes: ["XS", "S", "M", "L"],
    variationType: "size",
    stock: 6,
    rating: 4.8,
    reviewCount: 14,
    isFeatured: false,
    isNew: true,
    isSale: false,
    details: [
      "100% Mulberry Silk (19 momme weight)",
      "Bias cut for elegant drapery",
      "Adjustable criss-cross straps",
      "Subtle side slits"
    ],
    care: [
      "Dry clean recommended or hand wash with silk soap",
      "Do not wring out",
      "Steam on low setting"
    ]
  },
  {
    id: "prod-014",
    name: "Cropped Linen Shirt",
    slug: "cropped-linen-shirt",
    category: "clothing",
    subcategory: "Tops",
    description: "A boxy, crop-cut short sleeve shirt with structural collar details and large utility chest pocket. Made from lightweight pre-washed pure linen. Ideal worn open over swimwear or paired with high-waisted shorts.",
    price: 320,
    originalPrice: 420,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Off-White", value: "#FAF9F6" },
      { name: "Oatmeal", value: "#EAE3D5" }
    ],
    sizes: ["S", "M", "L"],
    variationType: "size",
    stock: 14,
    rating: 4.3,
    reviewCount: 19,
    isFeatured: false,
    isNew: false,
    isSale: true,
    details: [
      "100% pre-washed French linen",
      "Boxy crop cut",
      "Genuine shell buttons",
      "Left chest patch pocket"
    ],
    care: [
      "Gentle warm machine wash",
      "Tumble dry low or air dry",
      "Iron while slightly damp"
    ]
  },
  {
    id: "prod-015",
    name: "Wide-Leg Linen Trousers",
    slug: "wide-leg-linen-trousers",
    category: "clothing",
    subcategory: "Trousers",
    description: "Comfort meets sophistication. These high-rise linen trousers feature a double-pleat front, belt loops, deep pockets, and a wide flowy leg. The elasticated back waist ensures a comfortable and snug fit.",
    price: 450,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Warm Taupe", value: "#8C7A6B" },
      { name: "Noir", value: "#121212" },
      { name: "Oatmeal", value: "#EAE3D5" }
    ],
    sizes: ["S", "M", "L", "XL"],
    variationType: "size",
    stock: 11,
    rating: 4.7,
    reviewCount: 20,
    isFeatured: false,
    isNew: false,
    isSale: false,
    details: [
      "100% Medium weight linen",
      "Double pleated front detail",
      "Zipper fly and hook closure",
      "Side slit pockets and back welt pockets"
    ],
    care: [
      "Wash cold with similar colors",
      "Hang to dry",
      "Hot iron"
    ]
  },
  {
    id: "prod-016",
    name: "Leather Mule Sandals",
    slug: "leather-mule-sandals",
    category: "shoes",
    subcategory: "Flats",
    description: "Sleek, pointed-toe backless mules designed for seamless everyday styling. Soft leather upper and padded insoles mold to your feet, offering slip-on convenience with a highly polished aesthetic.",
    price: 550,
    originalPrice: 620,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Tan", value: "#B07D62" },
      { name: "Black", value: "#1A1A1A" }
    ],
    sizes: ["38", "39", "40", "41"],
    variationType: "size",
    stock: 7,
    rating: 4.5,
    reviewCount: 11,
    isFeatured: false,
    isNew: false,
    isSale: true,
    details: [
      "Smooth calfskin leather upper",
      "Breathable leather lining and footbed",
      "Padded arch support",
      "Handmade leather outsole with 15mm rubber heel block"
    ],
    care: [
      "Clean with dry lint-free cloth",
      "Keep away from moist conditions"
    ]
  },
  {
    id: "prod-017",
    name: "Woven Rattan Tote",
    slug: "woven-rattan-tote",
    category: "bags-accessories",
    subcategory: "Bags",
    description: "A spacious basket tote woven from locally-sourced wild straw and finished with soft, vegetable-tanned leather shoulder straps. Perfect for carrying groceries, beach towels, or weekend essentials.",
    price: 650,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Natural Straw", value: "#E3C695" }
    ],
    sizes: ["One Size"],
    variationType: "size",
    stock: 5,
    rating: 4.9,
    reviewCount: 15,
    isFeatured: true,
    isNew: true,
    isSale: false,
    details: [
      "100% natural hand-woven straw",
      "Genuine flat leather shoulder straps",
      "Reinforced base and stitched leather corners",
      "Handmade in Bolgatanga, Ghana"
    ],
    care: [
      "If it loses shape, spray lightly with water, reshape, and let dry",
      "Wipe clean with a damp cloth and dry immediately"
    ]
  },
  {
    id: "prod-018",
    name: "Gold Link Necklace",
    slug: "gold-link-necklace",
    category: "bags-accessories",
    subcategory: "Jewellery",
    description: "A timeless, heavy-link chain necklace that adds effortless polish to any collar. Features a sleek, hidden clasp lock. Worn solo or layered, it is an everyday essential.",
    price: 220,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "18K Gold Plated", value: "#D4AF37" },
      { name: "Sterling Silver", value: "#C0C0C0" }
    ],
    sizes: ["One Size"],
    variationType: "size",
    stock: 18,
    rating: 4.6,
    reviewCount: 17,
    isFeatured: false,
    isNew: false,
    isSale: false,
    details: [
      "18k gold vermeil on brass",
      "High polish finish",
      "Secure custom toggle clasp closure",
      "Length: 45cm"
    ],
    care: [
      "Clean with soft polishing cloth",
      "Store flat in box to prevent scratching"
    ]
  },
  {
    id: "prod-019",
    name: "Amber & Jasmine Diffuser",
    slug: "amber-and-jasmine-diffuser",
    category: "home-living",
    subcategory: "Diffusers & Candles",
    description: "An elegant glass reed diffuser that slowly disperses a warm scent of rich amber, dark woods, and intoxicating jasmine. Comes with natural rattan reeds in a beautiful amber bottle that enhances home decor.",
    price: 280,
    originalPrice: 320,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Amber Glass", value: "#B07D3E" }
    ],
    sizes: ["100ml"],
    variationType: "volume",
    stock: 15,
    rating: 4.8,
    reviewCount: 22,
    isFeatured: false,
    isNew: false,
    isSale: true,
    details: [
      "Includes 8 natural rattan reeds",
      "Scent release lasts for 3-4 months",
      "Non-toxic, alcohol-free fragrance base",
      "Amber glass apothecary bottle"
    ],
    care: [
      "Flip reeds weekly to refresh the scent",
      "Keep bottle on flat, stable surface away from children"
    ]
  },
  {
    id: "prod-020",
    name: "Organic Glow Face Oil",
    slug: "organic-glow-face-oil",
    category: "beauty-fragrance",
    subcategory: "Skincare",
    description: "A fast-absorbing, cold-pressed face oil blend enriched with organic rosehip, marula, and jojoba oils. Restores natural radiance, deeply hydrates, and protects skin against urban pollution without feeling heavy.",
    price: 450,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Golden oil", value: "#F1C40F" }
    ],
    sizes: ["30ml"],
    variationType: "volume",
    stock: 18,
    rating: 5.0,
    reviewCount: 13,
    isFeatured: true,
    isNew: true,
    isSale: false,
    details: [
      "100% organic, cold-pressed plant oils",
      "Naturally rich in Vitamin A, C, and E",
      "Fragrance-free, ideal for sensitive skin",
      "Dermatologically tested"
    ],
    care: [
      "Apply 2-3 drops after water-based serums",
      "Keep bottle tightly closed in a cool, dark drawer"
    ]
  },
  {
    id: "prod-021",
    name: "Clay Refining Mask",
    slug: "clay-refining-mask",
    category: "beauty-fragrance",
    subcategory: "Skincare",
    description: "An intensive clay mask containing mineral-rich local clays, bentonite, and powdered rosehip. Unclogs pores, gently exfoliates dead skin, and absorbs excess oil to leave skin matte, smooth, and refined.",
    price: 190,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Matte Gray", value: "#A6A6A6" }
    ],
    sizes: ["60g"],
    variationType: "volume",
    stock: 22,
    rating: 4.2,
    reviewCount: 8,
    isFeatured: false,
    isNew: false,
    isSale: false,
    details: [
      "Natural kaolin and bentonite clays",
      "Infused with calming chamomile extract",
      "Powder form to preserve freshness (mix with water to apply)",
      "Enough for 12-15 applications"
    ],
    care: [
      "Mix 1 tsp of powder with equal parts water or rosewater",
      "Apply thin layer and let dry for 10 mins before rinsing"
    ]
  },
  {
    id: "prod-022",
    name: "Woven Kente Headband",
    slug: "woven-kente-headband",
    category: "bags-accessories",
    subcategory: "Hair Accessories",
    description: "A gorgeous, padded crown headband handmade with authentic woven cotton Kente fabric. Adds a stunning pop of traditional pattern and vibrant color to any minimalist look.",
    price: 150,
    images: ["/placeholder.jpg"],
    colors: [
      { name: "Kente Multi", value: "#FF5733" }
    ],
    sizes: ["One Size"],
    variationType: "size",
    stock: 25,
    rating: 4.9,
    reviewCount: 14,
    isFeatured: false,
    isNew: true,
    isSale: false,
    details: [
      "Handmade with 100% cotton handwoven Kente strips",
      "Comfortable flexible inner band with padded wrapping",
      "Width: 3.5cm",
      "Ethically manufactured in Kumasi, Ghana"
    ],
    care: [
      "Spot clean only with a damp cloth",
      "Do not machine wash or soak"
    ]
  }
];
