import { supabase } from "../../../lib/supabase";
import ProjectClient from "./ProjectClient";

export async function generateStaticParams() {
  console.log("Generating static params for projects...");
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id");

    if (error) {
      console.error("Error fetching projects for static params:", error);
      return [];
    }

    return (projects || []).map((project) => ({
      id: String(project.id),
    }));
  } catch (error) {
    console.error("Exception in generateStaticParams:", error);
    return [];
  }
}

export default function Page() {
  return <ProjectClient />;
}
