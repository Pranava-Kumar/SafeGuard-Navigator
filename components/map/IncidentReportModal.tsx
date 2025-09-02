"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, AlertTriangle, Camera, Clock, User, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: [number, number];
  onSaveReport?: (reportData: IncidentData) => void;
}

interface IncidentData {
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  reporterInfo: {
    name?: string;
    contact?: string;
  };
}

export default function IncidentReportModal({ isOpen, onClose, location, onSaveReport }: IncidentReportModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    severity: "medium" as 'low' | 'medium' | 'high' | 'critical',
    reporterName: "",
    reporterContact: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const incidentTypes = [
    "POTHOLE",
    "POOR_LIGHTING",
    "HARASSMENT",
    "THEFT",
    "ACCIDENT",
    "CONSTRUCTION",
  ];

  const handleSubmit = async () => {
    if (!formData.type || !formData.description) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: location ? location[0] : 0,
          lon: location ? location[1] : 0,
          hazard_type: formData.type,
          description: formData.description,
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Report submitted successfully!" });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            type: "",
            description: "",
            severity: "medium",
            reporterName: "",
            reporterContact: "",
          });
        }, 2000);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to submit report. Please try again." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit report. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Report Submitted Successfully</h3>
            <p className="text-gray-600">Thank you for helping keep our community safe.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report Incident
          </CardTitle>
          <CardDescription>
            Report a safety incident or concern to help improve community safety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Location Information */}
          {location && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h4>
              <p className="text-sm text-blue-700">
                {location[0].toFixed(4)}, {location[1].toFixed(4)}
              </p>
            </div>
          )}

          {/* Incident Type */}
          <div className="space-y-2">
            <Label htmlFor="incidentType">Incident Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor('low')}>Low</Badge>
                    <span>Minor concern</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor('medium')}>Medium</Badge>
                    <span>Moderate concern</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor('high')}>High</Badge>
                    <span>Serious concern</span>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor('critical')}>Critical</Badge>
                    <span>Emergency situation</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of the incident..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Reporter Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Reporter Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporterName">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="reporterName"
                    type="text"
                    placeholder="Your name (optional)"
                    value={formData.reporterName}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterContact">Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="reporterContact"
                    type="text"
                    placeholder="Phone or email (optional)"
                    value={formData.reporterContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterContact: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || !formData.type || !formData.description}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}