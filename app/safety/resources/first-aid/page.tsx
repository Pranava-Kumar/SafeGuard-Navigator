/**
 * First Aid Basics Page
 * Provides essential first aid information and techniques
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
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Warning, 
  Search, 
  ExpandMore,
  ArrowBack,
  Print,
  Share,
  Bookmark,
  BookmarkBorder,
  LocalHospital,
  Healing,
  Favorite,
  DirectionsCar,
  Whatshot,
  WbSunny,
  AcUnit,
  Waves,
  Pets,
  BugReport,
  Info,
  CheckCircle
} from '@mui/icons-material';
import Link from 'next/link';

// Interface for first aid technique
interface FirstAidTechnique {
  id: string;
  title: string;
  category: string;
  steps: string[];
  warnings: string[];
  imageUrl?: string;
  videoUrl?: string;
}

// First aid categories
const categories = [
  { id: 'basics', label: 'Basics', icon: <LocalHospital /> },
  { id: 'wounds', label: 'Cuts & Wounds', icon: <Healing /> },
  { id: 'cardiac', label: 'Cardiac', icon: <Favorite /> },
  { id: 'accidents', label: 'Accidents', icon: <DirectionsCar /> },
  { id: 'burns', label: 'Burns', icon: <Whatshot /> },
  { id: 'heatstroke', label: 'Heat Emergencies', icon: <WbSunny /> },
  { id: 'hypothermia', label: 'Cold Emergencies', icon: <AcUnit /> },
  { id: 'drowning', label: 'Drowning', icon: <Waves /> },
  { id: 'bites', label: 'Bites & Stings', icon: <BugReport /> },
  { id: 'pet', label: 'Pet First Aid', icon: <Pets /> },
];

// Sample first aid techniques
const firstAidTechniques: FirstAidTechnique[] = [
  {
    id: 'cpr-adult',
    title: 'CPR for Adults',
    category: 'cardiac',
    steps: [
      'Check the scene for safety and the person for responsiveness.',
      'If the person is unresponsive, call emergency services (112) or ask someone else to call.',
      'Place the person on their back on a firm, flat surface.',
      "Kneel beside the person's chest.",
      'Place the heel of one hand on the center of the chest (over the lower half of the sternum).',
      'Place your other hand on top of the first hand and interlock your fingers.',
      'Position your shoulders directly over your hands, keeping your arms straight.',
      'Push hard and fast: Compress the chest at least 2 inches (5 cm) deep at a rate of 100-120 compressions per minute.',
      'Allow the chest to completely recoil after each compression.',
      'Minimize interruptions in compressions.',
      'Continue CPR until emergency services arrive or the person shows signs of life.',
    ],
    warnings: [
      "CPR can cause rib fractures or other injuries, but it's necessary to save a life.",
      "If you're untrained, perform hands-only CPR (compression only, no rescue breaths).",
      "If you're trained and confident, you can provide rescue breaths (30 compressions followed by 2 breaths).",
    ],
    imageUrl: '/images/cpr-adult.svg',
  },
  {
    id: 'bleeding-control',
    title: 'Severe Bleeding Control',
    category: 'wounds',
    steps: [
      'Ensure your safety first (wear gloves if available).',
      'Expose the wound by removing or cutting clothing if necessary.',
      'Apply direct pressure using a clean cloth, gauze pad, or your hand if nothing else is available.',
      'Press firmly on the wound until bleeding stops.',
      'If blood soaks through, add more gauze or cloth without removing the first layer.',
      'If possible, elevate the injured area above the level of the heart.',
      'Once bleeding is controlled, secure the dressing with a bandage or tape.',
      'Seek medical attention immediately.',
    ],
    warnings: [
      'Do not remove large objects embedded in a wound; stabilize them and seek medical help.',
      "For life-threatening bleeding from an arm or leg where direct pressure isn't working, a tourniquet may be necessary if you're trained to use one.",
      'Always wash your hands before and after treating someone who is bleeding.',
    ],
    imageUrl: '/images/bleeding-control.svg',
  },
  {
    id: 'choking-adult',
    title: 'Choking Relief for Adults',
    category: 'basics',
    steps: [
      'Ask the person if they are choking. If they can speak, cough, or breathe, do not interfere.',
      'If the person cannot speak, cough, or breathe, or makes high-pitched noises, act quickly.',
      'Stand behind the person and wrap your arms around their waist.',
      "Make a fist with one hand and place it thumb-side against the middle of the person's abdomen, just above the navel.",
      'Grasp your fist with your other hand.',
      'Press into the abdomen with quick, upward thrusts.',
      'Repeat thrusts until the object is expelled or the person becomes unconscious.',
      'If the person becomes unconscious, lower them to the ground and begin CPR, starting with chest compressions.',
      'Continue until help arrives.',
    ],
    warnings: [
      'Do not perform abdominal thrusts on pregnant women or obese individuals; instead, perform chest thrusts.',
      "If you're alone and choking, perform abdominal thrusts on yourself using your hands or by pressing your abdomen against a firm object like the back of a chair.",
      'Always seek medical attention after a choking incident, even if it seems resolved.',
    ],
    imageUrl: '/images/choking-adult.svg',
  },
  {
    id: 'burn-treatment',
    title: 'Burn Treatment',
    category: 'burns',
    steps: [
      'Ensure the scene is safe and the burning has stopped.',
      'Remove jewelry, belts, and tight clothing from the burned area before swelling begins.',
      'For minor burns (redness, mild swelling): Cool the burn with cool (not cold) running water for 10-15 minutes.',
      'Cover the burn with a clean, non-stick bandage or cloth.',
      'For major burns (deep, charred, large area): Call emergency services immediately.',
      'Do not immerse large severe burns in water as it can cause hypothermia.',
      'Cover the area with a clean, dry cloth or sheet until help arrives.',
      'Elevate the burned area above heart level if possible.',
      'Monitor for signs of shock (pale skin, weakness, rapid pulse) and treat accordingly.',
    ],
    warnings: [
      'Never apply ice, butter, ointments, or other home remedies to burns.',
      'Do not break blisters as this increases risk of infection.',
      'Do not remove clothing that is stuck to burned skin.',
      'Seek medical attention for chemical or electrical burns, burns on the face, hands, feet, genitals, or major joints, and any burn larger than 3 inches in diameter.',
    ],
    imageUrl: '/images/burn-treatment.svg',
  },
  {
    id: 'fracture-care',
    title: 'Fracture Care',
    category: 'accidents',
    steps: [
      'Keep the injured person still and calm.',
      'If the person is bleeding, apply pressure to the wound with a clean cloth.',
      'Immobilize the injured area in the position you found it.',
      'For open fractures (bone protruding through skin), do not push the bone back in.',
      'Apply a splint to the area above and below the fracture site.',
      'Use rigid materials (boards, rolled magazines) padded with cloth for splints.',
      'Secure the splint with bandages, cloth strips, or tape.',
      'Apply ice packs wrapped in cloth to reduce swelling and pain.',
      'Seek medical attention immediately.',
    ],
    warnings: [
      'Do not move the person unless absolutely necessary, especially if you suspect a spinal injury.',
      'Do not attempt to straighten a broken bone or push a protruding bone back in.',
      'Do not allow the injured person to eat or drink, as surgery may be needed.',
      'Check circulation beyond the injury (pulse, skin color, temperature) after applying a splint.',
    ],
    imageUrl: '/images/fracture-care.svg',
  },
  {
    id: 'snake-bite',
    title: 'Snake Bite First Aid',
    category: 'bites',
    steps: [
      "Move the person away from the snake's striking distance.",
      'Keep the bitten area below the level of the heart if possible.',
      'Remove any jewelry or tight clothing near the bite site before swelling occurs.',
      'Clean the wound with soap and water if available.',
      'Cover the bite with a clean, dry dressing.',
      'Mark the edge of the swelling on the skin with a pen, if available, and note the time.',
      'Keep the person calm and still to slow the spread of venom.',
      'Seek emergency medical help immediately.',
      'If possible, describe the snake to medical personnel or take a photo from a safe distance.',
    ],
    warnings: [
      'Do NOT cut the wound or attempt to suck out the venom.',
      'Do NOT apply a tourniquet or ice to the bite.',
      'Do NOT give the person alcohol or medications.',
      'Do NOT attempt to capture or kill the snake.',
      'Do NOT delay seeking medical attention, even if the bite seems minor.',
    ],
    imageUrl: '/images/snake-bite.svg',
  },
  {
    id: 'heatstroke',
    title: 'Heatstroke Treatment',
    category: 'heatstroke',
    steps: [
      'Call emergency services immediately.',
      'Move the person to a cooler place, preferably air-conditioned.',
      'Remove excess clothing.',
      'Cool the person rapidly using whatever methods available: place in a cool bath, spray with cool water, apply ice packs to armpits, groin, neck, and back.',
      'Fan air over the person while wetting their skin with water.',
      'Monitor body temperature and continue cooling efforts until temperature drops to 101-102°F (38.3-38.9°C).',
      'If emergency response is delayed, call the hospital emergency room for additional instructions.',
    ],
    warnings: [
      'Heatstroke is a life-threatening emergency requiring immediate treatment.',
      'Do not give the person anything to drink if they are unconscious or confused.',
      'Do not use alcohol for cooling.',
      'Do not delay cooling while waiting for emergency services to arrive.',
      'Certain medications and health conditions can increase susceptibility to heatstroke.',
    ],
    imageUrl: '/images/heatstroke.svg',
  },
  {
    id: 'hypothermia',
    title: 'Hypothermia First Aid',
    category: 'hypothermia',
    steps: [
      'Call emergency services immediately.',
      'Move the person out of the cold, if possible.',
      'Remove wet clothing and replace with warm, dry coats or blankets.',
      'If further warming is needed, use your own body heat by lying next to the person and covering both of you with blankets.',
      'Apply warm, dry compresses to the center of the body—neck, chest, and groin.',
      'If the person is conscious, offer warm, sweet, non-alcoholic drinks.',
      'Monitor breathing and circulation; begin CPR if necessary.',
      'Handle the person gently and minimize movement.',
    ],
    warnings: [
      'Do not rewarm the person too quickly using hot water or heat lamps.',
      "Do not massage or rub the person's limbs.",
      'Do not give alcoholic beverages.',
      'Do not attempt to warm someone with severe hypothermia who appears to be unconscious or not breathing—get emergency help immediately.',
      'Even if a person appears dead from hypothermia, CPR should be provided until medical help arrives.',
    ],
    imageUrl: '/images/hypothermia.svg',
  },
  {
    id: 'drowning',
    title: 'Drowning Response',
    category: 'drowning',
    steps: [
      'Ensure your own safety first. Do not attempt a rescue beyond your capabilities.',
      'Call emergency services immediately.',
      'If possible, reach out to the person from land with an object they can grab, or throw a floating device.',
      'If you must enter the water, bring a flotation device for yourself and the victim.',
      'Once the person is on land, check for breathing and pulse.',
      'If not breathing, begin CPR immediately.',
      'If breathing, place the person in the recovery position (on their side with the head tilted back slightly).',
      'Remove wet clothes and cover with warm, dry blankets.',
      'Even if the person seems fine, ensure they receive medical attention.',
    ],
    warnings: [
      'All drowning victims need medical attention, even if they seem fine initially.',
      'Secondary drowning can occur hours after water exposure.',
      'Do not waste time trying to drain water from the lungs before starting CPR.',
      'Do not leave a rescued person alone, as their condition can deteriorate rapidly.',
      'Spinal injuries should be suspected if the person was diving or involved in a water accident.',
    ],
    imageUrl: '/images/drowning-response.svg',
  },
  {
    id: 'pet-cpr',
    title: 'CPR for Dogs and Cats',
    category: 'pet',
    steps: [
      'Check for responsiveness and breathing.',
      'If not breathing, place the animal on their right side on a firm, flat surface.',
      'For dogs: If no breathing or pulse, begin chest compressions by placing your hands over the widest part of the chest and compress 1-3 inches deep depending on the size of the dog.',
      'For cats and small dogs: Hold the chest with one hand, placing your thumb on one side and fingers on the other, and compress 1-1.5 inches deep.',
      'Compression rate should be 100-120 per minute.',
      "After 30 compressions, give 2 rescue breaths by closing the animal's mouth and breathing into their nose until you see the chest rise.",
      'Continue cycles of 30 compressions and 2 breaths.',
      'Perform CPR until the animal responds or you reach veterinary care.',
    ],
    warnings: [
      'Be cautious with injured animals as they may bite or scratch out of fear or pain.',
      'If you suspect a spinal injury, minimize movement of the head and neck.',
      'CPR should only be performed on unconscious animals.',
      'Even if successful, the animal needs immediate veterinary care.',
      'Different sized animals require different compression depths and techniques.',
    ],
    imageUrl: '/images/pet-cpr.svg',
  },
];

export default function FirstAidBasicsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTechnique, setSelectedTechnique] = useState<FirstAidTechnique | null>(null);
  const [savedTechniques, setSavedTechniques] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Load saved techniques from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('savedFirstAidTechniques');
    if (saved) {
      try {
        setSavedTechniques(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved techniques:', error);
      }
    }
  }, []);
  
  // Filter techniques based on search query and selected category
  const filteredTechniques = firstAidTechniques.filter((technique) => {
    const matchesSearch = technique.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technique.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || technique.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Toggle save technique
  const toggleSaveTechnique = (id: string) => {
    let updatedSaved;
    if (savedTechniques.includes(id)) {
      updatedSaved = savedTechniques.filter(techId => techId !== id);
    } else {
      updatedSaved = [...savedTechniques, id];
    }
    
    setSavedTechniques(updatedSaved);
    localStorage.setItem('savedFirstAidTechniques', JSON.stringify(updatedSaved));
  };
  
  // Get saved techniques
  const getSavedTechniques = () => {
    return firstAidTechniques.filter(technique => savedTechniques.includes(technique.id));
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Print current technique
  const printTechnique = () => {
    if (!selectedTechnique) return;
    
    const printContent = `
      <html>
        <head>
          <title>${selectedTechnique.title} - First Aid Guide</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #d32f2f; }
            h2 { color: #666; }
            .warning { color: #d32f2f; }
            ol li { margin-bottom: 10px; }
            ul li { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>${selectedTechnique.title}</h1>
          <h2>Steps:</h2>
          <ol>
            ${selectedTechnique.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
          <h2>Warnings:</h2>
          <ul>
            ${selectedTechnique.warnings.map(warning => `<li class="warning">${warning}</li>`).join('')}
          </ul>
          <p><strong>Remember:</strong> In case of emergency, call 112.</p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  
  // Share technique
  const shareTechnique = () => {
    if (!selectedTechnique) return;
    
    if (navigator.share) {
      navigator.share({
        title: `${selectedTechnique.title} - First Aid Guide`,
        text: `First Aid Technique: ${selectedTechnique.title}`,
        url: window.location.href,
      });
    } else {
      alert('Web Share API not supported in your browser');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          href="/safety/resources/emergency-kit"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Emergency Kit
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          First Aid Basics
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Learn essential first aid techniques to help in emergency situations. Remember that these guidelines are not a substitute for professional medical training.
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
              In case of emergency, call the national emergency number immediately. First aid is not a substitute for professional medical care.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Techniques" />
          <Tab label="Saved Techniques" />
          {selectedTechnique && <Tab label={selectedTechnique.title} />}
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      <Box>
        {/* All Techniques Tab */}
        {tabValue === 0 && (
          <Box>
            {/* Search and Filter */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs:12, md:6 }}>
                  <TextField
                    fullWidth
                    placeholder="Search first aid techniques..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs:12, md:6 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label="All"
                      onClick={() => setSelectedCategory('all')}
                      color={selectedCategory === 'all' ? 'primary' : 'default'}
                      sx={{ m: 0.5 }}
                    />
                    
                    {categories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.label}
                        icon={category.icon}
                        onClick={() => setSelectedCategory(category.id)}
                        color={selectedCategory === category.id ? 'primary' : 'default'}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            {/* Techniques Grid */}
            <Grid container spacing={3}>
              {filteredTechniques.length > 0 ? (
                filteredTechniques.map((technique) => (
                  <Grid size={{ xs:12, md:6 }}  key={technique.id}>
                    <Card>
                      <CardActionArea onClick={() => {
                        setSelectedTechnique(technique);
                        setTabValue(2);
                      }}>
                        {technique.imageUrl && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={technique.imageUrl}
                            alt={technique.title}
                            sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                          />
                        )}
                        
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="div" gutterBottom>
                              {technique.title}
                            </Typography>
                            
                            <IconButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveTechnique(technique.id);
                              }}
                              color="primary"
                              size="small"
                            >
                              {savedTechniques.includes(technique.id) ? <Bookmark /> : <BookmarkBorder />}
                            </IconButton>
                          </Box>
                          
                          <Chip 
                            size="small" 
                            label={categories.find(c => c.id === technique.category)?.label || technique.category}
                            icon={categories.find(c => c.id === technique.category)?.icon}
                            sx={{ mb: 1 }}
                          />
                          
                          <Typography variant="body2" color="text.secondary">
                            {technique.steps[0]}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs:12 }}>
                  <Alert severity="info">
                    No first aid techniques found matching your search criteria.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        
        {/* Saved Techniques Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Saved Techniques
            </Typography>
            
            <Grid container spacing={3}>
              {getSavedTechniques().length > 0 ? (
                getSavedTechniques().map((technique) => (
                  <Grid size={{ xs:12,sm:6, md:4 }} key={technique.id}>
                    <Card>
                      <CardActionArea onClick={() => {
                        setSelectedTechnique(technique);
                        setTabValue(2);
                      }}>
                        {technique.imageUrl && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={technique.imageUrl}
                            alt={technique.title}
                            sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                          />
                        )}
                        
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="div" gutterBottom>
                              {technique.title}
                            </Typography>
                            
                            <IconButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveTechnique(technique.id);
                              }}
                              color="primary"
                              size="small"
                            >
                              <Bookmark />
                            </IconButton>
                          </Box>
                          
                          <Chip 
                            size="small" 
                            label={categories.find(c => c.id === technique.category)?.label || technique.category}
                            icon={categories.find(c => c.id === technique.category)?.icon}
                            sx={{ mb: 1 }}
                          />
                          
                          <Typography variant="body2" color="text.secondary">
                            {technique.steps[0]}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs:12 }}>
                  <Alert severity="info">
                    You haven't saved any first aid techniques yet. Browse the techniques and click the bookmark icon to save them for quick access.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        
        {/* Technique Detail Tab */}
        {tabValue === 2 && selectedTechnique && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {selectedTechnique.title}
                </Typography>
                
                <Box>
                  <Tooltip title="Save Technique">
                    <IconButton 
                      onClick={() => toggleSaveTechnique(selectedTechnique.id)}
                      color="primary"
                    >
                      {savedTechniques.includes(selectedTechnique.id) ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Print Technique">
                    <IconButton onClick={printTechnique}>
                      <Print />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Share Technique">
                    <IconButton onClick={shareTechnique}>
                      <Share />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Chip 
                label={categories.find(c => c.id === selectedTechnique.category)?.label || selectedTechnique.category}
                icon={categories.find(c => c.id === selectedTechnique.category)?.icon}
                sx={{ mb: 3 }}
              />
              
              {selectedTechnique.imageUrl && (
                <Box 
                  component="img"
                  src={selectedTechnique.imageUrl}
                  alt={selectedTechnique.title}
                  sx={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    maxHeight: 300, 
                    display: 'block', 
                    mx: 'auto',
                    mb: 3,
                    objectFit: 'contain',
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                  }}
                />
              )}
              
              <Typography variant="h6" gutterBottom>
                Steps:
              </Typography>
              
              <List>
                {selectedTechnique.steps.map((step, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {index + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
              
              <Alert severity="warning" sx={{ mt: 3 }}>
                <AlertTitle>Important Warnings</AlertTitle>
                <List dense disablePadding>
                  {selectedTechnique.warnings.map((warning, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
              
              {selectedTechnique.videoUrl && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Instructional Video:
                  </Typography>
                  <Box 
                    component="iframe"
                    src={selectedTechnique.videoUrl}
                    width="100%"
                    height="315"
                    sx={{ border: 0, borderRadius: 1 }}
                    allowFullScreen
                  />
                </Box>
              )}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBack />}
                onClick={() => setTabValue(0)}
              >
                Back to All Techniques
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => toggleSaveTechnique(selectedTechnique.id)}
                startIcon={savedTechniques.includes(selectedTechnique.id) ? <Bookmark /> : <BookmarkBorder />}
              >
                {savedTechniques.includes(selectedTechnique.id) ? 'Saved' : 'Save Technique'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Additional Resources */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Additional Resources
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid size={{ xs:12, sm:6,  md:4 }}>
            <Card>
              <CardActionArea component={Link} href="/safety/resources/emergency-kit">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Emergency Kit Checklist
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prepare an emergency kit with essential supplies for various emergency situations.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid size={{ xs:12, sm:6,  md:4 }}>
            <Card>
              <CardActionArea component={Link} href="/safety/resources/family-plan">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Family Emergency Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a comprehensive emergency plan for your family to use in case of emergency.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid size={{ xs:12, sm:6,  md:4 }}>
            <Card>
              <CardActionArea component={Link} href="/emergency">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Emergency Services
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find nearby emergency services and manage your emergency contacts.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          This first aid guide is provided for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}