"use client"

import { useState } from "react"
import type { FormField } from "@/lib/models/Feedback"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, GripVertical, Plus, X } from "lucide-react"

interface FormFieldEditorProps {
  field: FormField
  onUpdate: (field: FormField) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function FormFieldEditor({ field, onUpdate, onDelete, onMoveUp, onMoveDown }: FormFieldEditorProps) {
  const [options, setOptions] = useState<string[]>(field.options || [])
  const [newOption, setNewOption] = useState("")

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates })
  }

  const addOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...options, newOption.trim()]
      setOptions(updatedOptions)
      handleFieldUpdate({ options: updatedOptions })
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index)
    setOptions(updatedOptions)
    handleFieldUpdate({ options: updatedOptions })
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <CardTitle className="text-sm">Field {field.order}</CardTitle>
            <Badge variant="outline">{field.type}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onMoveUp}>
              ↑
            </Button>
            <Button variant="ghost" size="sm" onClick={onMoveDown}>
              ↓
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Field Name</Label>
            <Input
              value={field.name}
              onChange={(e) => handleFieldUpdate({ name: e.target.value })}
              placeholder="fieldName"
            />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={field.label}
              onChange={(e) => handleFieldUpdate({ label: e.target.value })}
              placeholder="Field Label"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select value={field.type} onValueChange={(value: any) => handleFieldUpdate({ type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch checked={field.required} onCheckedChange={(checked) => handleFieldUpdate({ required: checked })} />
          <Label>Required field</Label>
        </div>

        {field.type === "select" && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={option} readOnly />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add new option"
                  onKeyPress={(e) => e.key === "Enter" && addOption()}
                />
                <Button onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {(field.type === "text" || field.type === "number") && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Length/Value</Label>
              <Input
                type="number"
                value={field.validation?.min || ""}
                onChange={(e) =>
                  handleFieldUpdate({
                    validation: { ...field.validation, min: Number.parseInt(e.target.value) || undefined },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max Length/Value</Label>
              <Input
                type="number"
                value={field.validation?.max || ""}
                onChange={(e) =>
                  handleFieldUpdate({
                    validation: { ...field.validation, max: Number.parseInt(e.target.value) || undefined },
                  })
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
