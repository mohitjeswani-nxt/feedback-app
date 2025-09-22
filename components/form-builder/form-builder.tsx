"use client";

import { useState, useCallback } from "react";
import type { FormField, FormTemplate } from "@/lib/models/Feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FormFieldEditor } from "./form-field-editor";
import { FormPreview } from "./form-preview";
import { Plus, Save, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormBuilderProps {
  template?: FormTemplate;
  onSave?: (template: FormTemplate) => void;
  onCancel?: () => void;
}

export function FormBuilder({ template, onSave, onCancel }: FormBuilderProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    programType: template?.programType || "",
  });

  const [fields, setFields] = useState<FormField[]>(template?.fields || []);

  const [isLoading, setIsLoading] = useState(false);

  const addField = () => {
    const newField: FormField = {
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: "text",
      required: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  const updateField = useCallback((index: number, updatedField: FormField) => {
    setFields((fields) =>
      fields.map((field, i) => (i === index ? updatedField : field))
    );
  }, []);

  const deleteField = useCallback((index: number) => {
    setFields((fields) => {
      const newFields = fields.filter((_, i) => i !== index);
      // Reorder remaining fields
      return newFields.map((field, i) => ({ ...field, order: i + 1 }));
    });
  }, []);

  const moveFieldUp = useCallback((index: number) => {
    if (index > 0) {
      setFields((fields) => {
        const newFields = [...fields];
        [newFields[index - 1], newFields[index]] = [
          newFields[index],
          newFields[index - 1],
        ];
        // Update order
        newFields.forEach((field, i) => {
          field.order = i + 1;
        });
        return newFields;
      });
    }
  }, []);

  const moveFieldDown = useCallback((index: number) => {
    setFields((fields) => {
      if (index < fields.length - 1) {
        const newFields = [...fields];
        [newFields[index], newFields[index + 1]] = [
          newFields[index + 1],
          newFields[index],
        ];
        // Update order
        newFields.forEach((field, i) => {
          field.order = i + 1;
        });
        return newFields;
      }
      return fields;
    });
  }, []);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Form name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.programType.trim()) {
      toast({
        title: "Validation Error",
        description: "Program type is required",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one field is required",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate field names
    const fieldNames = fields.map((f) => f.name);
    const duplicates = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      toast({
        title: "Validation Error",
        description: `Duplicate field names found: ${duplicates.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const templateData = {
        ...formData,
        fields,
        isActive: true,
        version: template?.version ? template.version + 1 : 1,
        updatedAt: new Date(),
      };

      let response;

      if (template?._id) {
        // Update existing template
        console.log("API Url:", `/api/form-templates/${template._id}`);
        response = await fetch(`/api/form-templates/${template._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateData),
        });
      } else {
        // Create new template
        response = await fetch("/api/form-templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...templateData,
            createdBy: "",
            createdAt: new Date(),
          }),
        });
      }

      if (!response.ok) {
        console.log("Response not ok:", response);
        throw new Error(
          `Failed to ${template?._id ? "update" : "create"} form template`
        );
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `Form template ${
          template?._id ? "updated" : "created"
        } successfully`,
      });

      onSave?.(result.template || { ...templateData, _id: template?._id });
    } catch (error) {
      console.error("Error saving form template:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          template?._id ? "update" : "create"
        } form template`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {template?._id ? "Edit Form Template" : "Create Form Template"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {template?._id
                  ? `Editing: ${template.name || "Untitled Form"}`
                  : "Create and customize dynamic feedback forms for different programs"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading
                  ? template?._id
                    ? "Updating..."
                    : "Creating..."
                  : template?._id
                  ? "Update Form"
                  : "Create Form"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formName">Form Name *</Label>
              <Input
                id="formName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., NIAT Feedback Form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="programType">Program Type *</Label>
              <Select
                value={formData.programType}
                onValueChange={(value) =>
                  setFormData({ ...formData, programType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIAT">NIAT</SelectItem>
                  <SelectItem value="Intensive">Intensive</SelectItem>
                  <SelectItem value="Academy">Academy</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this form template"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">
            <Settings className="h-4 w-4 mr-2" />
            Form Builder
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Fields</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add and configure fields for your feedback form
                  </p>
                </div>
                <Button onClick={addField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No fields added yet</p>
                  <Button onClick={addField} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Field
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <FormFieldEditor
                      key={index}
                      field={field}
                      onUpdate={(updatedField) =>
                        updateField(index, updatedField)
                      }
                      onDelete={() => deleteField(index)}
                      onMoveUp={() => moveFieldUp(index)}
                      onMoveDown={() => moveFieldDown(index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <FormPreview
            fields={fields}
            title={formData.name || "Untitled Form"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
