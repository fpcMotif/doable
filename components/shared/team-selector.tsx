'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@stackframe/stack'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Users, Plus } from 'lucide-react'
import { ServerTeamCreator } from './server-team-creator'

interface TeamSelectorProps {
  onCreateTeam?: () => void
}

export function TeamSelector({ onCreateTeam }: TeamSelectorProps) {
  const user = useUser()
  const router = useRouter()
  const teams = user.useTeams()
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [showTeamCreator, setShowTeamCreator] = useState(false)

  const handleCreateTeam = async () => {
    if (!onCreateTeam) return
    
    setIsCreatingTeam(true)
    try {
      await onCreateTeam()
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleSelectTeam = (teamId: string) => {
    user.setSelectedTeam(teams.find(t => t.id === teamId))
    router.push(`/dashboard/${teamId}/issues`)
  }

  const handleTeamCreated = (team: any) => {
    // Refresh the page to show the new team
    window.location.reload()
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        {showTeamCreator ? (
          <ServerTeamCreator onTeamCreated={handleTeamCreated} />
        ) : (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                No Teams Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                You don't have access to any teams yet.
              </p>
              
              <Button 
                onClick={() => setShowTeamCreator(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Server-side Team Creation</p>
                    <p className="text-xs mt-1">
                      We'll create your team using our server-side API, which works regardless of Stack Auth settings.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Select Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Choose a team to get started
          </p>
          
          <div className="space-y-2">
            {teams.map((team) => (
              <Button
                key={team.id}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleSelectTeam(team.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {team.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{team.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowTeamCreator(true)}
            variant="ghost"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Team
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
