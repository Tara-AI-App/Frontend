import { GuideViewPage } from "@/components/guide-view-page"

export default async function GuideViewPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GuideViewPage guideId={id} />
}
