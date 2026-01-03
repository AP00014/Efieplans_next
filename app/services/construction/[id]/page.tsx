import { getAllMedia } from "../../../../lib/Construction-data";
import ConstructionDetailClient from "./ConstructionDetailClient";

export function generateStaticParams() {
  const allMedia = getAllMedia();
  return allMedia.map((item) => ({
    id: item.id,
  }));
}

export default function Page() {
  return <ConstructionDetailClient />;
}
