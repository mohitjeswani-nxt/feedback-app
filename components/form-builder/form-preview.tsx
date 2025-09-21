"use client"

import type { FormField } from "@/lib/models/Feedback"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface FormPreviewProps {
  fields: FormField[]
  title: string
}

export function FormPreview({ fields, title }: FormPreviewProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order)

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder,
      required: field.required,
    }

    switch (field.type) {
      case "text":
      case "email":
        return <Input {...commonProps} type={field.type} />

      case "number":
        return <Input {...commonProps} type="number" />

      case "textarea":
        return <Textarea {...commonProps} />

      case "select":
        return (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "file":
        return <Input {...commonProps} type="file" />

      case "date":
        return <Input {...commonProps} type="date" />

      default:
        return <Input {...commonProps} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} - Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderField(field)}
          </div>
        ))}
        <Button className="w-full" disabled>
          Submit Feedback (Preview)
        </Button>
      </CardContent>
    </Card>
  )
}
