"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, HelpCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { QuizDetail } from "@/lib/api"

interface QuizComponentProps {
  quiz: QuizDetail
  onQuizComplete?: (quizId: string, isCorrect: boolean) => void
}

export function QuizComponent({ quiz, onQuizComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(quiz.is_completed)

  // Normalize quiz questions - handle both array and single object formats
  const normalizeQuestions = (questions: any) => {
    if (!questions) return []
    
    let questionsArray: any[] = []
    
    if (Array.isArray(questions)) {
      questionsArray = questions
    } else if (questions.question && questions.choices && questions.answer) {
      // Single question object, convert to array
      questionsArray = [questions]
    } else {
      return []
    }

    // Normalize each question to ensure choices is always an array
    return questionsArray.map(q => {
      let normalizedChoices: string[] = []
      
      if (Array.isArray(q.choices)) {
        // Already an array, extract text from objects or convert to strings
        normalizedChoices = q.choices.map((choice: any) => {
          if (typeof choice === 'string') {
            return choice
          } else if (typeof choice === 'object' && choice !== null) {
            // If it's an object, try to extract text property or convert to string
            return choice.text || choice.label || choice.value || String(choice)
          } else {
            return String(choice)
          }
        })
      } else if (typeof q.choices === 'object' && q.choices !== null) {
        // Handle object/dictionary format like {"A": "option 1", "B": "option 2"}
        normalizedChoices = Object.entries(q.choices).map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key}: ${value}`
          } else {
            return `${key}: ${String(value)}`
          }
        })
      } else if (typeof q.choices === 'string') {
        // If it's a string, try to parse it as JSON or split by comma
        try {
          const parsed = JSON.parse(q.choices)
          if (Array.isArray(parsed)) {
            normalizedChoices = parsed.map((choice: any) => {
              if (typeof choice === 'string') {
                return choice
              } else if (typeof choice === 'object' && choice !== null) {
                return choice.text || choice.label || choice.value || String(choice)
              } else {
                return String(choice)
              }
            })
          } else {
            normalizedChoices = [String(q.choices)]
          }
        } catch {
          // If JSON parsing fails, treat as comma-separated string
          normalizedChoices = q.choices.split(',').map((choice: string) => choice.trim())
        }
      } else {
        // Fallback: convert to string and wrap in array
        normalizedChoices = [String(q.choices || '')]
      }

      return {
        ...q,
        choices: normalizedChoices
      }
    })
  }

  const normalizedQuestions = normalizeQuestions(quiz?.questions)

  // Debug: Log the quiz data to understand the structure
  console.log('Quiz data:', quiz)
  console.log('Normalized questions:', normalizedQuestions)
  if (normalizedQuestions.length > 0) {
    console.log('First question choices:', normalizedQuestions[0]?.choices)
    console.log('First question choices type:', typeof normalizedQuestions[0]?.choices)
  }

  // Validate quiz data
  if (!quiz || normalizedQuestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quiz questions available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = normalizedQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / normalizedQuestions.length) * 100

  // Additional validation for current question
  if (!currentQuestion) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Quiz question not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Validate current question has valid choices
  if (!currentQuestion.choices || !Array.isArray(currentQuestion.choices) || currentQuestion.choices.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Quiz question has no valid choices</p>
            <p className="text-sm text-gray-500 mt-2">Raw choices: {JSON.stringify(currentQuestion.choices)}</p>
            <p className="text-sm text-gray-500">Choices type: {typeof currentQuestion.choices}</p>
            <p className="text-sm text-gray-500">Is array: {Array.isArray(currentQuestion.choices) ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < normalizedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Quiz completed
      setShowResults(true)
      setQuizCompleted(true)
      
      // Calculate score
      const correctAnswers = normalizedQuestions.filter((question, index) => 
        selectedAnswers[index] === question.answer
      ).length
      
      const isCorrect = correctAnswers === normalizedQuestions.length
      
      if (onQuizComplete) {
        onQuizComplete(quiz.id, isCorrect)
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(false)
  }

  const getAnswerStatus = (questionIndex: number, answer: string) => {
    if (!showResults) return ""
    
    const question = normalizedQuestions[questionIndex]
    const selectedAnswer = selectedAnswers[questionIndex]
    
    // Extract the actual answer value from the selected answer string
    let selectedValue = selectedAnswer
    let correctValue = question.answer
    
    // If choices were in dictionary format, extract the value part for comparison
    if (selectedAnswer && selectedAnswer.includes(': ')) {
      selectedValue = selectedAnswer.split(': ')[1]
    }
    if (question.answer && question.answer.includes(': ')) {
      correctValue = question.answer.split(': ')[1]
    }
    
    if (selectedValue === correctValue || answer === correctValue) {
      return "correct"
    } else if (selectedValue === answer && selectedValue !== correctValue) {
      return "incorrect"
    }
    return ""
  }

  const getScore = () => {
    const correctAnswers = normalizedQuestions.filter((question, index) => {
      const selectedAnswer = selectedAnswers[index]
      let selectedValue = selectedAnswer
      let correctValue = question.answer
      
      // If choices were in dictionary format, extract the value part for comparison
      if (selectedAnswer && selectedAnswer.includes(': ')) {
        selectedValue = selectedAnswer.split(': ')[1]
      }
      if (question.answer && question.answer.includes(': ')) {
        correctValue = question.answer.split(': ')[1]
      }
      
      return selectedValue === correctValue
    }).length
    return Math.round((correctAnswers / normalizedQuestions.length) * 100)
  }

  if (quizCompleted && showResults) {
    const score = getScore()
    const isPassing = score >= 70 // 70% passing grade
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">{score}%</div>
            <div className="flex items-center justify-center gap-2">
              {isPassing ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">Passed!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 font-medium">Failed</span>
                </>
              )}
            </div>
            <Badge variant={isPassing ? "default" : "destructive"}>
              {isPassing ? "Quiz Completed" : "Needs Retake"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Correct Answers: {normalizedQuestions.filter((question, index) => {
                const selectedAnswer = selectedAnswers[index]
                let selectedValue = selectedAnswer
                let correctValue = question.answer
                
                if (selectedAnswer && selectedAnswer.includes(': ')) {
                  selectedValue = selectedAnswer.split(': ')[1]
                }
                if (question.answer && question.answer.includes(': ')) {
                  correctValue = question.answer.split(': ')[1]
                }
                
                return selectedValue === correctValue
              }).length} / {normalizedQuestions.length}
            </div>
            <Progress value={score} className="h-2" />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Question Review:</h4>
            {normalizedQuestions.map((question, index) => (
              <div key={`question-${question.question.slice(0, 20)}-${index}`} className="p-3 border rounded-lg">
                <div className="font-medium mb-2">{question.question}</div>
                <div className="space-y-1">
                  {question.choices.map((choice, choiceIndex) => {
                    const status = getAnswerStatus(index, choice)
                    let statusClass = "bg-gray-50"
                    if (status === "correct") {
                      statusClass = "bg-green-100 text-green-800 border border-green-200"
                    } else if (status === "incorrect") {
                      statusClass = "bg-red-100 text-red-800 border border-red-200"
                    }
                    
                    return (
                      <div
                        key={`choice-${question.question.slice(0, 10)}-${index}-${choiceIndex}`}
                        className={`p-2 rounded text-sm ${statusClass}`}
                      >
                        {choice}
                        {status === "correct" && <CheckCircle className="h-4 w-4 inline ml-2" />}
                        {status === "incorrect" && <XCircle className="h-4 w-4 inline ml-2" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={resetQuiz} variant="outline" className="flex-1">
              Retake Quiz
            </Button>
            <Button onClick={() => setShowResults(false)} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Quiz
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          Question {currentQuestionIndex + 1} of {normalizedQuestions.length}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.choices.map((choice, index) => (
              <button
                key={`choice-${currentQuestion.question.slice(0, 10)}-${index}`}
                onClick={() => handleAnswerSelect(choice)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  selectedAnswers[currentQuestionIndex] === choice
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
