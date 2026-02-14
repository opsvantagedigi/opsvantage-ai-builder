import type { Metadata } from "next";
import CategoryPage, { generateMetadata as generateCategoryMetadata } from "../[category]/page";

export async function generateMetadata(): Promise<Metadata> {
  return generateCategoryMetadata({ params: { category: "licenses" } });
}

export default async function LicensesPage() {
  return CategoryPage({ params: { category: "licenses" } });
}
