import { notFound } from "next/navigation";
import LifestyleCheckIn from "@/components/care/LifestyleCheckIn";
import { isLifestyleArea } from "@/data/lifestyleCheckIn";

export default async function CareLifestyleCheckInPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  if (!isLifestyleArea(area)) notFound();
  return <LifestyleCheckIn area={area} />;
}
