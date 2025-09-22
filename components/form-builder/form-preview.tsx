"use client";

import type { FormField } from "@/lib/models/Feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eye, FileText } from "lucide-react";

interface FormPreviewProps {
  fields: FormField[];
  title: string;
}

export function FormPreview({ fields, title }: FormPreviewProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case "text":
      case "email":
        return <Input {...commonProps} type={field.type} />;

      case "number":
        return <Input {...commonProps} type="number" />;

      case "textarea":
        return <Textarea {...commonProps} />;

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
        );

      case "file":
        return <Input {...commonProps} type="file" />;

      case "date":
        return <Input {...commonProps} type="date" />;

      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Eye className="h-5 w-5" />
          {title} - Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This is how the form will appear to students
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedFields.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No fields to preview</p>
          </div>
        ) : (
          <>
            {sortedFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {renderField(field)}
              </div>
            ))}
            <div className="pt-4 border-t">
              <Button className="w-full" disabled>
                Submit Feedback (Preview Mode)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
