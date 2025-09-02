/**
 * Family Emergency Plan Page
 * Helps users create and manage a comprehensive family emergency plan
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { 
  Warning, 
  Print, 
  Share, 
  Download,
  Save,
  Add,
  Delete,
  Edit,
  ArrowBack,
  ArrowForward,
  Check,
  Home,
  Phone,
  LocationOn,
  Person,
  School,
  Work,
  Pets,
  LocalHospital,
  DirectionsCar,
  Info
} from '@mui/icons-material';
import Link from 'next/link';

// Interface for emergency contact
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

// Interface for meeting place
interface MeetingPlace {
  id: string;
  name: string;
  address: string;
  description?: string;
  type: 'neighborhood' | 'local' | 'out-of-town';
}

// Interface for family member
interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  school?: string;
  work?: string;
  medicalInfo?: string;
  medications?: string[];
  allergies?: string[];
}

// Interface for pet
interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  description?: string;
  microchipId?: string;
  vetInfo?: string;
  medications?: string[];
}

// Interface for emergency plan
interface EmergencyPlan {
  id: string;
  name: string;
  contacts: EmergencyContact[];
  meetingPlaces: MeetingPlace[];
  familyMembers: FamilyMember[];
  pets: Pet[];
  emergencyNumbers: Record<string, string>;
  evacuationRoutes: string[];
  documents: string[];
  additionalInfo: string;
  lastUpdated: string;
}

// Default emergency plan
const DEFAULT_PLAN: EmergencyPlan = {
  id: 'default',
  name: 'Family Emergency Plan',
  contacts: [],
  meetingPlaces: [],
  familyMembers: [],
  pets: [],
  emergencyNumbers: {
    police: '112',
    fire: '112',
    ambulance: '112',
    poison: '',
    doctor: '',
    insurance: '',
    utility: '',
  },
  evacuationRoutes: [],
  documents: [
    "Identification (passports, birth certificates, driver's licenses)",
    'Insurance policies',
    'Medical records and prescriptions',
    'Bank account information',
    'Emergency contact information',
    'Property deeds/rental agreements',
    'Vehicle registration and titles',
  ],
  additionalInfo: '',
  lastUpdated: new Date().toISOString(),
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

export default function FamilyEmergencyPlanPage() {
  const [plan, setPlan] = useState<EmergencyPlan>(DEFAULT_PLAN);
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingItemType, setEditingItemType] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Load saved plan from localStorage on component mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('familyEmergencyPlan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (error) {
        console.error('Error parsing saved plan:', error);
      }
    }
  }, []);
  
  // Save plan to localStorage
  const savePlan = () => {
    const updatedPlan = {
      ...plan,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem('familyEmergencyPlan', JSON.stringify(updatedPlan));
    setPlan(updatedPlan);
    
    setSnackbarMessage('Emergency plan saved successfully');
    setSnackbarOpen(true);
  };
  
  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle reset
  const handleReset = () => {
    if (confirm('Are you sure you want to reset your emergency plan? This action cannot be undone.')) {
      setPlan(DEFAULT_PLAN);
      setActiveStep(0);
      localStorage.removeItem('familyEmergencyPlan');
      
      setSnackbarMessage('Emergency plan reset successfully');
      setSnackbarOpen(true);
    }
  };
  
  // Open dialog for adding/editing items
  const openEditDialog = (type: string, item: any = null) => {
    setEditingItemType(type);
    setEditingItem(item || getEmptyItem(type));
    setOpenDialog(true);
  };
  
  // Close dialog
  const closeDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };
  
  // Get empty item based on type
  const getEmptyItem = (type: string) => {
    switch (type) {
      case 'contact':
        return { id: generateId(), name: '', relationship: '', phone: '', email: '', address: '' };
      case 'meetingPlace':
        return { id: generateId(), name: '', address: '', description: '', type: 'neighborhood' };
      case 'familyMember':
        return { id: generateId(), name: '', relationship: '', phone: '', email: '', school: '', work: '', medicalInfo: '', medications: [], allergies: [] };
      case 'pet':
        return { id: generateId(), name: '', type: '', breed: '', description: '', microchipId: '', vetInfo: '', medications: [] };
      case 'evacuationRoute':
        return '';
      default:
        return {};
    }
  };
  
  // Save item from dialog
  const saveItem = () => {
    const updatedPlan = { ...plan };
    
    switch (editingItemType) {
      case 'contact':
        if (editingItem.id && plan.contacts.some(c => c.id === editingItem.id)) {
          updatedPlan.contacts = plan.contacts.map(c => c.id === editingItem.id ? editingItem : c);
        } else {
          updatedPlan.contacts = [...plan.contacts, editingItem];
        }
        break;
      case 'meetingPlace':
        if (editingItem.id && plan.meetingPlaces.some(p => p.id === editingItem.id)) {
          updatedPlan.meetingPlaces = plan.meetingPlaces.map(p => p.id === editingItem.id ? editingItem : p);
        } else {
          updatedPlan.meetingPlaces = [...plan.meetingPlaces, editingItem];
        }
        break;
      case 'familyMember':
        if (editingItem.id && plan.familyMembers.some(f => f.id === editingItem.id)) {
          updatedPlan.familyMembers = plan.familyMembers.map(f => f.id === editingItem.id ? editingItem : f);
        } else {
          updatedPlan.familyMembers = [...plan.familyMembers, editingItem];
        }
        break;
      case 'pet':
        if (editingItem.id && plan.pets.some(p => p.id === editingItem.id)) {
          updatedPlan.pets = plan.pets.map(p => p.id === editingItem.id ? editingItem : p);
        } else {
          updatedPlan.pets = [...plan.pets, editingItem];
        }
        break;
      case 'evacuationRoute':
        if (typeof editingItem === 'number') {
          updatedPlan.evacuationRoutes = plan.evacuationRoutes.map((route, index) => 
            index === editingItem ? editingItem : route
          );
        } else {
          updatedPlan.evacuationRoutes = [...plan.evacuationRoutes, editingItem];
        }
        break;
      default:
        break;
    }
    
    setPlan(updatedPlan);
    closeDialog();
  };
  
  // Delete item
  const deleteItem = (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const updatedPlan = { ...plan };
    
    switch (type) {
      case 'contact':
        updatedPlan.contacts = plan.contacts.filter(c => c.id !== id);
        break;
      case 'meetingPlace':
        updatedPlan.meetingPlaces = plan.meetingPlaces.filter(p => p.id !== id);
        break;
      case 'familyMember':
        updatedPlan.familyMembers = plan.familyMembers.filter(f => f.id !== id);
        break;
      case 'pet':
        updatedPlan.pets = plan.pets.filter(p => p.id !== id);
        break;
      case 'evacuationRoute':
        updatedPlan.evacuationRoutes = plan.evacuationRoutes.filter((_, index) => index !== parseInt(id));
        break;
      case 'document':
        updatedPlan.documents = plan.documents.filter((_, index) => index !== parseInt(id));
        break;
      default:
        break;
    }
    
    setPlan(updatedPlan);
  };
  
  // Handle input change for editing item
  const handleEditingItemChange = (field: string, value: any) => {
    setEditingItem({
      ...editingItem,
      [field]: value,
    });
  };
  
  // Handle array field change (medications, allergies)
  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    const updatedArray = [...(editingItem[field] || [])];
    updatedArray[index] = value;
    
    setEditingItem({
      ...editingItem,
      [field]: updatedArray,
    });
  };
  
  // Add item to array field
  const addArrayItem = (field: string) => {
    setEditingItem({
      ...editingItem,
      [field]: [...(editingItem[field] || []), ''],
    });
  };
  
  // Remove item from array field
  const removeArrayItem = (field: string, index: number) => {
    const updatedArray = [...(editingItem[field] || [])];
    updatedArray.splice(index, 1);
    
    setEditingItem({
      ...editingItem,
      [field]: updatedArray,
    });
  };
  
  // Handle emergency number change
  const handleEmergencyNumberChange = (key: string, value: string) => {
    setPlan({
      ...plan,
      emergencyNumbers: {
        ...plan.emergencyNumbers,
        [key]: value,
      },
    });
  };
  
  // Add document
  const addDocument = (document: string) => {
    if (!document.trim()) return;
    
    setPlan({
      ...plan,
      documents: [...plan.documents, document],
    });
  };
  
  // Print plan
  const printPlan = () => {
    window.print();
  };
  
  // Download plan as JSON
  const downloadPlan = () => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'family_emergency_plan.json');
    linkElement.click();
  };
  
  // Share plan
  const sharePlan = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Family Emergency Plan',
        text: 'My Family Emergency Plan',
        url: window.location.href,
      });
    } else {
      alert('Web Share API not supported in your browser');
    }
  };
  
  // Render dialog content based on editing item type
  const renderDialogContent = () => {
    switch (editingItemType) {
      case 'contact':
        return (
          <>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={editingItem?.name || ''}
              onChange={(e) => handleEditingItemChange('name', e.target.value)}
              required
            />
            <TextField
              label="Relationship"
              fullWidth
              margin="normal"
              value={editingItem?.relationship || ''}
              onChange={(e) => handleEditingItemChange('relationship', e.target.value)}
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              value={editingItem?.phone || ''}
              onChange={(e) => handleEditingItemChange('phone', e.target.value)}
              required
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={editingItem?.email || ''}
              onChange={(e) => handleEditingItemChange('email', e.target.value)}
            />
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={editingItem?.address || ''}
              onChange={(e) => handleEditingItemChange('address', e.target.value)}
            />
          </>
        );
      
      case 'meetingPlace':
        return (
          <>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={editingItem?.name || ''}
              onChange={(e) => handleEditingItemChange('name', e.target.value)}
              required
            />
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={editingItem?.address || ''}
              onChange={(e) => handleEditingItemChange('address', e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={editingItem?.description || ''}
              onChange={(e) => handleEditingItemChange('description', e.target.value)}
              multiline
              rows={2}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={editingItem?.type || 'neighborhood'}
                onChange={(e) => handleEditingItemChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="neighborhood">Neighborhood (Close to home)</MenuItem>
                <MenuItem value="local">Local (Within your town)</MenuItem>
                <MenuItem value="out-of-town">Out-of-town (Evacuation location)</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      
      case 'familyMember':
        return (
          <>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={editingItem?.name || ''}
              onChange={(e) => handleEditingItemChange('name', e.target.value)}
              required
            />
            <TextField
              label="Relationship"
              fullWidth
              margin="normal"
              value={editingItem?.relationship || ''}
              onChange={(e) => handleEditingItemChange('relationship', e.target.value)}
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              value={editingItem?.phone || ''}
              onChange={(e) => handleEditingItemChange('phone', e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={editingItem?.email || ''}
              onChange={(e) => handleEditingItemChange('email', e.target.value)}
            />
            <TextField
              label="School/Daycare"
              fullWidth
              margin="normal"
              value={editingItem?.school || ''}
              onChange={(e) => handleEditingItemChange('school', e.target.value)}
            />
            <TextField
              label="Work/Other Location"
              fullWidth
              margin="normal"
              value={editingItem?.work || ''}
              onChange={(e) => handleEditingItemChange('work', e.target.value)}
            />
            <TextField
              label="Medical Information"
              fullWidth
              margin="normal"
              value={editingItem?.medicalInfo || ''}
              onChange={(e) => handleEditingItemChange('medicalInfo', e.target.value)}
              multiline
              rows={2}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Medications
            </Typography>
            {(editingItem?.medications || []).map((med: string, index: number) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={med}
                  onChange={(e) => handleArrayFieldChange('medications', index, e.target.value)}
                />
                <IconButton 
                  color="error" 
                  onClick={() => removeArrayItem('medications', index)}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              onClick={() => addArrayItem('medications')}
              sx={{ mt: 1 }}
            >
              Add Medication
            </Button>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Allergies
            </Typography>
            {(editingItem?.allergies || []).map((allergy: string, index: number) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={allergy}
                  onChange={(e) => handleArrayFieldChange('allergies', index, e.target.value)}
                />
                <IconButton 
                  color="error" 
                  onClick={() => removeArrayItem('allergies', index)}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              onClick={() => addArrayItem('allergies')}
              sx={{ mt: 1 }}
            >
              Add Allergy
            </Button>
          </>
        );
      
      case 'pet':
        return (
          <>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={editingItem?.name || ''}
              onChange={(e) => handleEditingItemChange('name', e.target.value)}
              required
            />
            <TextField
              label="Type (Dog, Cat, etc.)"
              fullWidth
              margin="normal"
              value={editingItem?.type || ''}
              onChange={(e) => handleEditingItemChange('type', e.target.value)}
              required
            />
            <TextField
              label="Breed"
              fullWidth
              margin="normal"
              value={editingItem?.breed || ''}
              onChange={(e) => handleEditingItemChange('breed', e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={editingItem?.description || ''}
              onChange={(e) => handleEditingItemChange('description', e.target.value)}
              multiline
              rows={2}
            />
            <TextField
              label="Microchip ID"
              fullWidth
              margin="normal"
              value={editingItem?.microchipId || ''}
              onChange={(e) => handleEditingItemChange('microchipId', e.target.value)}
            />
            <TextField
              label="Veterinarian Information"
              fullWidth
              margin="normal"
              value={editingItem?.vetInfo || ''}
              onChange={(e) => handleEditingItemChange('vetInfo', e.target.value)}
              multiline
              rows={2}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Medications
            </Typography>
            {(editingItem?.medications || []).map((med: string, index: number) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={med}
                  onChange={(e) => handleArrayFieldChange('medications', index, e.target.value)}
                />
                <IconButton 
                  color="error" 
                  onClick={() => removeArrayItem('medications', index)}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              onClick={() => addArrayItem('medications')}
              sx={{ mt: 1 }}
            >
              Add Medication
            </Button>
          </>
        );
      
      case 'evacuationRoute':
        return (
          <TextField
            label="Evacuation Route Description"
            fullWidth
            margin="normal"
            value={editingItem || ''}
            onChange={(e) => setEditingItem(e.target.value)}
            multiline
            rows={3}
            required
          />
        );
      
      case 'document':
        return (
          <TextField
            label="Document Name"
            fullWidth
            margin="normal"
            value={editingItem || ''}
            onChange={(e) => setEditingItem(e.target.value)}
            required
          />
        );
      
      default:
        return null;
    }
  };
  
  // Steps for the stepper
  const steps = [
    {
      label: 'Emergency Contacts',
      description: 'Add emergency contacts who should be notified in case of emergency.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Add emergency contacts who should be notified in case of emergency. Include family members, friends, neighbors, and other important contacts.
          </Typography>
          
          {plan.contacts.length > 0 ? (
            <Grid container spacing={2}>
              {plan.contacts.map((contact) => (
                <Grid item xs={12} sm={6} md={4} key={contact.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {contact.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => openEditDialog('contact', contact)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteItem('contact', contact.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {contact.relationship}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Phone fontSize="small" sx={{ mr: 1 }} />
                          {contact.phone}
                        </Typography>
                        
                        {contact.email && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Info fontSize="small" sx={{ mr: 1 }} />
                            {contact.email}
                          </Typography>
                        )}
                        
                        {contact.address && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn fontSize="small" sx={{ mr: 1 }} />
                            {contact.address}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No emergency contacts added yet. Click the button below to add your first contact.
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => openEditDialog('contact')}
            sx={{ mt: 2 }}
          >
            Add Emergency Contact
          </Button>
        </Box>
      ),
    },
    {
      label: 'Meeting Places',
      description: 'Designate meeting places where your family can reunite in case of emergency.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Designate meeting places where your family can reunite in case of emergency. Include a neighborhood meeting place, a local meeting place, and an out-of-town meeting place.
          </Typography>
          
          {plan.meetingPlaces.length > 0 ? (
            <Grid container spacing={2}>
              {plan.meetingPlaces.map((place) => (
                <Grid item xs={12} sm={6} md={4} key={place.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {place.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => openEditDialog('meetingPlace', place)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteItem('meetingPlace', place.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Chip 
                        label={{
                          neighborhood: 'Neighborhood',
                          local: 'Local',
                          'out-of-town': 'Out-of-town',
                        }[place.type]}
                        size="small"
                        color={{
                          neighborhood: 'primary',
                          local: 'secondary',
                          'out-of-town': 'error',
                        }[place.type as 'neighborhood' | 'local' | 'out-of-town']}
                        sx={{ mb: 1 }}
                      />
                      
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn fontSize="small" sx={{ mr: 1 }} />
                        {place.address}
                      </Typography>
                      
                      {place.description && (
                        <Typography variant="body2" color="text.secondary">
                          {place.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No meeting places added yet. Click the button below to add your first meeting place.
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => openEditDialog('meetingPlace')}
            sx={{ mt: 2 }}
          >
            Add Meeting Place
          </Button>
        </Box>
      ),
    },
    {
      label: 'Family Members',
      description: 'Add information about each family member, including medical information.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Add information about each family member, including contact information, locations they frequent, and medical information.
          </Typography>
          
          {plan.familyMembers.length > 0 ? (
            <Grid container spacing={2}>
              {plan.familyMembers.map((member) => (
                <Grid item xs={12} sm={6} key={member.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {member.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => openEditDialog('familyMember', member)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteItem('familyMember', member.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {member.relationship}
                      </Typography>
                      
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        {member.phone && (
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Phone fontSize="small" sx={{ mr: 1 }} />
                              {member.phone}
                            </Typography>
                          </Grid>
                        )}
                        
                        {member.school && (
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <School fontSize="small" sx={{ mr: 1 }} />
                              {member.school}
                            </Typography>
                          </Grid>
                        )}
                        
                        {member.work && (
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Work fontSize="small" sx={{ mr: 1 }} />
                              {member.work}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                      
                      {(member.medicalInfo || member.medications?.length > 0 || member.allergies?.length > 0) && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" color="primary">
                            Medical Information
                          </Typography>
                          
                          {member.medicalInfo && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {member.medicalInfo}
                            </Typography>
                          )}
                          
                          {member.medications?.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Medications:
                              </Typography>
                              <List dense disablePadding>
                                {member.medications.map((med, index) => (
                                  <ListItem key={index} disablePadding>
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      <LocalHospital fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary={med} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                          
                          {member.allergies?.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Allergies:
                              </Typography>
                              <List dense disablePadding>
                                {member.allergies.map((allergy, index) => (
                                  <ListItem key={index} disablePadding>
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      <Warning fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary={allergy} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No family members added yet. Click the button below to add your first family member.
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => openEditDialog('familyMember')}
            sx={{ mt: 2 }}
          >
            Add Family Member
          </Button>
        </Box>
      ),
    },
    {
      label: 'Pets',
      description: 'Add information about your pets, including veterinary information.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Add information about your pets, including description, veterinary information, and medications.
          </Typography>
          
          {plan.pets.length > 0 ? (
            <Grid container spacing={2}>
              {plan.pets.map((pet) => (
                <Grid item xs={12} sm={6} md={4} key={pet.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" gutterBottom>
                          {pet.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => openEditDialog('pet', pet)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => deleteItem('pet', pet.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {pet.type}{pet.breed ? ` - ${pet.breed}` : ''}
                      </Typography>
                      
                      {pet.description && (
                        <Typography variant="body2" paragraph>
                          {pet.description}
                        </Typography>
                      )}
                      
                      {pet.microchipId && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Microchip ID:</strong> {pet.microchipId}
                        </Typography>
                      )}
                      
                      {pet.vetInfo && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Vet Info:</strong> {pet.vetInfo}
                        </Typography>
                      )}
                      
                      {pet.medications?.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Medications:
                          </Typography>
                          <List dense disablePadding>
                            {pet.medications.map((med, index) => (
                              <ListItem key={index} disablePadding>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <LocalHospital fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText primary={med} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No pets added yet. If you have pets, click the button below to add them to your emergency plan.
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => openEditDialog('pet')}
            sx={{ mt: 2 }}
          >
            Add Pet
          </Button>
        </Box>
      ),
    },
    {
      label: 'Emergency Numbers',
      description: 'Add important emergency phone numbers.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Add important emergency phone numbers that you may need in case of emergency.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Police/Fire/Ambulance"
                fullWidth
                margin="normal"
                value={plan.emergencyNumbers.police}
                onChange={(e) => handleEmergencyNumberChange('police', e.target.value)}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Warning color="error" fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Poison Control"
                fullWidth
                margin="normal"
                value={plan.emergencyNumbers.poison}
                onChange={(e) => handleEmergencyNumberChange('poison', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Family Doctor"
                fullWidth
                margin="normal"
                value={plan.emergencyNumbers.doctor}
                onChange={(e) => handleEmergencyNumberChange('doctor', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Insurance Company"
                fullWidth
                margin="normal"
                value={plan.emergencyNumbers.insurance}
                onChange={(e) => handleEmergencyNumberChange('insurance', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Utility Company"
                fullWidth
                margin="normal"
                value={plan.emergencyNumbers.utility}
                onChange={(e) => handleEmergencyNumberChange('utility', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Evacuation Routes',
      description: 'Plan evacuation routes from your home and other locations.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Plan evacuation routes from your home and other locations. Include multiple routes in case some are blocked.
          </Typography>
          
          {plan.evacuationRoutes.length > 0 ? (
            <List>
              {plan.evacuationRoutes.map((route, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body1">
                      {route}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setEditingItem(route);
                          setEditingItemType('evacuationRoute');
                          setOpenDialog(true);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => deleteItem('evacuationRoute', index.toString())}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No evacuation routes added yet. Click the button below to add your first evacuation route.
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => openEditDialog('evacuationRoute')}
            sx={{ mt: 2 }}
          >
            Add Evacuation Route
          </Button>
        </Box>
      ),
    },
    {
      label: 'Important Documents',
      description: 'List important documents to keep in a safe, accessible place.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            List important documents to keep in a safe, accessible place. Consider storing copies in a waterproof container or digitally in a secure cloud storage.
          </Typography>
          
          {plan.documents.length > 0 ? (
            <List>
              {plan.documents.map((document, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {document}
                    </Typography>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => deleteItem('document', index.toString())}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No documents listed yet. Click the button below to add important documents to your list.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', mt: 2 }}>
            <TextField
              label="Document Name"
              fullWidth
              value={editingItem || ''}
              onChange={(e) => setEditingItem(e.target.value)}
            />
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => {
                if (editingItem) {
                  addDocument(editingItem as string);
                  setEditingItem('');
                }
              }}
              sx={{ ml: 1 }}
            >
              Add
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Additional Information',
      description: 'Add any additional information that may be useful in an emergency.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Add any additional information that may be useful in an emergency, such as special instructions, important notes, or reminders.
          </Typography>
          
          <TextField
            label="Additional Information"
            fullWidth
            multiline
            rows={6}
            value={plan.additionalInfo}
            onChange={(e) => setPlan({ ...plan, additionalInfo: e.target.value })}
          />
        </Box>
      ),
    },
    {
      label: 'Review & Save',
      description: 'Review your emergency plan and save it.',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Review your emergency plan and save it. You can also print or download a copy for offline access.
          </Typography>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Emergency Plan Created</AlertTitle>
            Your family emergency plan has been created. Make sure to save it, print a copy, and share it with all family members.
          </Alert>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Save />}
              onClick={savePlan}
            >
              Save Plan
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<Print />}
              onClick={printPlan}
            >
              Print Plan
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={downloadPlan}
            >
              Download Plan
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<Share />}
              onClick={sharePlan}
            >
              Share Plan
            </Button>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Plan Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Emergency Contacts
                </Typography>
                <Typography variant="body2">
                  {plan.contacts.length} contacts added
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Meeting Places
                </Typography>
                <Typography variant="body2">
                  {plan.meetingPlaces.length} meeting places added
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Family Members
                </Typography>
                <Typography variant="body2">
                  {plan.familyMembers.length} family members added
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Pets
                </Typography>
                <Typography variant="body2">
                  {plan.pets.length} pets added
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Evacuation Routes
                </Typography>
                <Typography variant="body2">
                  {plan.evacuationRoutes.length} routes added
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Important Documents
                </Typography>
                <Typography variant="body2">
                  {plan.documents.length} documents listed
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleReset}
            >
              Reset Plan
            </Button>
          </Box>
        </Box>
      ),
    },
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          href="/safety/tips"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Safety Tips
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Family Emergency Plan
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Create a comprehensive emergency plan for your family to use in case of emergency.
        </Typography>
      </Box>
      
      {/* Emergency Reminder */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'error.light', 
          color: 'error.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Warning sx={{ mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h5" gutterBottom>
              Emergency Helpline: <strong>112</strong>
            </Typography>
            <Typography variant="body1">
              In case of immediate danger or emergency, call the national emergency number.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>
              <Typography variant="subtitle1">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {step.description}
              </Typography>
              
              {step.content}
              
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={index === steps.length - 1 ? <Check /> : <ArrowForward />}
                >
                  {index === steps.length - 1 ? 'Finish' : 'Continue'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {/* Dialog for adding/editing items */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem && editingItemType === 'contact' && editingItem.id ? 'Edit Contact' : ''}
          {editingItemType === 'contact' && (!editingItem || !editingItem.id) ? 'Add Contact' : ''}
          {editingItem && editingItemType === 'meetingPlace' && editingItem.id ? 'Edit Meeting Place' : ''}
          {editingItemType === 'meetingPlace' && (!editingItem || !editingItem.id) ? 'Add Meeting Place' : ''}
          {editingItem && editingItemType === 'familyMember' && editingItem.id ? 'Edit Family Member' : ''}
          {editingItemType === 'familyMember' && (!editingItem || !editingItem.id) ? 'Add Family Member' : ''}
          {editingItem && editingItemType === 'pet' && editingItem.id ? 'Edit Pet' : ''}
          {editingItemType === 'pet' && (!editingItem || !editingItem.id) ? 'Add Pet' : ''}
          {editingItemType === 'evacuationRoute' ? 'Add Evacuation Route' : ''}
          {editingItemType === 'document' ? 'Add Document' : ''}
        </DialogTitle>
        
        <DialogContent dividers>
          {renderDialogContent()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={saveItem}
            startIcon={<Save />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          This family emergency plan is provided for informational purposes only and should not replace professional advice or training.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}