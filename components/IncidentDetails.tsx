/**
 * IncidentDetails Component
 * Displays detailed information about safety incidents
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Warning,
  LocationOn,
  ThumbUp,
  ThumbDown,
  Flag,
  ArrowBack,
  Share,
  Directions,
  Report,
  Check,
  Close,
  Info,
  Security,
  AccessTime
} from '@mui/icons-material';
import SafetyMap from './SafetyMap';

interface IncidentLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface IncidentData {
  id: string;
  type: string;
  description: string;
  severity: number;
  location: IncidentLocation;
  timestamp: string;
  images?: string[];
  isAnonymous: boolean;
  userId?: string;
  userName?: string;
  userReputation?: number;
  status: 'pending' | 'verified' | 'rejected';
  verificationCount: number;
  disputeCount: number;
  safetyImpact: number; // 1-10 scale of how much this affects safety scores
  relatedIncidents?: string[];
  lastUpdated: string;
}

interface RelatedIncident {
  id: string;
  type: string;
  description: string;
  distance: number; // in meters
  timestamp: string;
}

interface IncidentDetailsProps {
  incidentId?: string;
  initialData?: IncidentData;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incidentId: propIncidentId,
  initialData
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get incident ID from props or URL
  const urlIncidentId = searchParams.get('id');
  const incidentId = propIncidentId || urlIncidentId;

  const [incident, setIncident] = useState<IncidentData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [relatedIncidents, setRelatedIncidents] = useState<RelatedIncident[]>([]);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState<boolean>(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState<boolean>(false);
  const [showFlagDialog, setShowFlagDialog] = useState<boolean>(false);
  const [flagReason, setFlagReason] = useState<string>('');
  const [userHasVerified, setUserHasVerified] = useState<boolean>(false);
  const [userHasDisputed, setUserHasDisputed] = useState<boolean>(false);
  const [userHasFlagged, setUserHasFlagged] = useState<boolean>(false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Report type options for display
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

  // Fetch incident data
  useEffect(() => {
    if (!incidentId && !initialData) {
      setError('No incident ID provided');
      setLoading(false);
      return;
    }

    if (initialData) {
      setIncident(initialData);
      setLoading(false);
      fetchRelatedIncidents(initialData);
      checkUserInteractions(initialData.id);
      return;
    }

    const fetchIncidentData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/reporting/incident/${incidentId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch incident data');
        }

        const data = await response.json();
        setIncident(data);
        setLoading(false);

        // After getting incident data, fetch related incidents
        fetchRelatedIncidents(data);

        // Check if user has already verified/disputed/flagged this incident
        checkUserInteractions(data.id);

        // Generate share URL
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/incident?id=${data.id}`);
      } catch (err: any) {
        console.error('Error fetching incident data:', err);
        setError(err.message || 'Failed to load incident data');
        setLoading(false);
      }
    };

    fetchIncidentData();
  }, [incidentId, initialData]);

  // Fetch related incidents
  const fetchRelatedIncidents = async (incidentData: IncidentData) => {
    try {
      setLoadingRelated(true);

      const response = await fetch(
        `/api/reporting/nearby?lat=${incidentData.location.latitude}&lng=${incidentData.location.longitude}&radius=500&exclude=${incidentData.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch related incidents');
      }

      const data = await response.json();

      // Transform and sort by distance
      const related = data.reports
        .map((report: NearbyReport) => ({
          id: report.id,
          type: report.type,
          description: report.description,
          distance: report.distance
        }))
        .sort((a: RelatedIncident, b: RelatedIncident) => a.distance - b.distance)
        .slice(0, 5); // Limit to 5 closest incidents

      setRelatedIncidents(related);
      setLoadingRelated(false);
    } catch (err: any) {
      console.error('Error fetching related incidents:', err);
      setLoadingRelated(false);
    }
  };

  interface NearbyReport {
    id: string;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    distance: number;
  }

  // Check if user has already verified/disputed/flagged this incident
  const checkUserInteractions = async (id: string) => {
    try {
      const response = await fetch(`/api/reporting/user-interactions/${id}`);

      if (response.ok) {
        const data = await response.json();
        setUserHasVerified(data.hasVerified || false);
        setUserHasDisputed(data.hasDisputed || false);
        setUserHasFlagged(data.hasFlagged || false);
      }
    } catch (err) {
      console.error('Error checking user interactions:', err);
    }
  };

  // Handle verify incident
  const handleVerifyIncident = async () => {
    if (!incident) return;

    try {
      const response = await fetch(`/api/reporting/${incident.id}/verify`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to verify incident');
      }

      // Update local state
      setIncident(prev => {
        if (!prev) return null;
        return {
          ...prev,
          verificationCount: prev.verificationCount + 1
        };
      });

      setUserHasVerified(true);
      setShowVerifyDialog(false);
    } catch (err: any) {
      console.error('Error verifying incident:', err);
      setError(err.message);
    }
  };

  // Handle dispute incident
  const handleDisputeIncident = async () => {
    if (!incident) return;

    try {
      const response = await fetch(`/api/reporting/${incident.id}/dispute`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to dispute incident');
      }

      // Update local state
      setIncident(prev => {
        if (!prev) return null;
        return {
          ...prev,
          disputeCount: prev.disputeCount + 1
        };
      });

      setUserHasDisputed(true);
      setShowDisputeDialog(false);
    } catch (err: any) {
      console.error('Error disputing incident:', err);
      setError(err.message);
    }
  };

  // Handle flag incident
  const handleFlagIncident = async () => {
    if (!incident || !flagReason) return;

    try {
      const response = await fetch(`/api/reporting/${incident.id}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: flagReason })
      });

      if (!response.ok) {
        throw new Error('Failed to flag incident');
      }

      setUserHasFlagged(true);
      setShowFlagDialog(false);
      setError('Thank you for flagging this incident. Our team will review it shortly.');
    } catch (err: any) {
      console.error('Error flagging incident:', err);
      setError(err.message);
    }
  };

  // Handle share incident
  const handleShareIncident = () => {
    if (navigator.share) {
      navigator.share({
        title: `SafeRoute Incident Report: ${incident ? reportTypes.find(t => t.value === incident.type)?.label : 'Safety Incident'}`,
        text: `Check out this safety incident report on SafeRoute: ${incident?.description.substring(0, 100)}${incident?.description.length > 100 ? '...' : ''}`,
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
        setShowShareDialog(true);
      });
    } else {
      setShowShareDialog(true);
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setError('Link copied to clipboard');
    setTimeout(() => setShowShareDialog(false), 1500);
  };

  // Navigate to directions
  const navigateToDirections = () => {
    if (!incident) return;

    router.push(`/navigation?destination=${incident.location.latitude},${incident.location.longitude}`);
  };

  // View related incident
  const viewRelatedIncident = (id: string) => {
    router.push(`/incident?id=${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading incident details...
        </Typography>
      </Container>
    );
  }

  if (error && !incident) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Incident not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Container>
    );
  }

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

      {error && (
        <Alert
          severity={error.includes('Thank you') ? 'success' : 'error'}
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left panel - Incident details */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {reportTypes.find(t => t.value === incident.type)?.label || incident.type}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      color={
                        incident.status === 'verified' ? 'success' :
                          incident.status === 'rejected' ? 'error' : 'default'
                      }
                      size="small"
                      sx={{ mr: 1 }}
                    />

                    <Chip
                      icon={<AccessTime fontSize="small" />}
                      label={new Date(incident.timestamp).toLocaleString()}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <Tooltip title="Share this incident">
                    <IconButton onClick={handleShareIncident}>
                      <Share />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Get directions to this location">
                    <IconButton onClick={navigateToDirections}>
                      <Directions />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Severity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Rating
                  value={incident.severity}
                  readOnly
                  max={5}
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({incident.severity}/5)
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Location
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <LocationOn color="error" sx={{ mr: 1, mt: 0.5 }} />
                <Typography variant="body1">
                  {incident.location.address ||
                    `${incident.location.latitude.toFixed(6)}, ${incident.location.longitude.toFixed(6)}`}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {incident.description}
              </Typography>

              {incident.images && incident.images.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Images
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    {incident.images.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image}
                        alt={`Incident image ${index + 1}`}
                        sx={{
                          width: 200,
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Community Verification
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2
                  }}
                >
                  <ThumbUp sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {incident.verificationCount}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ThumbDown sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {incident.disputeCount}
                  </Typography>
                </Paper>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Help improve safety data by verifying or disputing this incident based on your knowledge of the area.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Flag />}
                  onClick={() => setShowFlagDialog(true)}
                  disabled={userHasFlagged}
                >
                  {userHasFlagged ? 'Flagged' : 'Flag as Inappropriate'}
                </Button>

                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<ThumbDown />}
                    onClick={() => setShowDisputeDialog(true)}
                    disabled={userHasDisputed}
                    sx={{ mr: 1 }}
                  >
                    {userHasDisputed ? 'Disputed' : 'Dispute'}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<ThumbUp />}
                    onClick={() => setShowVerifyDialog(true)}
                    disabled={userHasVerified}
                  >
                    {userHasVerified ? 'Verified' : 'Verify'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Related incidents */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Related Incidents Nearby
              </Typography>

              {loadingRelated ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : relatedIncidents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No related incidents found nearby
                </Typography>
              ) : (
                <List>
                  {relatedIncidents.map((related) => (
                    <Paper key={related.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2">
                          {reportTypes.find(t => t.value === related.type)?.label || related.type}
                        </Typography>

                        <Chip
                          label={`${(related.distance / 1000).toFixed(1)} km`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {related.description.length > 100
                          ? `${related.description.substring(0, 100)}...`
                          : related.description}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(related.timestamp).toLocaleString()}
                        </Typography>

                        <Button
                          size="small"
                          onClick={() => viewRelatedIncident(related.id)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right panel - Map */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', minHeight: 400 }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              <SafetyMap
                initialPosition={[incident.location.latitude, incident.location.longitude]}
                showIncidents={true}
                incidents={[
                  {
                    id: incident.id,
                    lat: incident.location.latitude,
                    lng: incident.location.longitude,
                    type: incident.type,
                    severity: incident.severity
                  },
                  ...relatedIncidents.map(related => ({
                    id: related.id,
                    lat: related.location?.latitude || 0,
                    lng: related.location?.longitude || 0,
                    type: related.type,
                    severity: 0 // We don't have severity in the related incidents data
                  }))
                ].filter(inc => inc.lat && inc.lng)} // Filter out any incidents without valid coordinates
                selectedIncident={incident.id}
                zoomLevel={15}
              />
            </CardContent>
          </Card>

          {/* Safety impact */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Safety Impact
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Impact on Safety Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: '100%',
                        mr: 1,
                        bgcolor: 'grey.300',
                        borderRadius: 1,
                        height: 10,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(incident.safetyImpact / 10) * 100}%`,
                          bgcolor: incident.safetyImpact > 7 ? 'error.main' :
                            incident.safetyImpact > 4 ? 'warning.main' : 'success.main',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {incident.safetyImpact}/10
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary">
                {incident.safetyImpact > 7
                  ? 'This incident significantly reduces the safety score of this area.'
                  : incident.safetyImpact > 4
                    ? 'This incident moderately affects the safety score of this area.'
                    : 'This incident has a minor impact on the safety score of this area.'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Safety Recommendations
              </Typography>

              <List dense>
                {incident.safetyImpact > 7 ? (
                  <>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Avoid this area, especially during night hours" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Consider alternative routes when planning travel" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Stay alert and keep emergency contacts ready if you must pass through" />
                    </ListItem>
                  </>
                ) : incident.safetyImpact > 4 ? (
                  <>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Exercise caution when passing through this area" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Travel with companions when possible" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Be aware of your surroundings" />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Info fontSize="small" color="info" />
                      </ListItemIcon>
                      <ListItemText primary="Normal precautions are sufficient in this area" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Info fontSize="small" color="info" />
                      </ListItemIcon>
                      <ListItemText primary="Stay aware of your surroundings as usual" />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onClose={() => setShowVerifyDialog(false)}>
        <DialogTitle>Verify This Incident</DialogTitle>
        <DialogContent>
          <DialogContentText>
            By verifying this incident, you confirm that you believe this report is accurate based on your knowledge or experience of the area.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Your verification helps improve safety data for everyone. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleVerifyIncident} color="primary">
            Verify Incident
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onClose={() => setShowDisputeDialog(false)}>
        <DialogTitle>Dispute This Incident</DialogTitle>
        <DialogContent>
          <DialogContentText>
            By disputing this incident, you indicate that you believe this report is inaccurate, outdated, or otherwise not helpful based on your knowledge of the area.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Your feedback helps improve the quality of safety data. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisputeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDisputeIncident} color="error">
            Dispute Incident
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onClose={() => setShowFlagDialog(false)}>
        <DialogTitle>Flag Inappropriate Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please let us know why you're flagging this incident report. Our team will review it promptly.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <RadioGroup
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            >
              <FormControlLabel value="false_information" control={<Radio />} label="Contains false information" />
              <FormControlLabel value="offensive_content" control={<Radio />} label="Contains offensive content" />
              <FormControlLabel value="personal_information" control={<Radio />} label="Contains personal information" />
              <FormControlLabel value="spam" control={<Radio />} label="Spam or misleading" />
              <FormControlLabel value="other" control={<Radio />} label="Other reason" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFlagDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleFlagIncident}
            color="error"
            disabled={!flagReason}
          >
            Submit Flag
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
        <DialogTitle>Share This Incident</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share this incident report with others to help them stay safe.
          </DialogContentText>
          <TextField
            fullWidth
            value={shareUrl}
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button variant="contained" size="small" onClick={copyShareUrl}>
                  Copy
                </Button>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IncidentDetails;