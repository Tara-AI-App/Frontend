"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiService } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Github } from 'lucide-react'

export default function GitHubOAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'saving' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleGitHubCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setErrorMessage(`GitHub OAuth error: ${error}`)
          return
        }

        if (!code) {
          setStatus('error')
          setErrorMessage('No authorization code received from GitHub')
          return
        }

        // Exchange code for token using backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1'}/oauth/github/callback?code=${code}&state=${state || ''}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const githubResponse = await response.json()
        
        // Update status to show we're saving the token
        setStatus('saving')
        
        // Save the token to our backend (this requires authentication)
        try {
          const saveResponse = await apiService.saveGitHubToken(githubResponse.access_token)
          console.log('Token saved successfully:', saveResponse)
          setStatus('success')
        } catch (saveError) {
          console.error('Failed to save token:', saveError)
          throw new Error(`Failed to save GitHub token: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`)
        }
        
        // Redirect to ask-tara page after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)

      } catch (error) {
        console.error('GitHub OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
      }
    }

    handleGitHubCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3">
            <Github className="h-8 w-8 text-gray-800" />
            <span className="text-xl">GitHub Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">
                  Connecting your GitHub account...
                </p>
                <p className="text-sm text-gray-500">
                  Please wait while we set up the integration
                </p>
              </div>
            </>
          )}
          
          {status === 'saving' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
                <p className="text-gray-600 font-medium">
                  Saving your GitHub token...
                </p>
                <p className="text-sm text-gray-500">
                  Almost done! Setting up your integration
                </p>
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-green-600 font-semibold text-lg">
                  Successfully Connected!
                </p>
                <p className="text-sm text-gray-600">
                  Your GitHub account is now integrated with Tara
                </p>
                <p className="text-xs text-gray-500">
                  Redirecting you back to Tara...
                </p>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-red-600 font-semibold text-lg">
                    Connection Failed
                  </p>
                  <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    {errorMessage}
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Return to Tara
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
