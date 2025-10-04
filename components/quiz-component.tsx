"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, HelpCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuizDetail, apiService } from "@/lib/api"

interface QuizComponentProps {
  readonly quiz: QuizDetail
  readonly onQuizComplete?: (quizId: string, isCorrect: boolean) => void
}

export function QuizComponent({ quiz, onQuizComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(quiz.is_completed)
  const [checkedAnswers, setCheckedAnswers] = useState<{ [questionIndex: number]: boolean }>({})
  const [answerFeedback, setAnswerFeedback] = useState<{ [questionIndex: number]: { isCorrect: boolean; message: string } }>({})
  const [isCompletingQuiz, setIsCompletingQuiz] = useState(false)

  // Reset quiz state when quiz changes
  useEffect(() => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(quiz.is_completed)
    setCheckedAnswers({})
    setAnswerFeedback({})
    setIsCompletingQuiz(false)
  }, [quiz.id]) // Reset when quiz ID changes

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
    // Reset checked state when a new answer is selected
    setCheckedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: false
    }))
    // Clear any existing feedback for this question
    setAnswerFeedback(prev => {
      const newFeedback = { ...prev }
      delete newFeedback[currentQuestionIndex]
      return newFeedback
    })
  }

  // Helper function to check if an answer is correct
  const isAnswerCorrect = (question: any, selectedAnswer: string) => {
    const choices = question.choices
    const correctAnswerText = question.answer
    
    // Find the correct choice from the choices array
    const correctChoice = choices.find((choice: string) => {
      const choiceLetter = choice.includes(': ') ? choice.split(':')[0].trim() : choice
      
      // Check if this choice matches the correct answer
      if (correctAnswerText.includes(': ')) {
        // If correct answer is in format "B: To predict...", compare directly
        return choice === correctAnswerText
      } else {
        // If correct answer is just "B", extract letter from choice and compare
        return choiceLetter === correctAnswerText
      }
    })
    
    // Check if selected answer matches the correct choice
    return selectedAnswer === correctChoice
  }

  const handleCheckAnswer = () => {
    const selectedAnswer = selectedAnswers[currentQuestionIndex]
    const question = normalizedQuestions[currentQuestionIndex]
    
    if (!selectedAnswer) {
      alert("Please select an answer first!")
      return
    }

    const isCorrect = isAnswerCorrect(question, selectedAnswer)
    const message = isCorrect ? "Correct! Well done." : "Incorrect. Try again."
    
    // Mark this question as checked (even for wrong answers)
    setCheckedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: true
    }))
    
    // Set the feedback
    setAnswerFeedback(prev => ({
      ...prev,
      [currentQuestionIndex]: { isCorrect, message }
    }))
  }

  const handleNextQuestion = async () => {
    // Check if current question has been answered and checked
    const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined
    const hasChecked = checkedAnswers[currentQuestionIndex] === true
    
    if (!hasAnswered) {
      alert("Please select an answer first!")
      return
    }
    
    if (!hasChecked) {
      alert("Please check your answer first!")
      return
    }

    if (currentQuestionIndex < normalizedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Quiz completed - call API to mark quiz as completed
      setIsCompletingQuiz(true)
      
      try {
        const completionResponse = await apiService.completeQuiz(quiz.id, true)
        
        if (completionResponse.success) {
          setQuizCompleted(true)
          
          // Calculate score
          const correctAnswers = normalizedQuestions.filter((question, index) => {
            const selectedAnswer = selectedAnswers[index]
            return isAnswerCorrect(question, selectedAnswer || '')
          }).length
          
          const isCorrect = correctAnswers === normalizedQuestions.length
          
          // Call the callback immediately to navigate to next quiz (skip results page)
          if (onQuizComplete) {
            onQuizComplete(quiz.id, isCorrect)
          }
        } else {
          alert('Failed to complete quiz: ' + completionResponse.message)
        }
      } catch (error) {
        console.error('Error completing quiz:', error)
        alert('Failed to complete quiz. Please try again.')
      } finally {
        setIsCompletingQuiz(false)
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
    setCheckedAnswers({})
    setAnswerFeedback({})
    setIsCompletingQuiz(false)
  }

  const getAnswerStatus = (questionIndex: number, answer: string) => {
    if (!showResults) return ""
    
    const question = normalizedQuestions[questionIndex]
    const selectedAnswer = selectedAnswers[questionIndex]
    
    // Check if this answer option is the correct one
    const isThisAnswerCorrect = isAnswerCorrect(question, answer)
    
    // Check if user selected the correct answer
    const isUserAnswerCorrect = isAnswerCorrect(question, selectedAnswer || '')
    
    if (isThisAnswerCorrect || (answer === selectedAnswer && isUserAnswerCorrect)) {
      return "correct"
    } else if (answer === selectedAnswer && !isUserAnswerCorrect) {
      return "incorrect"
    }
    return ""
  }

  const getScore = () => {
    const correctAnswers = normalizedQuestions.filter((question, index) => {
      const selectedAnswer = selectedAnswers[index]
      return isAnswerCorrect(question, selectedAnswer || '')
    }).length
    return Math.round((correctAnswers / normalizedQuestions.length) * 100)
  }

  if (false && quizCompleted && showResults) {
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
                return isAnswerCorrect(question, selectedAnswer || '')
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.choices.map((choice, index) => {
              const feedback = answerFeedback[currentQuestionIndex]
              const isSelectedAnswer = selectedAnswers[currentQuestionIndex] === choice
              let choiceClass = "bg-gray-50 hover:bg-gray-gray-100 border-gray-200"
              
              // Apply styling based on feedback
              if (feedback && isSelectedAnswer) {
                choiceClass = feedback.isCorrect 
                  ? "bg-green-100 text-green-800 border-green-300" 
                  : "bg-red-100 text-red-800 border-red-300"
              } else if (isSelectedAnswer) {
                choiceClass = "bg-primary text-primary-foreground border-primary"
              }
              
              return (
                <button
                  key={`choice-${currentQuestion.question.slice(0, 10)}-${index}`}
                  onClick={() => handleAnswerSelect(choice)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${choiceClass}`}
                  disabled={feedback?.isCorrect === false && isSelectedAnswer}
                >
                  <div className="flex items-center justify-between">
                    <span>{choice}</span>
                    {feedback && isSelectedAnswer && (
                      <span className="text-lg">
                        {feedback.isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Feedback message */}
          {answerFeedback[currentQuestionIndex] && (
            <div className={`p-3 rounded-lg border ${
              answerFeedback[currentQuestionIndex].isCorrect 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {answerFeedback[currentQuestionIndex].message}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className="flex-1"
            >
              {(() => {
                const isChecked = checkedAnswers[currentQuestionIndex]
                const feedback = answerFeedback[currentQuestionIndex]
                const isWrongAnswer = feedback && !feedback.isCorrect
                
                if (!isChecked) {
                  return "Check Answer"
                } else if (isWrongAnswer) {
                  return "Try Again" // Allow retry for wrong answers
                } else {
                  return "Answer Checked"
                }
              })()}
            </Button>
            <div className="flex gap-2">
              {currentQuestionIndex > 0 && (
                <Button onClick={handlePreviousQuestion} variant="outline">
                  Previous
                </Button>
              )}
              <Button 
                onClick={handleNextQuestion}
                disabled={(() => {
                  const isChecked = checkedAnswers[currentQuestionIndex]
                  const isLastQuestion = currentQuestionIndex >= normalizedQuestions.length - 1
                  
                  if (!isChecked || isCompletingQuiz) {
                    return true // Disabled if not checked or completing
                  }
                  
                  if (isLastQuestion) {
                    // For Finish Quiz button, check if answer is correct
                    const feedback = answerFeedback[currentQuestionIndex]
                    return feedback ? !feedback.isCorrect : true
                  }
                  
                  return false // Next button enabled after checked
                })()}
                variant="default"
                className={(() => {
                  const isChecked = checkedAnswers[currentQuestionIndex]
                  const isLastQuestion = currentQuestionIndex >= normalizedQuestions.length - 1
                  const feedback = answerFeedback[currentQuestionIndex]
                  
                  const isDisabled = !isChecked || isCompletingQuiz || (isLastQuestion && feedback && !feedback.isCorrect)
                  return isDisabled ? "opacity-50 cursor-not-allowed" : ""
                })()}
              >
                {(() => {
                  if (isCompletingQuiz) {
                    return "Completing..."
                  }
                  return currentQuestionIndex < normalizedQuestions.length - 1 ? "Next" : "Finish Quiz"
                })()}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
