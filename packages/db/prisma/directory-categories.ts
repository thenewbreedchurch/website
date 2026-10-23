// The directory's categories (the 12 used by the original directory app) with
// starter subcategories. Subcategories are plain text on each vendor, so these
// lists are only suggestions for the listing form — admins can edit them in
// /admin/directory/categories at any time.
export const DIRECTORY_CATEGORIES: { name: string; subcategories: string[] }[] = [
  { name: "Arts, Crafts & Handmade Products", subcategories: ["Art & Paintings", "Handmade Jewelry", "Beadwork", "Home Decor", "Gift Items"] },
  { name: "Beauty & Personal Care", subcategories: ["Hair Styling", "Makeup Artist", "Skincare", "Nails", "Barbing", "Spa & Massage"] },
  { name: "Education & Training", subcategories: ["Tutoring", "Vocational Training", "Music Lessons", "Coaching", "Language Classes"] },
  { name: "Events & Entertainment", subcategories: ["Event Planning", "MC & Hosting", "DJ & Sound", "Decor & Rentals", "Live Band"] },
  { name: "Fashion & Tailoring", subcategories: ["Tailoring", "Ready-to-Wear", "Bespoke", "Accessories", "Shoes & Bags"] },
  { name: "Food & Catering", subcategories: ["Catering", "Food Delivery", "Baking & Cakes", "Small Chops", "Meal Prep"] },
  { name: "Graphic Design & Branding", subcategories: ["Logo Design", "Brand Identity", "Print Design", "Social Media Design"] },
  { name: "Home & Maintenance Services", subcategories: ["Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry", "AC & Appliance Repair"] },
  { name: "Logistics & Delivery", subcategories: ["Dispatch Riders", "Courier", "Moving & Haulage", "Errands"] },
  { name: "Photography & Videography", subcategories: ["Wedding Photography", "Portraits", "Event Coverage", "Videography", "Drone"] },
  { name: "Professional & Consulting Services", subcategories: ["Accounting", "Legal", "Business Consulting", "Real Estate", "Insurance", "HR & Recruitment"] },
  { name: "Technology & Digital Services", subcategories: ["Web Development", "App Development", "IT Support", "Digital Marketing", "Data & Analytics"] },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
