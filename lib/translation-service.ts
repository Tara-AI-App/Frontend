/**
 * Translation Service for Course Content
 * Translates course titles, descriptions, lessons, and quiz questions
 * from English to Indonesian using client-side caching
 */

import { CourseDetail, LessonDetail, QuizDetail, ModuleDetail, GuideDetailResponse } from './api'

// Simple in-memory cache for translations
const translationCache = new Map<string, string>()

// Get cache key
function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}:${text.substring(0, 100)}`
}

/**
 * Translate text using Google Translate API (or any translation API)
 * In production, you should use a proper translation API
 */
async function translateText(text: string, targetLang: 'id' | 'en'): Promise<string> {
  // If target is English, return as is (assuming content is in English by default)
  if (targetLang === 'en') {
    return text
  }

  // Check cache first
  const cacheKey = getCacheKey(text, targetLang)
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  try {
    // Use Google Translate API via a public endpoint
    // Note: In production, use your own translation service or API key
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`

    const response = await fetch(url)
    const data = await response.json()

    // Extract translated text from response
    const translated = data[0]?.map((item: any) => item[0]).join('') || text

    // Cache the result
    translationCache.set(cacheKey, translated)

    return translated
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text if translation fails
    return text
  }
}

/**
 * Translate an array of strings
 */
async function translateArray(items: string[], targetLang: 'id' | 'en'): Promise<string[]> {
  if (targetLang === 'en') {
    return items
  }

  const translations = await Promise.all(
    items.map(item => translateText(item, targetLang))
  )

  return translations
}

/**
 * Translate lesson content
 */
export async function translateLesson(
  lesson: LessonDetail,
  targetLang: 'id' | 'en'
): Promise<LessonDetail> {
  if (targetLang === 'en') {
    return lesson
  }

  const [translatedTitle, translatedContent] = await Promise.all([
    translateText(lesson.title, targetLang),
    translateText(lesson.content, targetLang),
  ])

  return {
    ...lesson,
    title: translatedTitle,
    content: translatedContent,
  }
}

/**
 * Translate quiz questions and choices
 */
export async function translateQuiz(
  quiz: QuizDetail,
  targetLang: 'id' | 'en'
): Promise<QuizDetail> {
  if (targetLang === 'en') {
    return quiz
  }

  // Handle case where questions might be undefined or empty
  if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return quiz
  }

  try {
    const translatedQuestions = await Promise.all(
      quiz.questions.map(async (q) => {
        // Additional null checks for each question
        if (!q || !q.question || !q.choices || !q.answer) {
          return q
        }

        const [translatedQuestion, translatedChoices, translatedAnswer] = await Promise.all([
          translateText(q.question, targetLang),
          translateArray(q.choices, targetLang),
          translateText(q.answer, targetLang),
        ])

        return {
          question: translatedQuestion,
          choices: translatedChoices,
          answer: translatedAnswer,
        }
      })
    )

    return {
      ...quiz,
      questions: translatedQuestions,
    }
  } catch (error) {
    console.error('Error translating quiz:', error)
    // Return original quiz if translation fails
    return quiz
  }
}

/**
 * Translate module
 */
export async function translateModule(
  module: ModuleDetail,
  targetLang: 'id' | 'en'
): Promise<ModuleDetail> {
  if (targetLang === 'en') {
    return module
  }

  const [translatedTitle, translatedLessons, translatedQuizzes] = await Promise.all([
    translateText(module.title, targetLang),
    module.lessons && module.lessons.length > 0
      ? Promise.all(module.lessons.map(lesson => translateLesson(lesson, targetLang)))
      : Promise.resolve([]),
    module.quizzes && module.quizzes.length > 0
      ? Promise.all(module.quizzes.map(quiz => translateQuiz(quiz, targetLang)))
      : Promise.resolve([]),
  ])

  return {
    ...module,
    title: translatedTitle,
    lessons: translatedLessons,
    quizzes: translatedQuizzes,
  }
}

/**
 * Translate entire course content
 */
export async function translateCourse(
  course: CourseDetail,
  targetLang: 'id' | 'en'
): Promise<CourseDetail> {
  if (targetLang === 'en') {
    return course
  }

  const [
    translatedTitle,
    translatedDescription,
    translatedObjectives,
    translatedModules
  ] = await Promise.all([
    translateText(course.title, targetLang),
    course.description ? translateText(course.description, targetLang) : Promise.resolve(undefined),
    course.learning_objectives && course.learning_objectives.length > 0
      ? translateArray(course.learning_objectives, targetLang)
      : Promise.resolve(undefined),
    course.modules && course.modules.length > 0
      ? Promise.all(course.modules.map(module => translateModule(module, targetLang)))
      : Promise.resolve([]),
  ])

  return {
    ...course,
    title: translatedTitle,
    description: translatedDescription,
    learning_objectives: translatedObjectives,
    modules: translatedModules,
  }
}

/**
 * Translate guide content
 */
export async function translateGuide(
  guide: GuideDetailResponse,
  targetLang: 'id' | 'en'
): Promise<GuideDetailResponse> {
  if (targetLang === 'en') {
    return guide
  }

  const [
    translatedTitle,
    translatedDescription,
    translatedContent
  ] = await Promise.all([
    translateText(guide.title, targetLang),
    guide.description ? translateText(guide.description, targetLang) : Promise.resolve(undefined),
    translateText(guide.content, targetLang),
  ])

  return {
    ...guide,
    title: translatedTitle,
    description: translatedDescription,
    content: translatedContent,
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear()
}

/**
 * Get cache size
 */
export function getTranslationCacheSize(): number {
  return translationCache.size
}
