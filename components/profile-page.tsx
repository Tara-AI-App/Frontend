"use client"

import { User, Clock, BookOpen, Target, TrendingUp, Award, Mail, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock user data
const userData = {
  fullName: "Sarah Chen",
  title: "Senior Software Engineer",
  team: "Data Science Engineering - Growth Team",
  email: "sarah.chen@gojek.com",
  location: "Singapore",
  joinDate: "March 2021",
  avatar: "/images/profile-avatar.png",
}

const profileStats = {
  learningTime: 1250, // minutes
  totalCoursesLearned: 12,
  skills: ["React", "Node.js", "TypeScript", "Docker", "AWS", "GraphQL"],
  averageQuizScore: 87.5,
  medianQuizScore: 89.0,
  completionRate: 78.3,
  learningPathProgression: 65.2,
}

const recentAchievements = [
  { title: "Fast Learner", description: "Completed 3 courses this week", icon: TrendingUp },
  { title: "Quiz Master", description: "Scored 95%+ on 5 consecutive quizzes", icon: Award },
  { title: "Consistent Learner", description: "7-day learning streak", icon: Target },
]

export function ProfilePage() {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-3 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {userData.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{userData.fullName}</h1>
                    <p className="text-lg text-muted-foreground">{userData.title}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {userData.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {userData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {userData.joinDate}
                    </div>
                  </div>

                  <Badge variant="outline" className="w-fit">
                    {userData.team}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-blue-600 text-white">
                <User className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Learning Dashboard</h2>
                <p className="text-sm md:text-base text-muted-foreground">Track your progress and achievements</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Learning Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{formatTime(profileStats.learningTime)}</div>
                <p className="text-xs text-muted-foreground">Total time spent learning</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Courses Completed</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{profileStats.totalCoursesLearned}</div>
                <p className="text-xs text-muted-foreground">Courses successfully finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Average Quiz Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{profileStats.averageQuizScore}%</div>
                <p className="text-xs text-muted-foreground">Median: {profileStats.medianQuizScore}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{profileStats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Course completion rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Acquired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileStats.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Path Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Path Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{profileStats.learningPathProgression}%</span>
                  </div>
                  <Progress value={profileStats.learningPathProgression} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">You're making great progress on your learning journey!</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <achievement.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
