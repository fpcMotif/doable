'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function StackAuthSetupGuide() {
  const [stepCompleted, setStepCompleted] = useState<number[]>([])

  const steps = [
    {
      id: 1,
      title: "Go to Stack Auth Dashboard",
      description: "Navigate to your Stack Auth project dashboard",
      action: "Open Stack Auth Dashboard",
      url: "https://app.stack-auth.com"
    },
    {
      id: 2,
      title: "Find Team Settings",
      description: "Look for 'Teams' or 'Team Management' in the sidebar, or click 'Manage team members' in Project Access",
      action: "Find Team Settings"
    },
    {
      id: 3,
      title: "Enable Client Team Creation",
      description: "Look for 'Client Side Team Creation' or 'Allow client team creation' toggle",
      action: "Enable Team Creation"
    },
    {
      id: 4,
      title: "Save Changes",
      description: "Click 'Save' to apply the changes",
      action: "Save Settings"
    },
    {
      id: 5,
      title: "Refresh This Page",
      description: "Come back here and refresh to see the changes",
      action: "Refresh Page"
    }
  ]

  const handleStepComplete = (stepId: number) => {
    if (!stepCompleted.includes(stepId)) {
      setStepCompleted([...stepCompleted, stepId])
    }
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2 text-yellow-600">
          <AlertTriangle className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Setup Required</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          To start using Doable, please enable client-side team creation in your Stack Auth dashboard.
        </p>
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={`transition-all duration-200 ${
            stepCompleted.includes(step.id) ? 'bg-green-50 border-green-200' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepCompleted.includes(step.id) 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {stepCompleted.includes(step.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {step.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExternalLink(step.url!)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Link
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleStepComplete(step.id)}
                    disabled={stepCompleted.includes(step.id)}
                  >
                    {stepCompleted.includes(step.id) ? 'Completed' : step.action}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Why is this required?</h3>
        <p className="text-sm text-blue-800">
          Stack Auth disables client-side team creation by default for security reasons. 
          This prevents unauthorized users from creating teams in your application. 
          Once enabled, users can create teams directly from your app interface.
        </p>
      </div>

      <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">Can't find the setting?</h3>
        <p className="text-sm text-yellow-800 mb-3">
          If you can't find the "Client team creation" setting, try these alternatives:
        </p>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li><strong>Click "Manage team members"</strong> in the Project Access section above</li>
          <li><strong>Look for "Teams" or "Team Management"</strong> in the main sidebar</li>
          <li><strong>Check Organization Settings</strong> if you have organization-level access</li>
          <li><strong>Create teams manually</strong> in the Teams section and add users</li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <Button 
          onClick={() => window.location.reload()} 
          size="lg"
          className="px-8"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Refresh Page After Setup
        </Button>
      </div>
    </div>
  )
}
