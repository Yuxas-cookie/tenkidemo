import { notFound } from "next/navigation";
import { sampleSites } from "@/lib/data/sites";
import { SimulationView } from "@/components/ai/simulation-view";

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const site = sampleSites.find((s) => s.id === siteId);

  if (!site) {
    notFound();
  }

  return <SimulationView site={site} />;
}
