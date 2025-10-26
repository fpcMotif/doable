'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { useUser } from '@clerk/nextjs'

interface ServerTeamCreatorProps {
  onTeamCreated?: (team: any) => void
}

export function ServerTeamCreator({ onTeamCreated }: ServerTeamCreatorProps) {
  const [teamName, setTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: teamName.trim(),
        }),
      })

      if (response.ok) {
        const team = await response.json()
        toast.success('Team created successfully!', 'Your team has been created and you have been added as a member.')
        setTeamName('')
        onTeamCreated?.(team)
        
        // Redirect to the new team's dashboard
        if (team?.id) {
          window.location.href = `/dashboard/${team.id}/issues`
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create team')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error('Failed to create team', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating || !teamName.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Team...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
