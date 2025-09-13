import { CourseViewPage } from "@/components/course-view-page"

export default function CourseViewPageRoute({ params }: { params: { id: string } }) {
  return <CourseViewPage courseId={params.id} />
}
