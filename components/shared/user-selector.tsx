'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAvatar } from '@/components/shared/user-avatar'

interface User {
  id: string
  displayName: string
  email: string
  profileImageUrl?: string
}

interface UserSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function UserSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select assignee",
  className 
}: UserSelectorProps) {
  const { user } = useUser()
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true)
        // TODO: Implement team member fetching with proper team ID
        const response = await fetch('/api/teams/team-id/members', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const members = await response.json()
          setTeamMembers(members)
        } else {
          console.error('Failed to fetch team members:', response.statusText)
          // Fallback to current user if API fails
          if (user) {
            const currentUser = {
              id: user.id,
              displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
              email: user.emailAddresses[0]?.emailAddress || '',
              profileImageUrl: user.imageUrl || undefined
            }
            setTeamMembers([currentUser])
          }
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
        // Fallback to current user if API fails
        if (user) {
          const currentUser = {
            id: user.id,
            displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
            email: user.emailAddresses[0]?.emailAddress || '',
            profileImageUrl: user.imageUrl || undefined
          }
          setTeamMembers([currentUser])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [user])

  const selectedUser = teamMembers.find(member => member.id === value)

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    )
  }

  // Ensure value is never empty string - use "unassigned" as default
  const selectValue = value && value.trim() !== "" ? value : "unassigned"

  return (
    <Select value={selectValue} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <UserAvatar 
                name={selectedUser.displayName}
                imageUrl={selectedUser.profileImageUrl}
                size="sm"
              />
              <span>{selectedUser.displayName}</span>
            </div>
          ) : selectValue === "unassigned" ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-500">?</span>
              </div>
              <span>Unassigned</span>
            </div>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
            <span>Unassigned</span>
          </div>
        </SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <div className="flex items-center gap-2">
              <UserAvatar 
                name={member.displayName}
                imageUrl={member.profileImageUrl}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{member.displayName}</span>
                <span className="text-xs text-gray-500">{member.email}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
