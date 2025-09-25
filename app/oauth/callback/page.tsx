"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiService } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [provider, setProvider] = useState<string>('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setErrorMessage(`OAuth error: ${error}`)
          return
        }

        if (!code) {
          setStatus('error')
          setErrorMessage('No authorization code received')
          return
        }

        // Determine provider from state or URL
        const currentPath = window.location.pathname
        if (currentPath.includes('github')) {
          setProvider('GitHub')
        } else if (currentPath.includes('drive')) {
          setProvider('Google Drive')
        }

        // For GitHub, we need to exchange the code for a token
        // The backend will handle this exchange
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
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
      }
    }

    handleOAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            {provider && `${provider} Integration`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <p className="text-muted-foreground">
                Connecting your {provider} account...
              </p>
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <p className="text-green-600 font-medium">
                Successfully connected to {provider}!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting you back to Tara...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p className="text-red-600 font-medium">
                Connection failed
              </p>
              <p className="text-sm text-muted-foreground">
                {errorMessage}
              </p>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Return to Tara
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
