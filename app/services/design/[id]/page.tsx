import { getAllMedia } from "../../../../lib/Design-data";
import DesignDetailClient from "./DesignDetailClient";

export function generateStaticParams() {
  const allMedia = getAllMedia();
  return allMedia.map((item) => ({
    id: item.id,
  }));
}

export default function Page() {
  return <DesignDetailClient />;
}

