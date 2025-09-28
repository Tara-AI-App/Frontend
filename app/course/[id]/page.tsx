import { CourseDetailPage } from "@/components/course-detail-page"

export default async function CourseViewPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CourseDetailPage courseId={id} />
}
