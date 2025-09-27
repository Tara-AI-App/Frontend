import { CourseViewPage } from "@/components/course-view-page"

export default async function CourseViewPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CourseViewPage courseId={id} />
}
