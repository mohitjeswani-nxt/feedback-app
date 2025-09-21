"use client"

import { useState, useEffect } from "react"
import type { FormField, FormTemplate } from "@/lib/models/Feedback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormFieldEditor } from "@/components/form-builder/form-field-editor"
import { FormPreview } from "@/components/form-builder/form-preview"
import { useToast } from "@/hooks/use-toast"
import { Plus, Save } from "lucide-react"

export default function FormBuilderPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<Partial<FormTemplate>>({
    programType: "",
    name: "",
    description: "",
    fields: [],
    isActive: true,
    version: 1,
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/form-templates")
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch form templates",
        variant: "destructive",
      })
    }
  }

  const addField = () => {
    const newField: FormField = {
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      order: (currentTemplate.fields?.length || 0) + 1,
    }

    setCurrentTemplate((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }))
  }

  const updateField = (index: number, updatedField: FormField) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      fields: prev.fields?.map((field, i) => (i === index ? updatedField : field)) || [],
    }))
  }

  const deleteField = (index: number) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index) || [],
    }))
  }

  const moveField = (index: number, direction: "up" | "down") => {
    const fields = [...(currentTemplate.fields || [])]
    const newIndex = direction === "up" ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < fields.length) {
      ;[fields[index], fields[newIndex]] = [fields[newIndex], fields[index]]

      // Update order values
      fields.forEach((field, i) => {
        field.order = i + 1
      })

      setCurrentTemplate((prev) => ({ ...prev, fields }))
    }
  }

  const saveTemplate = async () => {
    if (!currentTemplate.programType || !currentTemplate.name || !currentTemplate.fields?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one form field",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = editingId ? `/api/form-templates/${editingId}` : "/api/form-templates"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTemplate),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Form template ${editingId ? "updated" : "created"} successfully`,
        })

        // Reset form
        setCurrentTemplate({
          programType: "",
          name: "",
          description: "",
          fields: [],
          isActive: true,
          version: 1,
        })
        setEditingId(null)
        fetchTemplates()
      } else {
        throw new Error("Failed to save template")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const editTemplate = (template: FormTemplate) => {
    setCurrentTemplate(template)
    setEditingId(template._id || null)
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/form-templates/${templateId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Form template deleted successfully",
        })
        fetchTemplates()
      } else {
        throw new Error("Failed to delete template")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete form template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground">Create and manage dynamic feedback forms</p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Form Builder</TabsTrigger>
          <TabsTrigger value="templates">Existing Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                  <CardDescription>Configure the basic template information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Program Type</Label>
                    <Select
                      value={currentTemplate.programType}
                      onValueChange={(value) => setCurrentTemplate((prev) => ({ ...prev, programType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIAT">NIAT</SelectItem>
                        <SelectItem value="Intensive">Intensive</SelectItem>
                        <SelectItem value="Academy">Academy</SelectItem>
                        <SelectItem value="Custom">Custom Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={currentTemplate.name}
                      onChange={(e) => setCurrentTemplate((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={currentTemplate.description}
                      onChange={(e) => setCurrentTemplate((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this form template"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={currentTemplate.isActive}
                      onCheckedChange={(checked) => setCurrentTemplate((prev) => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Active Template</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Form Fields</CardTitle>
                      <CardDescription>Design your form fields</CardDescription>
                    </div>
                    <Button onClick={addField} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentTemplate.fields?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No fields added yet. Click "Add Field" to get started.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentTemplate.fields?.map((field, index) => (
                        <FormFieldEditor
                          key={`${field.name}-${index}`}
                          field={field}
                          onUpdate={(updatedField) => updateField(index, updatedField)}
                          onDelete={() => deleteField(index)}
                          onMoveUp={() => moveField(index, "up")}
                          onMoveDown={() => moveField(index, "down")}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={saveTemplate} disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : editingId ? "Update Template" : "Save Template"}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentTemplate({
                        programType: "",
                        name: "",
                        description: "",
                        fields: [],
                        isActive: true,
                        version: 1,
                      })
                      setEditingId(null)
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {currentTemplate.fields && currentTemplate.fields.length > 0 && (
                <FormPreview fields={currentTemplate.fields} title={currentTemplate.name || "Untitled Form"} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {template.isActive && <span className="h-2 w-2 bg-green-500 rounded-full"></span>}
                    </div>
                  </div>
                  <CardDescription>{template.programType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {template.fields.length} fields • Version {template.version}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => editTemplate(template)} className="flex-1">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteTemplate(template._id!)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
