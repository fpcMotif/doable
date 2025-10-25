'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { List, Columns, Table } from 'lucide-react'
import { ViewType } from '@/lib/types'

interface ViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  className?: string
}

const viewConfig = {
  list: {
    label: 'List',
    icon: List,
    description: 'List view'
  },
  board: {
    label: 'Board',
    icon: Columns,
    description: 'Kanban board'
  },
  table: {
    label: 'Table',
    icon: Table,
    description: 'Table view'
  }
}

export function ViewSwitcher({ currentView, onViewChange, className }: ViewSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Object.entries(viewConfig).map(([view, config]) => {
        const Icon = config.icon
        const isActive = currentView === view
        
        return (
          <Button
            key={view}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view as ViewType)}
            className={cn(
              'flex items-center gap-2',
              isActive && 'bg-primary text-primary-foreground'
            )}
            title={config.description}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
