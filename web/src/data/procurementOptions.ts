export type ProcurementItem = {
  id: string;
  name: string;
  unit: string;
  category: string;
  subcategory?: string;
};

export const PROCUREMENT_CATEGORIES = [
  "Dairy Products",
  "Vegetables",
  "Fruits",
  "Grains & Cereals",
  "Pulses & Legumes",
  "Masala & Seasonings",
  "Oils & Fats",
  "Bakery & Dessert Ingredients",
  "Frozen & Processed Foods",
  "Cooking Utensils",
  "Serving Materials",
  "Packaging Materials",
  "Cleaning & Hygiene",
  "Waste Management",
  "Gas & Fuel",
  "Beverages",
  "Event Consumables",
] as const;

const item = (
  category: string,
  name: string,
  unit: string,
  subcategory?: string,
): ProcurementItem => ({
  id: [category, subcategory, name]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  name,
  unit,
  category,
  ...(subcategory ? { subcategory } : {}),
});

export const PROCUREMENT_ITEMS: ProcurementItem[] = [
  // 1. Dairy Products
  item("Dairy Products", "Milk", "ltr"),
  item("Dairy Products", "Curd", "kg"),
  item("Dairy Products", "Paneer", "kg"),
  item("Dairy Products", "Cheese", "kg"),
  item("Dairy Products", "Butter", "kg"),
  item("Dairy Products", "Ghee", "kg"),
  item("Dairy Products", "Cream", "ltr"),
  item("Dairy Products", "Khoya", "kg"),
  item("Dairy Products", "Ice Cream / Kulfi", "kg"),
  item("Dairy Products", "Basundi (A/S/K/MS/Sada/D)", "kg"),
  item("Dairy Products", "Amras (H/P)", "ltr"),
  item("Dairy Products", "Shrikhand", "kg"),
  item("Dairy Products", "Gulab Jamun", "kg"),
  item("Dairy Products", "Rasmalai", "kg"),
  item("Dairy Products", "Rasgulla", "kg"),

  // 2. Vegetables — daily catering essentials first, then others
  item("Vegetables", "Potato", "kg"),
  item("Vegetables", "Onion", "kg"),
  item("Vegetables", "Tomato", "kg"),
  item("Vegetables", "Cucumber", "kg"),
  item("Vegetables", "Carrot (R/O)", "kg"),
  item("Vegetables", "Beetroot", "kg"),
  item("Vegetables", "Ginger", "kg"),
  item("Vegetables", "Garlic", "kg"),
  item("Vegetables", "Mirchi", "kg"),
  item("Vegetables", "Curry Leaves", "kg"),
  item("Vegetables", "Coriander", "kg"),
  item("Vegetables", "Pudina", "kg"),
  item("Vegetables", "Palak", "kg"),
  item("Vegetables", "Cauliflower", "kg"),
  item("Vegetables", "Patta Gobhi", "kg"),
  item("Vegetables", "Beans", "kg"),
  item("Vegetables", "Shimla Mirch (Y/R/G)", "kg"),
  item("Vegetables", "Coconut", "pcs"),
  item("Vegetables", "Bhindi", "kg"),
  item("Vegetables", "Tindora", "kg"),
  item("Vegetables", "Baingan", "kg"),

  item("Vegetables", "Methi", "kg"),
  item("Vegetables", "Green Peas", "kg"),
  item("Vegetables", "Lauki", "kg"),
  item("Vegetables", "Turai", "kg"),
  item("Vegetables", "Karela", "kg"),
  item("Vegetables", "Pumpkin", "kg"),
  item("Vegetables", "Gavar", "kg"),
  item("Vegetables", "Radish", "kg"),
  item("Vegetables", "Sweet Potato", "kg"),
  item("Vegetables", "Suran (Yam)", "kg"),
  item("Vegetables", "Turnip", "kg"),
  item("Vegetables", "Spring Onion", "kg"),
  item("Vegetables", "Drumstick Leaves", "kg"),
  item("Vegetables", "Sarson (Mustard Greens)", "kg"),
  item("Vegetables", "Chaulai (Amaranth)", "kg"),
  item("Vegetables", "Lettuce", "kg"),
  item("Vegetables", "Mushroom", "kg"),
  item("Vegetables", "Baby Corn", "kg"),
  item("Vegetables", "Broccoli", "kg"),
  item("Vegetables", "Zucchini", "kg"),
  item("Vegetables", "Cherry Tomato", "kg"),
  item("Vegetables", "Celery", "kg"),
  item("Vegetables", "Iceberg Lettuce", "kg"),
  item("Vegetables", "Avocado", "kg"),
  item("Vegetables", "Asparagus", "kg"),
  item("Vegetables", "Basil", "bunch"),
  item("Vegetables", "Dill (Shepu)", "bunch"),
  item("Vegetables", "Rosemary", "bunch"),
  item("Vegetables", "Thyme", "bunch"),
  item("Vegetables", "Oregano", "bunch"),
  item("Vegetables", "Parsley", "bunch"),
  item("Vegetables", "Lemongrass", "bunch"),
  item("Vegetables", "Lemon", "bunch"),
  item("Vegetables", "Chavli Sheng (Lotus Stem)", "kg"),
  item("Vegetables", "Sweet Corn ", "kg"),
  item("Vegetables", "Lauki Sabzi", "kg"),
  item("Vegetables", "Gawar Sabzi", "kg"),
  
  

  // 3. Fruits — fresh first, then dry
  item("Fruits", "Banana", "kg"),
  item("Fruits", "Apple", "kg"),
  item("Fruits", "Orange", "kg"),
  item("Fruits", "Mosambi", "kg"),
  item("Fruits", "Pomegranate (Anar)", "kg"),
  item("Fruits", "Grapes (Green)", "kg"),
  item("Fruits", "Grapes (Black)", "kg"),
  item("Fruits", "Watermelon", "kg"),
  item("Fruits", "Musk Melon (Kharbuja)", "kg"),
  item("Fruits", "Papaya", "kg"),
  item("Fruits", "Pineapple", "kg"),
  item("Fruits", "Mango (Hapus/Alphonso)", "kg"),
  item("Fruits", "Mango (Kesar)", "kg"),
  item("Fruits", "Mango (Totapuri)", "kg"),
  item("Fruits", "Chikoo (Sapota)", "kg"),
  item("Fruits", "Guava", "kg"),
  item("Fruits", "Pear", "kg"),
  item("Fruits", "Kiwi", "kg"),
  item("Fruits", "Strawberry", "kg"),
  item("Fruits", "Jamun", "kg"),
  item("Fruits", "Sitaphal (Custard Apple)", "kg"),
  item("Fruits", "Dragon Fruit", "kg"),
  item("Fruits", "Litchi", "kg"),
  item("Fruits", "Coconut (Fresh)", "pcs"),

  item("Fruits", "Almond (Badam)", "kg"),
  item("Fruits", "Cashew (Kaju)", "kg"),
  item("Fruits", "Raisins (Kishmish)", "kg"),
  item("Fruits", "Black Raisins (Kali Kishmish)", "kg"),
  item("Fruits", "Walnut (Akhrot)", "kg"),
  item("Fruits", "Pistachio (Pista)", "kg"),
  item("Fruits", "Dates (Khajur)", "kg"),
  item("Fruits", "Dry Fig (Anjeer)", "kg"),
  item("Fruits", "Dry Apricot (Khumani)", "kg"),
  item("Fruits", "Charoli", "kg"),
  item("Fruits", "Dry Coconut (Kopra)", "kg"),
  item("Fruits", "Makhana", "kg"),
  item("Fruits", "Dry Berries (Cranberry/Blueberry)", "kg"),
  item("Fruits", "Mixed Dry Fruits", "kg"),

  // 4. Grains & Cereals
  item("Grains & Cereals", "Rice", "kg"),
  item("Grains & Cereals", "Wheat", "kg"),
  item("Grains & Cereals", "Maida", "kg"),
  item("Grains & Cereals", "Besan", "kg"),
  item("Grains & Cereals", "Aararot (Corn Flour)", "kg"),
  item("Grains & Cereals", "Suji Patla", "kg"),
  item("Grains & Cereals", "Suji Jada", "kg"),
  item("Grains & Cereals", "Poha Patla", "kg"),
  item("Grains & Cereals", "Poha Jada", "kg"),
  item("Grains & Cereals", "Vermicelli (Sewai)", "kg"),

  // 5. Pulses & Legumes — Marathi / Gujarati staples
  item("Pulses & Legumes", "Toor Dal (Tuvar / Arhar)", "kg"),
  item("Pulses & Legumes", "Moong Dal (Yellow)", "kg"),
  item("Pulses & Legumes", "Moong Dal (Chilka / Green Split)", "kg"),
  item("Pulses & Legumes", "Moong Whole (Sabut)", "kg"),
  item("Pulses & Legumes", "Chana Dal", "kg"),
  item("Pulses & Legumes", "Urad Dal (Split)", "kg"),
  item("Pulses & Legumes", "Urad Whole (Sabut)", "kg"),
  item("Pulses & Legumes", "Masoor Dal", "kg"),
  item("Pulses & Legumes", "Kabuli Chana (Chole)", "kg"),
  item("Pulses & Legumes", "Kala Chana", "kg"),
  item("Pulses & Legumes", "Harbhara (Brown Chana)", "kg"),
  item("Pulses & Legumes", "Rajma", "kg"),
  item("Pulses & Legumes", "Vaal (Field Bean / Lima)", "kg"),
  item("Pulses & Legumes", "Matki (Moth Bean)", "kg"),
  item("Pulses & Legumes", "Kulith (Horse Gram)", "kg"),
  item("Pulses & Legumes", "Chavli (Black Eyed Pea)", "kg"),
  item("Pulses & Legumes", "Watana (Dried Green Peas)", "kg"),
  item("Pulses & Legumes", "Red Chori (Red Cowpea)", "kg"),
  item("Pulses & Legumes", "Soybean", "kg"),
  item("Pulses & Legumes", "Black Beans", "kg"),
  item("Pulses & Legumes", "Mixed Dal", "kg"),

  // 6. Masala & Seasonings — khada masala, powders, blends
  item("Masala & Seasonings", "Cumin Seeds (Jeera)", "kg"),
  item("Masala & Seasonings", "Coriander Seeds (Dhania)", "kg"),
  item("Masala & Seasonings", "Black Pepper Whole (Kali Mirch)", "kg"),
  item("Masala & Seasonings", "Cloves (Lavang)", "kg"),
  item("Masala & Seasonings", "Cinnamon Sticks (Dalchini)", "kg"),
  item("Masala & Seasonings", "Green Cardamom (Elaichi)", "kg"),
  item("Masala & Seasonings", "Black Cardamom (Badi Elaichi)", "kg"),
  item("Masala & Seasonings", "Bay Leaf (Tej Patta)", "kg"),
  item("Masala & Seasonings", "Star Anise (Chakra Phool)", "kg"),
  item("Masala & Seasonings", "Nutmeg (Jaiphal)", "kg"),
  item("Masala & Seasonings", "Mace (Javitri)", "kg"),
  item("Masala & Seasonings", "Fennel Seeds (Saunf / Badishep)", "kg"),
  item("Masala & Seasonings", "Mustard Seeds (Rai / Mohri)", "kg"),
  item("Masala & Seasonings", "Fenugreek Seeds (Methi Dana)", "kg"),
  item("Masala & Seasonings", "Carom Seeds (Ajwain / Ova)", "kg"),
  item("Masala & Seasonings", "Nigella Seeds (Kalonji)", "kg"),
  item("Masala & Seasonings", "Shah Jeera (Caraway)", "kg"),
  item("Masala & Seasonings", "Dry Red Chilli Whole (Sukhi Mirch)", "kg"),
  item("Masala & Seasonings", "Kashmiri Chilli Whole", "kg"),
  item("Masala & Seasonings", "Dry Ginger Whole (Saunth)", "kg"),
  item("Masala & Seasonings", "Turmeric Whole (Amba Haldi)", "kg"),
  item("Masala & Seasonings", "Stone Flower (Dagad Phool)", "kg"),
  item("Masala & Seasonings", "Poppy Seeds (Khus Khus)", "kg"),
  item("Masala & Seasonings", "Sesame Seeds (Til)", "kg"),
  item("Masala & Seasonings", "Asafoetida Lump (Hing Khada)", "kg"),
  item("Masala & Seasonings", "White Pepper Whole", "kg"),
  item("Masala & Seasonings", "Long Pepper (Pippali)", "kg"),

  item("Masala & Seasonings", "Turmeric Powder (Haldi)", "kg"),
  item("Masala & Seasonings", "Red Chilli Powder (Lal Mirch)", "kg"),
  item("Masala & Seasonings", "Kashmiri Chilli Powder", "kg"),
  item("Masala & Seasonings", "Coriander Powder (Dhania Powder)", "kg"),
  item("Masala & Seasonings", "Cumin Powder (Jeera Powder)", "kg"),
  item("Masala & Seasonings", "Black Pepper Powder", "kg"),
  item("Masala & Seasonings", "Dry Ginger Powder (Saunth Powder)", "kg"),
  item("Masala & Seasonings", "Amchur Powder (Dry Mango)", "kg"),
  item("Masala & Seasonings", "Asafoetida Powder (Hing)", "kg"),
  item("Masala & Seasonings", "Kasuri Methi", "kg"),
  item("Masala & Seasonings", "Garam Masala Powder", "kg"),
  item("Masala & Seasonings", "Goda Masala", "kg"),
  item("Masala & Seasonings", "Kitchen King Masala", "kg"),
  item("Masala & Seasonings", "Sambhar Masala", "kg"),
  item("Masala & Seasonings", "Pav Bhaji Masala", "kg"),
  item("Masala & Seasonings", "Chana Masala", "kg"),
  item("Masala & Seasonings", "Rajma Masala", "kg"),
  item("Masala & Seasonings", "Chaat Masala", "kg"),
  item("Masala & Seasonings", "Tea Masala (Chai Masala)", "kg"),
  item("Masala & Seasonings", "Tandoori Masala", "kg"),
  item("Masala & Seasonings", "Biryani Masala", "kg"),
  item("Masala & Seasonings", "Panipuri / Ragada Masala", "kg"),
  item("Masala & Seasonings", "Dhana-Jeera Powder", "kg"),

  item("Masala & Seasonings", "Salt", "kg"),
  item("Masala & Seasonings", "Black Salt (Kala Namak)", "kg"),
  item("Masala & Seasonings", "Rock Salt (Sendha Namak)", "kg"),
  item("Masala & Seasonings", "Sugar", "kg"),
  item("Masala & Seasonings", "Jaggery", "kg"),
  item("Masala & Seasonings", "Food colors", "pack"),
  item("Masala & Seasonings", "Ajinomoto (MSG)", "kg"),
  item("Masala & Seasonings", "Flavouring agents", "pack"),

  // 7. Oils & Fats
  item("Oils & Fats", "Sunflower Oil", "ltr"),
  item("Oils & Fats", "Groundnut Oil", "ltr"),
  item("Oils & Fats", "Mustard Oil", "ltr"),
  item("Oils & Fats", "Vanaspati", "kg"),
  item("Oils & Fats", "Ghee", "kg"),

  // 8. Bakery & Dessert Ingredients
  item("Bakery & Dessert Ingredients", "Baking Powder", "kg"),
  item("Bakery & Dessert Ingredients", "Baking Soda", "kg"),
  item("Bakery & Dessert Ingredients", "Chocolate", "kg"),
  item("Bakery & Dessert Ingredients", "Custard Powder", "kg"),
  item("Bakery & Dessert Ingredients", "Corn Flour", "kg"),
  item("Bakery & Dessert Ingredients", "Jelly Mix", "pack"),
  item("Bakery & Dessert Ingredients", "Dry Fruits", "kg"),

  // 9. Frozen & Processed Foods
  item("Frozen & Processed Foods", "Frozen Peas", "kg"),
  item("Frozen & Processed Foods", "Frozen Corn", "kg"),
  item("Frozen & Processed Foods", "Frozen Snacks", "kg"),
  item("Frozen & Processed Foods", "Ready Mixes", "pack"),

  // 10. Cooking Utensils
  item("Cooking Utensils", "Kadai", "pcs"),
  item("Cooking Utensils", "Patila", "pcs"),
  item("Cooking Utensils", "Tawa", "pcs"),
  item("Cooking Utensils", "Gas Burner", "pcs"),
  item("Cooking Utensils", "Ladles", "pcs"),
  item("Cooking Utensils", "Knives", "pcs"),
  item("Cooking Utensils", "Chopping Boards", "pcs"),

  // 11. Serving Materials
  item("Serving Materials", "Plates", "pcs"),
  item("Serving Materials", "Bowls", "pcs"),
  item("Serving Materials", "Glasses", "pcs"),
  item("Serving Materials", "Cups", "pcs"),
  item("Serving Materials", "Spoons", "pcs"),
  item("Serving Materials", "Forks", "pcs"),
  item("Serving Materials", "Napkins", "pack"),
  item("Serving Materials", "Disposable Items", "pack"),

  // 12. Packaging Materials
  item("Packaging Materials", "Food Containers", "pack"),
  item("Packaging Materials", "Parcel Boxes", "pcs"),
  item("Packaging Materials", "Aluminum Foil", "roll"),
  item("Packaging Materials", "Cling Wrap", "roll"),
  item("Packaging Materials", "Paper Bags", "pack"),
  item("Packaging Materials", "Carry Bags", "pack"),

  // 13. Cleaning & Hygiene
  item("Cleaning & Hygiene", "Dishwash Liquid", "ltr"),
  item("Cleaning & Hygiene", "Floor Cleaner", "ltr"),
  item("Cleaning & Hygiene", "Sanitizer", "ltr"),
  item("Cleaning & Hygiene", "Gloves", "box"),
  item("Cleaning & Hygiene", "Hair Nets", "pack"),
  item("Cleaning & Hygiene", "Aprons", "pcs"),
  item("Cleaning & Hygiene", "Garbage Bags", "pack"),

  // 14. Waste Management
  item("Waste Management", "Wet Waste Bins", "pcs"),
  item("Waste Management", "Dry Waste Bins", "pcs"),
  item("Waste Management", "Compost Bags", "pack"),
  item("Waste Management", "Garbage Collection Supplies", "pack"),

  // 15. Gas & Fuel
  item("Gas & Fuel", "LPG Cylinders", "pcs"),
  item("Gas & Fuel", "Charcoal", "kg"),
  item("Gas & Fuel", "Wood", "kg"),
  item("Gas & Fuel", "Fuel Tracking", "lot"),

  // 16. Beverages
  item("Beverages", "Tea", "kg"),
  item("Beverages", "Coffee", "kg"),
  item("Beverages", "Soft Drinks", "case"),
  item("Beverages", "Juices", "ltr"),
  item("Beverages", "Mineral Water", "case"),

  // 17. Event Consumables
  item("Event Consumables", "Decoration Materials", "lot"),
  item("Event Consumables", "Candles", "pack"),
  item("Event Consumables", "Tissue Papers", "pack"),
  item("Event Consumables", "Table Covers", "pcs"),
];

export const itemsByCategory = PROCUREMENT_CATEGORIES.reduce<Record<string, ProcurementItem[]>>(
  (acc, cat) => {
    acc[cat] = PROCUREMENT_ITEMS.filter((i) => i.category === cat);
    return acc;
  },
  {},
);

export const groupItemsBySubcategory = (
  items: ProcurementItem[],
  subcategoryOrder: readonly string[] = VEGETABLE_SUBCATEGORIES,
): { subcategory: string; items: ProcurementItem[] }[] => {
  const groups = items.reduce<Record<string, ProcurementItem[]>>((acc, i) => {
    const key = i.subcategory || "Other";
    (acc[key] ||= []).push(i);
    return acc;
  }, {});

  const ordered = subcategoryOrder
    .filter((sub) => groups[sub]?.length)
    .map((sub) => ({ subcategory: sub, items: groups[sub] }));

  const rest = Object.keys(groups)
    .filter((sub) => !subcategoryOrder.includes(sub))
    .sort()
    .map((sub) => ({ subcategory: sub, items: groups[sub] }));

  return [...ordered, ...rest];
};

