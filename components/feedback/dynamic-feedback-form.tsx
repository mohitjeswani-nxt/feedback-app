"use client"

import { useState, useEffect } from "react"
import type { FormField, FormTemplate } from "@/lib/models/Feedback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { FileText, Video, ImageIcon } from "lucide-react"

interface DynamicFeedbackFormProps {
  program: string
  onSubmitSuccess: (ticketId: string) => void
}

export function DynamicFeedbackForm({ program, onSubmitSuccess }: DynamicFeedbackFormProps) {
  const { toast } = useToast()
  const [template, setTemplate] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<{
    screenshots: File[]
    video: File | null
  }>({
    screenshots: [],
    video: null,
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [program])

  const fetchTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/form-templates/program/${program}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)

        // Initialize form data with default values
        const initialData: Record<string, any> = {}
        data.template.fields.forEach((field: FormField) => {
          initialData[field.name] = field.type === "number" ? 0 : ""
        })
        setFormData(initialData)
      } else {
        throw new Error("Template not found")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleFileChange = (type: "screenshots" | "video", files: FileList | null) => {
    if (!files) return

    if (type === "screenshots") {
      const imageFiles = Array.from(files).filter(
        (file) => file.type.startsWith("image/") && ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      )

      if (imageFiles.length > 5) {
        toast({
          title: "Too many files",
          description: "Maximum 5 screenshots allowed",
          variant: "destructive",
        })
        return
      }

      setFiles((prev) => ({ ...prev, screenshots: imageFiles }))
    } else if (type === "video") {
      const videoFile = files[0]
      if (videoFile && ["video/mp4", "video/mkv"].includes(videoFile.type)) {
        if (videoFile.size > 20 * 1024 * 1024) {
          // 20MB limit
          toast({
            title: "File too large",
            description: "Video must be under 20MB",
            variant: "destructive",
          })
          return
        }
        setFiles((prev) => ({ ...prev, video: videoFile }))
      } else {
        toast({
          title: "Invalid file type",
          description: "Only MP4 and MKV videos are allowed",
          variant: "destructive",
        })
      }
    }
  }

  const validateForm = () => {
    if (!template) return false

    for (const field of template.fields) {
      if (field.required && !formData[field.name]) {
        toast({
          title: "Validation Error",
          description: `${field.label} is required`,
          variant: "destructive",
        })
        return false
      }

      // Additional validation based on field type
      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.name])) {
          toast({
            title: "Validation Error",
            description: `${field.label} must be a valid email`,
            variant: "destructive",
          })
          return false
        }
      }

      if (field.validation) {
        const value = formData[field.name]
        if (field.validation.min && value.length < field.validation.min) {
          toast({
            title: "Validation Error",
            description: `${field.label} must be at least ${field.validation.min} characters`,
            variant: "destructive",
          })
          return false
        }
        if (field.validation.max && value.length > field.validation.max) {
          toast({
            title: "Validation Error",
            description: `${field.label} must be no more than ${field.validation.max} characters`,
            variant: "destructive",
          })
          return false
        }
      }
    }

    return true
  }

  const submitFeedback = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      // In a real implementation, you'd upload files to a service like UploadThing
      // For now, we'll simulate file URLs
      const screenshotUrls = files.screenshots.map((_, index) => `/uploads/screenshots/${Date.now()}_${index}.jpg`)
      const videoUrl = files.video ? `/uploads/videos/${Date.now()}.mp4` : undefined

      const feedbackData = {
        program,
        ...formData,
        screenshots: screenshotUrls,
        video: videoUrl,
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Feedback Submitted Successfully!",
          description: `Your ticket ID is: ${data.ticketId}`,
        })
        onSubmitSuccess(data.ticketId)
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ""

    switch (field.type) {
      case "text":
      case "email":
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, Number.parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
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

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading form...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Form template not found for {program} program.</p>
        </CardContent>
      </Card>
    )
  }

  const sortedFields = [...template.fields].sort((a, b) => a.order - b.order)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderField(field)}
          </div>
        ))}

        {/* File Upload Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Attachments</h3>

          <div className="space-y-2">
            <Label>Screenshots (Max 5, JPEG/PNG only)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange("screenshots", e.target.files)}
                className="hidden"
                id="screenshots"
              />
              <label htmlFor="screenshots" className="cursor-pointer">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload screenshots or drag and drop</p>
                </div>
              </label>
              {files.screenshots.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <ul className="text-sm text-muted-foreground">
                    {files.screenshots.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Video (Optional, Max 20MB, MP4/MKV only)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <input
                type="file"
                accept="video/mp4,video/mkv"
                onChange={(e) => handleFileChange("video", e.target.files)}
                className="hidden"
                id="video"
              />
              <label htmlFor="video" className="cursor-pointer">
                <div className="text-center">
                  <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload video or drag and drop</p>
                </div>
              </label>
              {files.video && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected file:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    {files.video.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button onClick={submitFeedback} disabled={submitting} className="w-full" size="lg">
          {submitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
  )
}
