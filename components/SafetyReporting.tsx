/**
 * SafetyReporting Component
 * Allows users to report safety incidents and view nearby reports
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Slider,
  MenuItem,
  Select,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating
} from '@mui/material';
import {
  Warning,
  LocationOn,
  MyLocation,
  PhotoCamera,
  Send,
  Security,
  Visibility,
  VisibilityOff,
  ThumbUp,
  ThumbDown,
  Flag,
  Info,
  ArrowBack
} from '@mui/icons-material';
import SafetyMap from './SafetyMap';

interface ReportLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ReportData {
  id?: string;
  type: string;
  description: string;
  severity: number;
  location: ReportLocation;
  timestamp: string;
  images?: string[];
  isAnonymous: boolean;
  userId?: string;
  userName?: string;
  userReputation?: number;
  status: 'pending' | 'verified' | 'rejected';
  verificationCount?: number;
  disputeCount?: number;
}

interface NearbyReport extends ReportData {
  distance: number; // in meters
  userHasVerified?: boolean;
  userHasDisputed?: boolean;
}

interface SafetyReportingProps {
  initialLocation?: [number, number];
  initialReportType?: string;
}

const SafetyReporting: React.FC<SafetyReportingProps> = ({
  initialLocation,
  initialReportType
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize from URL params if available
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const typeParam = searchParams.get('type');
  
  const [location, setLocation] = useState<ReportLocation | null>(
    latParam && lngParam 
      ? { latitude: parseFloat(latParam), longitude: parseFloat(lngParam) }
      : initialLocation 
        ? { latitude: initialLocation[0], longitude: initialLocation[1] }
        : null
  );
  
  const [reportType, setReportType] = useState<string>(
    typeParam || initialReportType || 'safety_issue'
  );
  
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<number>(3); // 1-5 scale
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [nearbyReports, setNearbyReports] = useState<NearbyReport[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState<boolean>(false);
  const [showNearbyReports, setShowNearbyReports] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<NearbyReport | null>(null);
  const [showReportDetail, setShowReportDetail] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [addressText, setAddressText] = useState<string>('');
  
  // Report type options
  const reportTypes = [
    { value: 'safety_issue', label: 'Safety Issue' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'theft', label: 'Theft or Robbery' },
    { value: 'infrastructure', label: 'Infrastructure Problem' },
    { value: 'lighting', label: 'Poor Lighting' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'traffic_hazard', label: 'Traffic Hazard' },
    { value: 'other', label: 'Other' }
  ];
  
  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocode to get address
            const response = await fetch(`/api/geocoding/reverse?lat=${latitude}&lng=${longitude}`);
            if (!response.ok) throw new Error('Failed to get address');
            
            const data = await response.json();
            setLocation({ latitude, longitude, address: data.address });
            setAddressText(data.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            
            // Fetch nearby reports when location changes
            fetchNearbyReports(latitude, longitude);
          } catch (err: any) {
            console.error('Error getting address:', err);
            setLocation({ latitude, longitude });
            setAddressText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            
            // Fetch nearby reports when location changes
            fetchNearbyReports(latitude, longitude);
          }
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Could not get your location. Please check your browser permissions.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };
  
  // Fetch nearby reports
  const fetchNearbyReports = async (latitude: number, longitude: number) => {
    try {
      setIsLoadingNearby(true);
      
      const response = await fetch(
        `/api/reporting/nearby?lat=${latitude}&lng=${longitude}&radius=1000`
      );
      
      if (!response.ok) throw new Error('Failed to fetch nearby reports');
      
      const data = await response.json();
      setNearbyReports(data.reports || []);
      setIsLoadingNearby(false);
    } catch (err: any) {
      console.error('Error fetching nearby reports:', err);
      setIsLoadingNearby(false);
    }
  };
  
  // Initialize component
  useEffect(() => {
    // If no location is set, get current location
    if (!location) {
      getCurrentLocation();
    } else {
      // If location is already set (from props or URL), fetch nearby reports
      fetchNearbyReports(location.latitude, location.longitude);
      
      // Get address for the location
      const getAddress = async () => {
        try {
          const response = await fetch(
            `/api/geocoding/reverse?lat=${location.latitude}&lng=${location.longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setAddressText(data.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
          } else {
            setAddressText(`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
          }
        } catch (err) {
          setAddressText(`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
        }
      };
      
      getAddress();
    }
    
    // Check if user has already given consent
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/auth/consent');
        if (response.ok) {
          const data = await response.json();
          if (data.consentSettings && data.consentSettings.crowdsourcing) {
            setConsentGiven(true);
          } else {
            setShowConsentDialog(true);
          }
        }
      } catch (err) {
        // If error, show consent dialog to be safe
        setShowConsentDialog(true);
      }
    };
    
    checkConsent();
  }, []);
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileArray = Array.from(event.target.files);
      
      // Limit to 3 images
      const newImages = [...images, ...fileArray].slice(0, 3);
      setImages(newImages);
      
      // Create preview URLs
      const newImageUrls = newImages.map(file => URL.createObjectURL(file));
      setImageUrls(newImageUrls);
    }
  };
  
  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newImageUrls = [...imageUrls];
    URL.revokeObjectURL(newImageUrls[index]);
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
  };
  
  // Handle map click to set location
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocode to get address
      const response = await fetch(`/api/geocoding/reverse?lat=${lat}&lng=${lng}`);
      
      if (response.ok) {
        const data = await response.json();
        setLocation({ latitude: lat, longitude: lng, address: data.address });
        setAddressText(data.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        setLocation({ latitude: lat, longitude: lng });
        setAddressText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
      
      // Fetch nearby reports when location changes
      fetchNearbyReports(lat, lng);
    } catch (err) {
      setLocation({ latitude: lat, longitude: lng });
      setAddressText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      
      // Fetch nearby reports when location changes
      fetchNearbyReports(lat, lng);
    }
  };
  
  // Submit report
  const handleSubmitReport = async () => {
    if (!location) {
      setError('Please set a location for the report');
      return;
    }
    
    if (!description) {
      setError('Please provide a description of the incident');
      return;
    }
    
    if (!consentGiven) {
      setShowConsentDialog(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // First, upload images if any
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => formData.append('images', image));
        
        const uploadResponse = await fetch('/api/reporting/upload-images', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) throw new Error('Failed to upload images');
        
        const uploadData = await uploadResponse.json();
        uploadedImageUrls = uploadData.imageUrls;
      }
      
      // Create report data
      const reportData: Omit<ReportData, 'id' | 'timestamp' | 'status'> = {
        type: reportType,
        description,
        severity,
        location,
        images: uploadedImageUrls,
        isAnonymous
      };
      
      // Submit report
      const response = await fetch('/api/reporting/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) throw new Error('Failed to submit report');
      
      setSuccess(true);
      setIsSubmitting(false);
      
      // Reset form after successful submission
      setTimeout(() => {
        setDescription('');
        setSeverity(3);
        setImages([]);
        setImageUrls([]);
        setIsAnonymous(false);
        setSuccess(false);
        
        // Refresh nearby reports
        if (location) {
          fetchNearbyReports(location.latitude, location.longitude);
        }
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };
  
  // Handle giving consent
  const handleGiveConsent = async () => {
    try {
      const response = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          crowdsourcing: true
        })
      });
      
      if (!response.ok) throw new Error('Failed to update consent settings');
      
      setConsentGiven(true);
      setShowConsentDialog(false);
    } catch (err: any) {
      console.error('Error updating consent:', err);
      setError(err.message);
    }
  };
  
  // View report details
  const handleViewReport = (report: NearbyReport) => {
    setSelectedReport(report);
    setShowReportDetail(true);
  };
  
  // Verify or dispute a report
  const handleVerifyReport = async (reportId: string, isVerifying: boolean) => {
    try {
      const response = await fetch(`/api/reporting/${reportId}/${isVerifying ? 'verify' : 'dispute'}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error(`Failed to ${isVerifying ? 'verify' : 'dispute'} report`);
      
      // Update the report in the list
      setNearbyReports(prevReports => 
        prevReports.map(report => {
          if (report.id === reportId) {
            return {
              ...report,
              verificationCount: isVerifying 
                ? (report.verificationCount || 0) + 1 
                : report.verificationCount,
              disputeCount: !isVerifying 
                ? (report.disputeCount || 0) + 1 
                : report.disputeCount,
              userHasVerified: isVerifying ? true : report.userHasVerified,
              userHasDisputed: !isVerifying ? true : report.userHasDisputed
            };
          }
          return report;
        })
      );
      
      // Update selected report if open
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({
          ...selectedReport,
          verificationCount: isVerifying 
            ? (selectedReport.verificationCount || 0) + 1 
            : selectedReport.verificationCount,
          disputeCount: !isVerifying 
            ? (selectedReport.disputeCount || 0) + 1 
            : selectedReport.disputeCount,
          userHasVerified: isVerifying ? true : selectedReport.userHasVerified,
          userHasDisputed: !isVerifying ? true : selectedReport.userHasDisputed
        });
      }
    } catch (err: any) {
      console.error(`Error ${isVerifying ? 'verifying' : 'disputing'} report:`, err);
      setError(err.message);
    }
  };
  
  // Flag a report as inappropriate
  const handleFlagReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reporting/${reportId}/flag`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to flag report');
      
      // Close the detail view
      setShowReportDetail(false);
      setSelectedReport(null);
      
      // Show success message
      setError('Report has been flagged for review. Thank you for helping keep our community safe.');
    } catch (err: any) {
      console.error('Error flagging report:', err);
      setError(err.message);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Back button */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Safety Reporting
      </Typography>
      
      {error && (
        <Alert 
          severity={error.includes('Thank you') ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your report has been submitted successfully. Thank you for contributing to community safety!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left panel - Report form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report a Safety Incident
              </Typography>
              
              {/* Location selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Incident Location
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {addressText || 'No location selected'}
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<MyLocation />}
                  size="small"
                  onClick={getCurrentLocation}
                >
                  Use My Current Location
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  You can also click on the map to set the incident location
                </Typography>
              </Box>
              
              {/* Report type */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="report-type-label">Incident Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  value={reportType}
                  label="Incident Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Description */}
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the incident"
                sx={{ mb: 3 }}
              />
              
              {/* Severity */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Severity Level
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2, minWidth: 80 }}>
                    Minor
                  </Typography>
                  <Slider
                    value={severity}
                    onChange={(_, value) => setSeverity(value as number)}
                    step={1}
                    marks
                    min={1}
                    max={5}
                    valueLabelDisplay="auto"
                    sx={{ mx: 2 }}
                  />
                  <Typography variant="body2" sx={{ ml: 2, minWidth: 80 }}>
                    Severe
                  </Typography>
                </Box>
              </Box>
              
              {/* Image upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add Photos (Optional)
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {imageUrls.map((url, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        position: 'relative',
                        width: 100,
                        height: 100,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src={url} 
                        alt={`Upload ${index + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <IconButton
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  
                  {imageUrls.length < 3 && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      sx={{ 
                        width: 100, 
                        height: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      Add Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  You can add up to 3 photos. Please ensure they don't contain identifiable faces.
                </Typography>
              </Box>
              
              {/* Anonymous reporting */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Report anonymously</Typography>
                    <Tooltip title="Your identity will not be shared publicly, but for verification purposes, the system will maintain a private record in compliance with DPDP Act 2023">
                      <Info fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                }
                sx={{ mb: 3 }}
              />
              
              {/* Submit button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                onClick={handleSubmitReport}
                disabled={isSubmitting || !location || !description}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Nearby reports section */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Nearby Reports
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setShowNearbyReports(!showNearbyReports)}
                >
                  {showNearbyReports ? 'Hide' : 'Show'}
                </Button>
              </Box>
              
              {isLoadingNearby ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : nearbyReports.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No reports found in this area
                </Typography>
              ) : showNearbyReports ? (
                <List>
                  {nearbyReports.slice(0, 5).map((report) => (
                    <Paper key={report.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={reportTypes.find(t => t.value === report.type)?.label || report.type}
                            color={report.severity > 3 ? 'error' : report.severity > 1 ? 'warning' : 'default'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption">
                            {new Date(report.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Chip 
                          label={`${(report.distance / 1000).toFixed(1)} km`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {report.description.length > 100 
                          ? `${report.description.substring(0, 100)}...` 
                          : report.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            icon={<ThumbUp fontSize="small" />}
                            label={report.verificationCount || 0}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                            color={report.userHasVerified ? 'primary' : 'default'}
                          />
                          <Chip 
                            icon={<ThumbDown fontSize="small" />}
                            label={report.disputeCount || 0}
                            size="small"
                            variant="outlined"
                            color={report.userHasDisputed ? 'primary' : 'default'}
                          />
                        </Box>
                        
                        <Button 
                          size="small" 
                          onClick={() => handleViewReport(report)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                  
                  {nearbyReports.length > 5 && (
                    <Typography variant="body2" color="text.secondary" align="center">
                      +{nearbyReports.length - 5} more reports nearby
                    </Typography>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {nearbyReports.length} reports found in this area. Click Show to view them.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right panel - Map */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', minHeight: 600 }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              <SafetyMap 
                initialPosition={location ? [location.latitude, location.longitude] : undefined}
                onMapClick={handleMapClick}
                showIncidents={true}
                incidents={nearbyReports.map(report => ({
                  id: report.id || '',
                  lat: report.location.latitude,
                  lng: report.location.longitude,
                  type: report.type,
                  severity: report.severity
                }))}
                selectedIncident={selectedReport ? selectedReport.id : undefined}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onClose={() => setShowConsentDialog(false)}>
        <DialogTitle>Consent for Crowdsourced Reporting</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            To submit and view safety reports, we need your consent to process this data in accordance with the DPDP Act 2023.
          </DialogContentText>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            By giving consent, you agree to:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Share your safety reports with other users anonymously" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Allow us to use your reports to improve safety scores and route recommendations" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Maintain a private record of your reports for verification purposes" />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can withdraw this consent at any time through your profile settings.
            For more information, please see our Privacy Policy.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowConsentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGiveConsent}>
            I Give Consent
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Detail Dialog */}
      <Dialog 
        open={showReportDetail} 
        onClose={() => setShowReportDetail(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              {reportTypes.find(t => t.value === selectedReport.type)?.label || selectedReport.type}
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Reported on {new Date(selectedReport.timestamp).toLocaleString()}
                </Typography>
                
                {!selectedReport.isAnonymous && selectedReport.userName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">
                      Reported by: {selectedReport.userName}
                    </Typography>
                    {selectedReport.userReputation !== undefined && (
                      <Chip 
                        label={`Reputation: ${selectedReport.userReputation}`}
                        size="small"
                        sx={{ ml: 1 }}
                        color={selectedReport.userReputation > 70 ? 'success' : 'default'}
                      />
                    )}
                  </Box>
                )}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Severity
              </Typography>
              <Rating 
                value={selectedReport.severity} 
                readOnly 
                max={5}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2" gutterBottom>
                Location
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedReport.location.address || 
                  `${selectedReport.location.latitude.toFixed(6)}, ${selectedReport.location.longitude.toFixed(6)}`}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedReport.description}
              </Typography>
              
              {selectedReport.images && selectedReport.images.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Images
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {selectedReport.images.map((image, index) => (
                      <Box 
                        key={index} 
                        component="img"
                        src={image}
                        alt={`Report image ${index + 1}`}
                        sx={{ 
                          width: 150, 
                          height: 150, 
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Verification Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Chip 
                  label={selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  color={
                    selectedReport.status === 'verified' ? 'success' :
                    selectedReport.status === 'rejected' ? 'error' : 'default'
                  }
                  sx={{ mr: 2 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ThumbUp color="action" fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {selectedReport.verificationCount || 0}
                  </Typography>
                  
                  <ThumbDown color="action" fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {selectedReport.disputeCount || 0}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Help improve safety data by verifying or disputing this report based on your knowledge of the area.
              </Typography>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                startIcon={<Flag />}
                color="error"
                onClick={() => handleFlagReport(selectedReport.id || '')}
              >
                Flag as Inappropriate
              </Button>
              
              <Box>
                <Button 
                  variant="outlined"
                  startIcon={<ThumbDown />}
                  onClick={() => handleVerifyReport(selectedReport.id || '', false)}
                  disabled={selectedReport.userHasDisputed}
                  sx={{ mr: 1 }}
                >
                  Dispute
                </Button>
                
                <Button 
                  variant="contained"
                  startIcon={<ThumbUp />}
                  onClick={() => handleVerifyReport(selectedReport.id || '', true)}
                  disabled={selectedReport.userHasVerified}
                >
                  Verify
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default SafetyReporting;