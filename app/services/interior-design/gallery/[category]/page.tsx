import { getAllCategories } from "../../../../../lib/InteriorDesign-data";
import InteriorDesignGalleryClient from "./InteriorDesignGalleryClient";

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category,
  }));
}

export default function Page() {
  return <InteriorDesignGalleryClient />;
}
