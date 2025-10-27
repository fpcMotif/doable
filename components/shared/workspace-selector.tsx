'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Building2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface WorkspaceSelectorProps {
  currentTeamId: string
  currentTeamName: string
}

export function WorkspaceSelector({ currentTeamId, currentTeamName }: WorkspaceSelectorProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams')
        if (response.ok) {
          const data = await response.json()
          setTeams(data)
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const handleTeamSwitch = (teamId: string) => {
    router.push(`/dashboard/${teamId}/issues`)
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-2 px-2">
        <div className="font-semibold text-lg">Doable</div>
      </div>
      <div className="flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between px-2 h-auto py-2 hover:bg-secondary/50"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="truncate font-medium">{currentTeamName}</span>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamSwitch(team.id)}
                className={team.id === currentTeamId ? 'bg-primary text-primary-foreground' : ''}
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span className="truncate">{team.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

