import { getAllCategories } from "../../../../../lib/Design-data";
import DesignGalleryClient from "./DesignGalleryClient";

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category,
  }));
}

export default function Page() {
  return <DesignGalleryClient />;
}
