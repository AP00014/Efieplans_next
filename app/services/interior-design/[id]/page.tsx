import { getAllMedia } from "../../../../lib/InteriorDesign-data";
import InteriorDesignDetailClient from "./InteriorDesignDetailClient";

export function generateStaticParams() {
  const allMedia = getAllMedia();
  return allMedia.map((item) => ({
    id: item.id,
  }));
}

export default function Page() {
  return <InteriorDesignDetailClient />;
}


