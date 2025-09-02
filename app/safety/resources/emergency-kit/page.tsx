/**
 * Emergency Kit Checklist Page
 * Provides a comprehensive list of items for emergency preparedness
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Warning, 
  Print, 
  Share, 
  Download,
  ExpandMore,
  Info,
  CheckCircle,
  LocalFireDepartment,
  Healing,
  WaterDrop,
  Restaurant,
  BatteryChargingFull,
  Lightbulb,
  Wc,
  Pets,
  ChildCare,
  ElderlyWoman,
  Inventory,
  ArrowBack
} from '@mui/icons-material';
import Link from 'next/link';

// Emergency kit item categories
const CATEGORIES = [
  { id: 'basic', label: 'Basic Supplies', icon: <Inventory color="primary" /> },
  { id: 'water', label: 'Water & Food', icon: <Restaurant color="primary" /> },
  { id: 'first-aid', label: 'First Aid & Medication', icon: <Healing color="error" /> },
  { id: 'tools', label: 'Tools & Supplies', icon: <BatteryChargingFull color="primary" /> },
  { id: 'documents', label: 'Documents & Information', icon: <Info color="primary" /> },
  { id: 'hygiene', label: 'Sanitation & Hygiene', icon: <Wc color="primary" /> },
  { id: 'special', label: 'Special Needs', icon: <ElderlyWoman color="primary" /> },
  { id: 'children', label: 'Children Items', icon: <ChildCare color="primary" /> },
  { id: 'pets', label: 'Pet Supplies', icon: <Pets color="primary" /> },
];

// Emergency kit items
const EMERGENCY_KIT_ITEMS = [
  // Basic Supplies
  { id: 1, name: 'Water (4 liters per person per day for at least 3 days)', category: 'water', essential: true },
  { id: 2, name: 'Non-perishable food (at least 3-day supply)', category: 'water', essential: true },
  { id: 3, name: 'Battery-powered or hand-crank radio', category: 'basic', essential: true },
  { id: 4, name: 'Flashlight with extra batteries', category: 'basic', essential: true },
  { id: 5, name: 'First aid kit', category: 'first-aid', essential: true },
  { id: 6, name: 'Whistle to signal for help', category: 'basic', essential: true },
  { id: 7, name: 'Dust mask to filter contaminated air', category: 'basic', essential: true },
  { id: 8, name: 'Plastic sheeting and duct tape for shelter', category: 'basic', essential: false },
  { id: 9, name: 'Moist towelettes, garbage bags, and plastic ties for sanitation', category: 'hygiene', essential: true },
  { id: 10, name: 'Wrench or pliers to turn off utilities', category: 'tools', essential: true },
  { id: 11, name: 'Manual can opener', category: 'tools', essential: true },
  { id: 12, name: 'Local maps', category: 'documents', essential: true },
  { id: 13, name: 'Cell phone with chargers and backup battery', category: 'basic', essential: true },
  
  // Additional Emergency Supplies
  { id: 14, name: 'Prescription medications and glasses', category: 'first-aid', essential: true },
  { id: 15, name: 'Infant formula, bottles, diapers, wipes', category: 'children', essential: false },
  { id: 16, name: 'Pet food and extra water for your pet', category: 'pets', essential: false },
  { id: 17, name: 'Important family documents in a waterproof container', category: 'documents', essential: true },
  { id: 18, name: "Cash or traveler's checks", category: 'documents', essential: true },
  { id: 19, name: 'Emergency reference material (first aid book)', category: 'documents', essential: false },
  { id: 20, name: 'Sleeping bag or warm blanket for each person', category: 'basic', essential: false },
  { id: 21, name: 'Complete change of clothing and sturdy shoes', category: 'basic', essential: true },
  { id: 22, name: 'Fire extinguisher', category: 'basic', essential: true },
  { id: 23, name: 'Matches in a waterproof container', category: 'basic', essential: true },
  { id: 24, name: 'Feminine supplies and personal hygiene items', category: 'hygiene', essential: true },
  { id: 25, name: 'Mess kits, paper cups, plates, towels, and plastic utensils', category: 'water', essential: false },
  { id: 26, name: 'Paper and pencil', category: 'documents', essential: false },
  { id: 27, name: 'Books, games, puzzles for children', category: 'children', essential: false },
  
  // First Aid Kit Items
  { id: 28, name: 'Adhesive bandages in various sizes', category: 'first-aid', essential: true },
  { id: 29, name: 'Sterile gauze pads and adhesive tape', category: 'first-aid', essential: true },
  { id: 30, name: 'Antiseptic wipes and antibiotic ointment', category: 'first-aid', essential: true },
  { id: 31, name: 'Scissors and tweezers', category: 'first-aid', essential: true },
  { id: 32, name: 'Thermometer', category: 'first-aid', essential: true },
  { id: 33, name: 'Non-prescription pain relievers', category: 'first-aid', essential: true },
  { id: 34, name: 'Anti-diarrhea medication', category: 'first-aid', essential: false },
  { id: 35, name: 'Antacids', category: 'first-aid', essential: false },
  { id: 36, name: 'Laxatives', category: 'first-aid', essential: false },
  
  // Special Needs Items
  { id: 37, name: 'Medical supplies (hearing aids, glucose monitor, etc.)', category: 'special', essential: false },
  { id: 38, name: 'Assistive devices (canes, walkers, etc.)', category: 'special', essential: false },
  { id: 39, name: 'List of medications, dosages, and allergies', category: 'special', essential: false },
  { id: 40, name: 'Extra eyeglasses or contact lenses and solution', category: 'special', essential: false },
  
  // Pet Supplies
  { id: 41, name: 'Pet carrier or crate', category: 'pets', essential: false },
  { id: 42, name: 'Pet medications and medical records', category: 'pets', essential: false },
  { id: 43, name: 'Pet first aid kit', category: 'pets', essential: false },
  { id: 44, name: 'Collar with ID tag, harness or leash', category: 'pets', essential: false },
  { id: 45, name: 'Litter, litter box, and scoop for cats', category: 'pets', essential: false },
  
  // Additional Tools and Supplies
  { id: 46, name: 'Multi-purpose tool or knife', category: 'tools', essential: false },
  { id: 47, name: 'Signal flare', category: 'tools', essential: false },
  { id: 48, name: 'Compass', category: 'tools', essential: false },
  { id: 49, name: 'Work gloves', category: 'tools', essential: false },
  { id: 50, name: 'Duct tape', category: 'tools', essential: true },
];

// Interface for emergency kit item
interface EmergencyKitItem {
  id: number;
  name: string;
  category: string;
  essential: boolean;
  checked?: boolean;
}

export default function EmergencyKitChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEssentialOnly, setShowEssentialOnly] = useState(false);
  
  // Filter items based on selected category and essential flag
  const filteredItems = EMERGENCY_KIT_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesEssential = !showEssentialOnly || item.essential;
    
    return matchesCategory && matchesEssential;
  });
  
  // Toggle checked status of an item
  const toggleChecked = (itemId: number) => {
    if (checkedItems.includes(itemId)) {
      setCheckedItems(checkedItems.filter(id => id !== itemId));
    } else {
      setCheckedItems([...checkedItems, itemId]);
    }
  };
  
  // Calculate progress
  const essentialItems = EMERGENCY_KIT_ITEMS.filter(item => item.essential);
  const checkedEssentialItems = essentialItems.filter(item => checkedItems.includes(item.id));
  const essentialProgress = Math.round((checkedEssentialItems.length / essentialItems.length) * 100);
  
  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, EmergencyKitItem[]>);
  
  // Print checklist
  const printChecklist = () => {
    window.print();
  };
  
  // Reset checklist
  const resetChecklist = () => {
    setCheckedItems([]);
  };
  
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
          Emergency Kit Checklist
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Use this checklist to prepare your emergency kit. Essential items are marked with a star.
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
      
      {/* Progress */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Essential Items Progress
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <Box 
              sx={{ 
                height: 10, 
                borderRadius: 5, 
                bgcolor: 'grey.300',
                position: 'relative',
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${essentialProgress}%`,
                  borderRadius: 5,
                  bgcolor: essentialProgress === 100 ? 'success.main' : 'primary.main',
                  transition: 'width 0.5s ease-in-out',
                }}
              />
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {checkedEssentialItems.length} of {essentialItems.length} essential items ({essentialProgress}%)
          </Typography>
        </Box>
        
        {essentialProgress === 100 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <AlertTitle>Congratulations!</AlertTitle>
            You have all essential items in your emergency kit.
          </Alert>
        )}
      </Paper>
      
      {/* Actions */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<Print />}
          onClick={printChecklist}
        >
          Print Checklist
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          href="/downloads/emergency-kit-checklist.pdf"
        >
          Download PDF
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<Share />}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Emergency Kit Checklist',
                url: window.location.href,
              });
            }
          }}
        >
          Share
        </Button>
        
        <Button 
          variant="outlined" 
          color="error"
          onClick={resetChecklist}
        >
          Reset Checklist
        </Button>
      </Box>
      
      {/* Categories */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="All Categories" 
          onClick={() => setSelectedCategory('all')}
          color={selectedCategory === 'all' ? 'primary' : 'default'}
          variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
          sx={{ mb: 1 }}
        />
        
        {CATEGORIES.map((category) => (
          <Chip 
            key={category.id}
            label={category.label}
            icon={category.icon}
            onClick={() => setSelectedCategory(category.id)}
            color={selectedCategory === category.id ? 'primary' : 'default'}
            variant={selectedCategory === category.id ? 'filled' : 'outlined'}
            sx={{ mb: 1 }}
          />
        ))}
        
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Checkbox 
            checked={showEssentialOnly}
            onChange={(e) => setShowEssentialOnly(e.target.checked)}
            id="essential-only"
          />
          <Typography 
            component="label" 
            htmlFor="essential-only" 
            variant="body2"
            sx={{ cursor: 'pointer' }}
          >
            Show Essential Items Only
          </Typography>
        </Box>
      </Box>
      
      {/* Checklist */}
      {Object.keys(itemsByCategory).length > 0 ? (
        <Box>
          {Object.entries(itemsByCategory).map(([category, items]) => {
            const categoryInfo = CATEGORIES.find(c => c.id === category);
            
            return (
              <Accordion key={category} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 2 }}>
                      {categoryInfo?.icon}
                    </Box>
                    
                    <Typography variant="h6">
                      {categoryInfo?.label || category}
                    </Typography>
                    
                    <Chip 
                      label={`${items.length} items`}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <List>
                    {items.map((item) => (
                      <ListItem key={item.id} disablePadding>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={checkedItems.includes(item.id)}
                            onChange={() => toggleChecked(item.id)}
                            inputProps={{ 'aria-labelledby': `item-${item.id}` }}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          id={`item-${item.id}`} 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography 
                                sx={{ 
                                  textDecoration: checkedItems.includes(item.id) ? 'line-through' : 'none',
                                  color: checkedItems.includes(item.id) ? 'text.secondary' : 'text.primary',
                                }}
                              >
                                {item.name}
                              </Typography>
                              
                              {item.essential && (
                                <Tooltip title="Essential Item">
                                  <IconButton size="small" sx={{ ml: 1 }}>
                                    <CheckCircle fontSize="small" color="error" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          } 
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No items found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              setSelectedCategory('all');
              setShowEssentialOnly(false);
            }}
          >
            Reset Filters
          </Button>
        </Paper>
      )}
      
      {/* Additional Information */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Emergency Kit Tips
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalFireDepartment color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Storage Tips
                  </Typography>
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemText primary="Store items in airtight plastic bags and put your entire disaster supplies kit in one or two easy-to-carry containers." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Keep the kit in a cool, dry place accessible to everyone in your household." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Consider having emergency supplies in your workplace, vehicle, and other places you spend time." />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WaterDrop color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Maintenance
                  </Typography>
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemText primary="Check expiration dates on food, water, medicine, and batteries at least twice a year." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Replace items that are expired or have been used." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Update your kit as your family's needs change." />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          This emergency kit checklist is provided for informational purposes only and should not replace professional advice or training.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}