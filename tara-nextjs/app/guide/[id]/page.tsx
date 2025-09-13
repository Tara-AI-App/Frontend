import { GuideViewPage } from "@/components/guide-view-page"

export default function GuideViewPageRoute({ params }: { params: { id: string } }) {
  return <GuideViewPage guideId={params.id} />
}
