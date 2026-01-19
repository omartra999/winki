'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

interface Criterion {
  id: string
  type: 'MUSS' | 'SOLL' | 'KANN' | 'ANALYSE'
  value: string
}

interface CriteriaFormProps {
  onChange?: (criteria: Criterion[]) => void
  initialCriteria?: Criterion[]
}

export function CriteriaForm({ onChange, initialCriteria = [] }: CriteriaFormProps) {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria)

  const addCriterion = () => {
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      type: 'MUSS',
      value: '',
    }
    const updated = [...criteria, newCriterion]
    setCriteria(updated)
    onChange?.(updated)
  }

  const updateCriterion = (id: string, field: keyof Criterion, value: string) => {
    const updated = criteria.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    )
    setCriteria(updated)
    onChange?.(updated)
  }

  const removeCriterion = (id: string) => {
    const updated = criteria.filter(c => c.id !== id)
    setCriteria(updated)
    onChange?.(updated)
  }

  const getTypeColor = (type: 'MUSS' | 'SOLL' | 'KANN' | 'ANALYSE') => {
    switch (type) {
      case 'MUSS':
        return 'bg-destructive/20 text-destructive hover:bg-destructive/20'
      case 'SOLL':
        return 'bg-chart-1/20 text-chart-1 hover:bg-chart-1/20'
      case 'KANN':
        return 'bg-chart-3/20 text-chart-3 hover:bg-chart-3/20'
      case 'ANALYSE':
        return 'bg-secondary/20 text-secondary hover:bg-secondary/20'
    }
  }

  const criteriaCount = {
    MUSS: criteria.filter(c => c.type === 'MUSS').length,
    SOLL: criteria.filter(c => c.type === 'SOLL').length,
    KANN: criteria.filter(c => c.type === 'KANN').length,
    ANALYSE: criteria.filter(c => c.type === 'ANALYSE').length,
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex gap-2">
        {criteriaCount.MUSS > 0 && (
          <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/20">
            {criteriaCount.MUSS} MUSS
          </Badge>
        )}
        {criteriaCount.SOLL > 0 && (
          <Badge className="bg-chart-1/20 text-chart-1 hover:bg-chart-1/20">
            {criteriaCount.SOLL} SOLL
          </Badge>
        )}
        {criteriaCount.KANN > 0 && (
          <Badge className="bg-chart-3/20 text-chart-3 hover:bg-chart-3/20">
            {criteriaCount.KANN} KANN
          </Badge>
        )}

        {criteriaCount.ANALYSE > 0 && (
            <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/20">
                {criteriaCount.ANALYSE} ANALYSE NACH
            </Badge>
        )}


        {criteria.length === 0 && (
          <span className="text-sm text-muted-foreground">Keine Kriterien hinzugefügt</span>
        )}


      </div>

      {/* Criteria List */}
      <div className="space-y-3">
        {criteria.map(criterion => (
          <Card key={criterion.id} className="p-3 bg-card border-border">
            <div className="flex gap-2 items-start">
              {/* Type Selector */}
              <Select
                value={criterion.type}
                onValueChange={(value) =>
                  updateCriterion(criterion.id, 'type', value as 'MUSS' | 'SOLL' | 'KANN' | 'ANALYSE')
                }
              >
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUSS">MUSS</SelectItem>
                  <SelectItem value="SOLL">SOLL</SelectItem>
                  <SelectItem value="KANN">KANN</SelectItem>
                  <SelectItem value="ANALYSE">ANALYSE</SelectItem>
                </SelectContent>
              </Select>

              {/* Value Input */}
              <Input
                placeholder="Kriterium eingeben..."
                value={criterion.value}
                onChange={(e) =>
                  updateCriterion(criterion.id, 'value', e.target.value)
                }
                className="flex-1 h-9"
              />

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCriterion(criterion.id)}
                className="text-destructive hover:bg-destructive/10 px-2"
              >
                ✕
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Button */}
      <Button
        onClick={addCriterion}
        variant="outline"
        className="w-full border-dashed border-2 hover:bg-muted"
      >
        <span className="text-lg mr-2">+</span>
        Neues Kriterium
      </Button>
    </div>
  )
}
