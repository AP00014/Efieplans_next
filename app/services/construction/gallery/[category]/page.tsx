import { getAllCategories } from "../../../../../lib/Construction-data";
import ConstructionGalleryClient from "./ConstructionGalleryClient";

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category,
  }));
}

export default function Page() {
  return <ConstructionGalleryClient />;
}
