"use client"

import { BookOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ContentTypeSelectorProps {
  selectedType: "course" | "guide" | null
  onTypeSelect: (type: "course" | "guide") => void
}

export function ContentTypeSelector({ selectedType, onTypeSelect }: ContentTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Choose the format:</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant={selectedType === "course" ? "default" : "outline"}
          className={cn(
            "flex-1 h-12 sm:h-16 flex-col gap-2",
            selectedType === "course" && "bg-purple-600 hover:bg-purple-700",
          )}
          onClick={() => onTypeSelect("course")}
        >
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Course</span>
        </Button>
        <Button
          variant={selectedType === "guide" ? "default" : "outline"}
          className={cn(
            "flex-1 h-12 sm:h-16 flex-col gap-2",
            selectedType === "guide" && "bg-blue-600 hover:bg-blue-700",
          )}
          onClick={() => onTypeSelect("guide")}
        >
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Guide</span>
        </Button>
      </div>
    </div>
  )
}
