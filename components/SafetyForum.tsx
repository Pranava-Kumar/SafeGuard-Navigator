/**
 * SafetyForum Component
 * Community discussion platform for safety concerns and information sharing
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  InputAdornment,
  Tooltip,
  Badge,
  Snackbar
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Add,
  ThumbUp,
  ThumbDown,
  Comment,
  Share,
  MoreVert,
  Flag,
  Delete,
  Edit,
  LocationOn,
  AccessTime,
  Visibility,
  Lock,
  Public,
  Send,
  AttachFile,
  Image,
  Close,
  ArrowBack,
  Refresh,
  Warning,
  Security,
  CheckCircle,
  Info
} from '@mui/icons-material';

// Mock data interfaces - would be replaced with actual API data
interface ForumUser {
  id: string;
  name: string;
  avatar?: string;
  reputationScore: number;
  role?: 'admin' | 'moderator' | 'verified' | 'regular';
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: ForumUser;
  createdAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  attachments?: {
    id: string;
    type: 'image' | 'document' | 'link';
    url: string;
    thumbnail?: string;
  }[];
  visibility: 'public' | 'community' | 'private';
  isPinned?: boolean;
  isLocked?: boolean;
  userVote?: 'up' | 'down' | null;
}

interface ForumComment {
  id: string;
  postId: string;
  content: string;
  author: ForumUser;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  parentId?: string;
  replies?: ForumComment[];
  userVote?: 'up' | 'down' | null;
}

interface SafetyForumProps {
  initialCategory?: string;
  initialLocation?: [number, number];
}

const SafetyForum: React.FC<SafetyForumProps> = ({
  initialCategory,
  initialLocation
}) => {
  const router = useRouter();
  
  // State variables
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [category, setCategory] = useState<string>(initialCategory || 'all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showNewPostDialog, setShowNewPostDialog] = useState<boolean>(false);
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    category: initialCategory || 'safety_concern',
    tags: [] as string[],
    location: initialLocation ? {
      latitude: initialLocation[0],
      longitude: initialLocation[1],
      address: ''
    } : undefined,
    visibility: 'public' as 'public' | 'community' | 'private',
    attachments: [] as File[]
  });
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [replyTo, setReplyTo] = useState<ForumComment | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportType, setReportType] = useState<'post' | 'comment'>('post');
  const [reportId, setReportId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Categories for forum posts
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'safety_concern', label: 'Safety Concerns' },
    { value: 'safety_tip', label: 'Safety Tips' },
    { value: 'route_advice', label: 'Route Advice' },
    { value: 'community_alert', label: 'Community Alerts' },
    { value: 'emergency_info', label: 'Emergency Information' },
    { value: 'app_feedback', label: 'App Feedback' }
  ];
  
  // Tags for forum posts
  const availableTags = [
    'night_safety', 'public_transport', 'walking', 'cycling', 'driving',
    'women_safety', 'children_safety', 'senior_safety', 'accessibility',
    'lighting', 'police', 'emergency_services', 'community_watch',
    'infrastructure', 'traffic', 'weather', 'events'
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'upvoted', label: 'Most Upvoted' },
    { value: 'commented', label: 'Most Commented' }
  ];
  
  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check consent first
      if (!consentGiven) {
        try {
          const consentResponse = await fetch('/api/auth/consent');
          if (consentResponse.ok) {
            const consentData = await consentResponse.json();
            if (consentData.consentSettings && consentData.consentSettings.crowdsourcing) {
              setConsentGiven(true);
            } else {
              setShowConsentDialog(true);
              setLoading(false);
              return;
            }
          } else {
            setShowConsentDialog(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          setShowConsentDialog(true);
          setLoading(false);
          return;
        }
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (category && category !== 'all') queryParams.append('category', category);
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('sort', sortBy);
      
      // Fetch posts from API
      const response = await fetch(`/api/forum/posts?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
      setLoading(false);
    }
  };
  
  // Fetch post details and comments
  const fetchPostDetails = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch post details
      const postResponse = await fetch(`/api/forum/posts/${postId}`);
      
      if (!postResponse.ok) {
        throw new Error('Failed to fetch post details');
      }
      
      const postData = await postResponse.json();
      setSelectedPost(postData.post);
      
      // Fetch comments
      const commentsResponse = await fetch(`/api/forum/posts/${postId}/comments`);
      
      if (!commentsResponse.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const commentsData = await commentsResponse.json();
      setComments(commentsData.comments);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching post details:', err);
      setError(err.message || 'Failed to load post details');
      setLoading(false);
    }
  };
  
  // Create new post
  const createPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!newPostData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }
      
      if (!newPostData.content.trim()) {
        setError('Content is required');
        setLoading(false);
        return;
      }
      
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('title', newPostData.title);
      formData.append('content', newPostData.content);
      formData.append('category', newPostData.category);
      formData.append('tags', JSON.stringify(newPostData.tags));
      formData.append('visibility', newPostData.visibility);
      
      if (newPostData.location) {
        formData.append('location', JSON.stringify(newPostData.location));
      }
      
      // Add attachments
      newPostData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      
      // Create post
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const data = await response.json();
      
      // Reset form and close dialog
      setNewPostData({
        title: '',
        content: '',
        category: initialCategory || 'safety_concern',
        tags: [],
        location: initialLocation ? {
          latitude: initialLocation[0],
          longitude: initialLocation[1],
          address: ''
        } : undefined,
        visibility: 'public',
        attachments: []
      });
      
      setShowNewPostDialog(false);
      
      // Refresh posts
      fetchPosts();
      
      // Show success message
      setSnackbarMessage('Post created successfully');
      setSnackbarOpen(true);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
      setLoading(false);
    }
  };
  
  // Add comment
  const addComment = async () => {
    try {
      if (!selectedPost) return;
      if (!newComment.trim()) {
        setError('Comment cannot be empty');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const commentData = {
        content: newComment,
        postId: selectedPost.id,
        parentId: replyTo ? replyTo.id : undefined
      };
      
      // Add comment
      const response = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Reset form
      setNewComment('');
      setReplyTo(null);
      
      // Refresh comments
      fetchPostDetails(selectedPost.id);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Failed to add comment');
      setLoading(false);
    }
  };
  
  // Vote on post
  const voteOnPost = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote on post');
      }
      
      const data = await response.json();
      
      // Update post in state
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          userVote: data.userVote
        });
      }
      
      // Update post in posts list
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                userVote: data.userVote
              }
            : post
        )
      );
    } catch (err: any) {
      console.error('Error voting on post:', err);
      setSnackbarMessage(err.message || 'Failed to vote on post');
      setSnackbarOpen(true);
    }
  };
  
  // Vote on comment
  const voteOnComment = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote on comment');
      }
      
      const data = await response.json();
      
      // Update comment in state
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                userVote: data.userVote,
                replies: comment.replies
                  ? comment.replies.map(reply =>
                      reply.id === commentId
                        ? {
                            ...reply,
                            upvotes: data.upvotes,
                            downvotes: data.downvotes,
                            userVote: data.userVote
                          }
                        : reply
                    )
                  : undefined
              }
            : {
                ...comment,
                replies: comment.replies
                  ? comment.replies.map(reply =>
                      reply.id === commentId
                        ? {
                            ...reply,
                            upvotes: data.upvotes,
                            downvotes: data.downvotes,
                            userVote: data.userVote
                          }
                        : reply
                    )
                  : undefined
              }
        )
      );
    } catch (err: any) {
      console.error('Error voting on comment:', err);
      setSnackbarMessage(err.message || 'Failed to vote on comment');
      setSnackbarOpen(true);
    }
  };
  
  // Report post or comment
  const reportContent = async () => {
    try {
      if (!reportReason.trim()) {
        setError('Please provide a reason for reporting');
        return;
      }
      
      const endpoint = reportType === 'post'
        ? `/api/forum/posts/${reportId}/report`
        : `/api/forum/comments/${reportId}/report`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reportReason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to report content');
      }
      
      // Reset form and close dialog
      setReportReason('');
      setShowReportDialog(false);
      
      // Show success message
      setSnackbarMessage('Content reported successfully');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error reporting content:', err);
      setError(err.message || 'Failed to report content');
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
      
      if (!response.ok) {
        throw new Error('Failed to update consent settings');
      }
      
      setConsentGiven(true);
      setShowConsentDialog(false);
      fetchPosts();
    } catch (err: any) {
      console.error('Error updating consent:', err);
      setError(err.message);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setNewPostData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    setNewPostData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Initialize component
  useEffect(() => {
    // Check if user has already given consent
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/auth/consent');
        if (response.ok) {
          const data = await response.json();
          if (data.consentSettings && data.consentSettings.crowdsourcing) {
            setConsentGiven(true);
          }
        }
      } catch (err) {
        // If error, we'll show consent dialog when needed
      }
    };
    
    checkConsent();
    fetchPosts();
  }, []);
  
  // Update posts when filters change
  useEffect(() => {
    if (consentGiven) {
      fetchPosts();
    }
  }, [category, sortBy, searchQuery, consentGiven]);
  
  // Render post list
  const renderPostList = () => {
    if (loading && posts.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading posts...
          </Typography>
        </Box>
      );
    }
    
    if (error && posts.length === 0) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (posts.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Info sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Be the first to start a discussion
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setShowNewPostDialog(true)}
          >
            Create Post
          </Button>
        </Box>
      );
    }
    
    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            <Paper 
              elevation={1} 
              sx={{ 
                mb: 2, 
                p: 0, 
                borderLeft: post.isPinned ? '4px solid' : 'none',
                borderColor: post.isPinned ? 'primary.main' : 'transparent'
              }}
            >
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => {
                  setSelectedPost(null); // Clear first to trigger re-render
                  fetchPostDetails(post.id);
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar 
                          src={post.author.avatar} 
                          alt={post.author.name}
                          sx={{ width: 32, height: 32 }}
                        >
                          {post.author.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <Typography variant="subtitle2">
                        {post.author.name}
                      </Typography>
                      
                      {post.author.role && (
                        <Chip 
                          label={post.author.role} 
                          size="small" 
                          color={
                            post.author.role === 'admin' ? 'error' :
                            post.author.role === 'moderator' ? 'warning' :
                            post.author.role === 'verified' ? 'success' : 'default'
                          }
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {formatTimestamp(post.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        mb: 1
                      }}
                    >
                      {post.content}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip 
                        label={categories.find(c => c.value === post.category)?.label || post.category} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      
                      {post.tags.slice(0, 3).map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      
                      {post.tags.length > 3 && (
                        <Chip 
                          label={`+${post.tags.length - 3} more`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    {post.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {post.location.address || 'Location attached'}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {post.visibility === 'private' ? (
                        <Lock fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      ) : post.visibility === 'community' ? (
                        <Security fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      ) : (
                        <Public fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)}
                      </Typography>
                      
                      {post.isLocked && (
                        <Chip 
                          label="Locked" 
                          size="small" 
                          color="default"
                          sx={{ height: 20, fontSize: '0.7rem', mr: 1 }}
                        />
                      )}
                      
                      {post.isPinned && (
                        <Chip 
                          label="Pinned" 
                          size="small" 
                          color="primary"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      {post.attachments && post.attachments.length > 0 && (
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: 120, 
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            mb: 2,
                            backgroundImage: post.attachments[0].type === 'image' ? `url(${post.attachments[0].thumbnail || post.attachments[0].url})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {post.attachments[0].type !== 'image' && (
                            <AttachFile sx={{ color: 'text.secondary', fontSize: 40 }} />
                          )}
                          
                          {post.attachments.length > 1 && (
                            <Badge 
                              badgeContent={`+${post.attachments.length - 1}`} 
                              color="primary"
                              sx={{ 
                                position: 'absolute', 
                                bottom: 8, 
                                right: 8,
                                '& .MuiBadge-badge': {
                                  fontSize: '0.8rem',
                                  height: 22,
                                  minWidth: 22
                                }
                              }}
                            />
                          )}
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            color={post.userVote === 'up' ? 'primary' : 'default'}
                            onClick={(e) => {
                              e.stopPropagation();
                              voteOnPost(post.id, 'up');
                            }}
                          >
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 0.5 }}>
                            {post.upvotes}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            color={post.userVote === 'down' ? 'error' : 'default'}
                            onClick={(e) => {
                              e.stopPropagation();
                              voteOnPost(post.id, 'down');
                            }}
                          >
                            <ThumbDown fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 0.5 }}>
                            {post.downvotes}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Comment fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {post.commentCount}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </ListItem>
            </Paper>
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // Render post detail
  const renderPostDetail = () => {
    if (!selectedPost) return null;
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading post details...
          </Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }
    
    return (
      <Box>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => setSelectedPost(null)}
          sx={{ mb: 2 }}
        >
          Back to Posts
        </Button>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={selectedPost.author.avatar} 
                alt={selectedPost.author.name}
                sx={{ width: 40, height: 40, mr: 1 }}
              >
                {selectedPost.author.name.charAt(0)}
              </Avatar>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {selectedPost.author.name}
                  </Typography>
                  
                  {selectedPost.author.role && (
                    <Chip 
                      label={selectedPost.author.role} 
                      size="small" 
                      color={
                        selectedPost.author.role === 'admin' ? 'error' :
                        selectedPost.author.role === 'moderator' ? 'warning' :
                        selectedPost.author.role === 'verified' ? 'success' : 'default'
                      }
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(selectedPost.createdAt)}
                  {selectedPost.updatedAt && selectedPost.updatedAt !== selectedPost.createdAt && (
                    <> · Edited {formatTimestamp(selectedPost.updatedAt)}</>
                  )}
                </Typography>
              </Box>
            </Box>
            
            <IconButton 
              aria-label="more options" 
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => {
                setAnchorEl(null);
                navigator.clipboard.writeText(window.location.href);
                setSnackbarMessage('Link copied to clipboard');
                setSnackbarOpen(true);
              }}>
                <ListItemIcon>
                  <Share fontSize="small" />
                </ListItemIcon>
                <ListItemText>Share</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={() => {
                setAnchorEl(null);
                setReportType('post');
                setReportId(selectedPost.id);
                setShowReportDialog(true);
              }}>
                <ListItemIcon>
                  <Flag fontSize="small" />
                </ListItemIcon>
                <ListItemText>Report</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {selectedPost.title}
          </Typography>
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {selectedPost.content}
          </Typography>
          
          {selectedPost.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {selectedPost.location.address || 
                  `${selectedPost.location.latitude.toFixed(6)}, ${selectedPost.location.longitude.toFixed(6)}`}
              </Typography>
              
              <Button 
                size="small" 
                sx={{ ml: 1 }}
                onClick={() => router.push(`/map?lat=${selectedPost.location?.latitude}&lng=${selectedPost.location?.longitude}`)}
              >
                View on Map
              </Button>
            </Box>
          )}
          
          {selectedPost.attachments && selectedPost.attachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              
              <Grid container spacing={1}>
                {selectedPost.attachments.map((attachment) => (
                  <Grid item xs={6} sm={4} md={3} key={attachment.id}>
                    {attachment.type === 'image' ? (
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 120, 
                          borderRadius: 1,
                          backgroundImage: `url(${attachment.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                    ) : (
                      <Paper 
                        sx={{ 
                          p: 2, 
                          height: 120, 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <AttachFile sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="caption" noWrap sx={{ width: '100%', textAlign: 'center' }}>
                          {attachment.url.split('/').pop()}
                        </Typography>
                      </Paper>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            <Chip 
              label={categories.find(c => c.value === selectedPost.category)?.label || selectedPost.category} 
              size="small" 
              color="primary"
            />
            
            {selectedPost.tags.map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color={selectedPost.userVote === 'up' ? 'primary' : 'default'}
                onClick={() => voteOnPost(selectedPost.id, 'up')}
              >
                <ThumbUp />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 0.5 }}>
                {selectedPost.upvotes}
              </Typography>
              
              <IconButton 
                color={selectedPost.userVote === 'down' ? 'error' : 'default'}
                onClick={() => voteOnPost(selectedPost.id, 'down')}
              >
                <ThumbDown />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 0.5 }}>
                {selectedPost.downvotes}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                startIcon={<Share />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setSnackbarMessage('Link copied to clipboard');
                  setSnackbarOpen(true);
                }}
              >
                Share
              </Button>
              
              <Button 
                startIcon={<Flag />}
                color="error"
                onClick={() => {
                  setReportType('post');
                  setReportId(selectedPost.id);
                  setShowReportDialog(true);
                }}
                sx={{ ml: 1 }}
              >
                Report
              </Button>
            </Box>
          </Box>
        </Paper>
        
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>
        
        {!selectedPost.isLocked && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      color="primary"
                      disabled={!newComment.trim()}
                      onClick={addComment}
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {replyTo && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Replying to {replyTo.author.name}
                </Typography>
                
                <IconButton size="small" onClick={() => setReplyTo(null)}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
        
        {selectedPost.isLocked && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This thread has been locked. No new comments can be added.
          </Alert>
        )}
        
        {comments.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Paper>
        ) : (
          <List>
            {comments.map((comment) => (
              <React.Fragment key={comment.id}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={comment.author.avatar} 
                        alt={comment.author.name}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {comment.author.name.charAt(0)}
                      </Avatar>
                      
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {comment.author.name}
                          </Typography>
                          
                          {comment.author.role && (
                            <Chip 
                              label={comment.author.role} 
                              size="small" 
                              color={
                                comment.author.role === 'admin' ? 'error' :
                                comment.author.role === 'moderator' ? 'warning' :
                                comment.author.role === 'verified' ? 'success' : 'default'
                              }
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(comment.createdAt)}
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <> · Edited {formatTimestamp(comment.updatedAt)}</>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <IconButton 
                      size="small"
                      onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        // Store comment ID for context menu actions
                        (event.currentTarget as any).commentId = comment.id;
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mt: 1, mb: 2, whiteSpace: 'pre-line' }}>
                    {comment.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small"
                        color={comment.userVote === 'up' ? 'primary' : 'default'}
                        onClick={() => voteOnComment(comment.id, 'up')}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 0.5 }}>
                        {comment.upvotes}
                      </Typography>
                      
                      <IconButton 
                        size="small"
                        color={comment.userVote === 'down' ? 'error' : 'default'}
                        onClick={() => voteOnComment(comment.id, 'down')}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 0.5 }}>
                        {comment.downvotes}
                      </Typography>
                    </Box>
                    
                    {!selectedPost.isLocked && (
                      <Button 
                        size="small" 
                        startIcon={<Comment fontSize="small" />}
                        onClick={() => setReplyTo(comment)}
                      >
                        Reply
                      </Button>
                    )}
                  </Box>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <List sx={{ pl: 4, mt: 2 }}>
                      {comment.replies.map((reply) => (
                        <Paper key={reply.id} sx={{ p: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={reply.author.avatar} 
                                alt={reply.author.name}
                                sx={{ width: 24, height: 24, mr: 1 }}
                              >
                                {reply.author.name.charAt(0)}
                              </Avatar>
                              
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" fontSize="0.875rem">
                                    {reply.author.name}
                                  </Typography>
                                  
                                  {reply.author.role && (
                                    <Chip 
                                      label={reply.author.role} 
                                      size="small" 
                                      color={
                                        reply.author.role === 'admin' ? 'error' :
                                        reply.author.role === 'moderator' ? 'warning' :
                                        reply.author.role === 'verified' ? 'success' : 'default'
                                      }
                                      sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                                    />
                                  )}
                                </Box>
                                
                                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                  {formatTimestamp(reply.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <IconButton 
                              size="small"
                              onClick={(event) => {
                                setAnchorEl(event.currentTarget);
                                // Store reply ID for context menu actions
                                (event.currentTarget as any).commentId = reply.id;
                              }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1, mb: 1, whiteSpace: 'pre-line' }}>
                            {reply.content}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              size="small"
                              color={reply.userVote === 'up' ? 'primary' : 'default'}
                              onClick={() => voteOnComment(reply.id, 'up')}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" fontSize="0.75rem" sx={{ mx: 0.5 }}>
                              {reply.upvotes}
                            </Typography>
                            
                            <IconButton 
                              size="small"
                              color={reply.userVote === 'down' ? 'error' : 'default'}
                              onClick={() => voteOnComment(reply.id, 'down')}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" fontSize="0.75rem" sx={{ mx: 0.5 }}>
                              {reply.downvotes}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  )}
                </Paper>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    );
  };
  
  // Render new post dialog
  const renderNewPostDialog = () => {
    return (
      <Dialog
        open={showNewPostDialog}
        onClose={() => setShowNewPostDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Post</DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Title"
            fullWidth
            value={newPostData.title}
            onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={6}
            value={newPostData.content}
            onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
            margin="normal"
            required
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={newPostData.category}
                  onChange={(e) => setNewPostData({ ...newPostData, category: e.target.value })}
                  label="Category"
                >
                  {categories.filter(c => c.value !== 'all').map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                  labelId="visibility-label"
                  value={newPostData.visibility}
                  onChange={(e) => setNewPostData({ 
                    ...newPostData, 
                    visibility: e.target.value as 'public' | 'community' | 'private' 
                  })}
                  label="Visibility"
                >
                  <MenuItem value="public">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Public fontSize="small" sx={{ mr: 1 }} />
                      Public - Visible to everyone
                    </Box>
                  </MenuItem>
                  <MenuItem value="community">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Security fontSize="small" sx={{ mr: 1 }} />
                      Community - Visible to registered users only
                    </Box>
                  </MenuItem>
                  <MenuItem value="private">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lock fontSize="small" sx={{ mr: 1 }} />
                      Private - Visible to moderators and yourself
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Tags
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {availableTags.map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                onClick={() => {
                  if (!newPostData.tags.includes(tag)) {
                    setNewPostData({
                      ...newPostData,
                      tags: [...newPostData.tags, tag]
                    });
                  } else {
                    setNewPostData({
                      ...newPostData,
                      tags: newPostData.tags.filter(t => t !== tag)
                    });
                  }
                }}
                color={newPostData.tags.includes(tag) ? 'primary' : 'default'}
                variant={newPostData.tags.includes(tag) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!newPostData.location}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Get current location if not already set
                      if (!newPostData.location && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setNewPostData({
                              ...newPostData,
                              location: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                address: ''
                              }
                            });
                          },
                          (err) => {
                            console.error('Error getting location:', err);
                            setError('Could not get your location. Please check your browser permissions.');
                          }
                        );
                      } else if (initialLocation) {
                        setNewPostData({
                          ...newPostData,
                          location: {
                            latitude: initialLocation[0],
                            longitude: initialLocation[1],
                            address: ''
                          }
                        });
                      }
                    } else {
                      setNewPostData({
                        ...newPostData,
                        location: undefined
                      });
                    }
                  }}
                />
              }
              label="Attach Location"
            />
            
            {newPostData.location && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {newPostData.location.address || 
                  `${newPostData.location.latitude.toFixed(6)}, ${newPostData.location.longitude.toFixed(6)}`}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AttachFile />}
              onClick={() => fileInputRef.current?.click()}
            >
              Attach Files
            </Button>
            
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            
            {newPostData.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments ({newPostData.attachments.length})
                </Typography>
                
                <List dense>
                  {newPostData.attachments.map((file, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeAttachment(index)}>
                          <Close />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {file.type.startsWith('image/') ? <Image /> : <AttachFile />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={file.name} 
                        secondary={`${(file.size / 1024).toFixed(1)} KB`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowNewPostDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={createPost}
            disabled={loading || !newPostData.title.trim() || !newPostData.content.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render consent dialog
  const renderConsentDialog = () => {
    return (
      <Dialog
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1 }} />
            Consent Required
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            To view and participate in the community forum, we need your consent to process your data in accordance with the Digital Personal Data Protection Act 2023 (DPDP Act).
          </DialogContentText>
          
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            By giving consent, you agree to:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Share your profile information with other community members" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Allow your posts and comments to be visible to other users" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Receive notifications about replies to your posts and comments" />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can withdraw your consent at any time through your profile settings. For more information, please refer to our Privacy Policy.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowConsentDialog(false)}>Decline</Button>
          <Button variant="contained" onClick={handleGiveConsent}>
            Give Consent
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render report dialog
  const renderReportDialog = () => {
    return (
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Flag sx={{ mr: 1 }} />
            Report {reportType === 'post' ? 'Post' : 'Comment'}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            Please let us know why you're reporting this {reportType}. Your report will be reviewed by our moderators.
          </DialogContentText>
          
          <TextField
            label="Reason for reporting"
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={reportContent}
            disabled={!reportReason.trim()}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Consent Dialog */}
      {renderConsentDialog()}
      
      {/* Report Dialog */}
      {renderReportDialog()}
      
      {/* New Post Dialog */}
      {renderNewPostDialog()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Safety Forum
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setShowNewPostDialog(true)}
        >
          Create Post
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Posts" />
          <Tab label="Safety Concerns" />
          <Tab label="Safety Tips" />
          <Tab label="Community Alerts" />
        </Tabs>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {selectedPost ? renderPostDetail() : renderPostList()}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Categories
              </Typography>
              
              <IconButton size="small" onClick={() => setCategory('all')}>
                <Refresh fontSize="small" />
              </IconButton>
            </Box>
            
            <List dense>
              {categories.map((cat) => (
                <ListItem 
                  key={cat.value} 
                  button
                  selected={category === cat.value}
                  onClick={() => setCategory(cat.value)}
                >
                  <ListItemText primary={cat.label} />
                </ListItem>
              ))}
            </List>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Sort By
              </Typography>
              
              <IconButton size="small">
                <Sort fontSize="small" />
              </IconButton>
            </Box>
            
            <List dense>
              {sortOptions.map((option) => (
                <ListItem 
                  key={option.value} 
                  button
                  selected={sortBy === option.value}
                  onClick={() => setSortBy(option.value)}
                >
                  <ListItemText primary={option.label} />
                </ListItem>
              ))}
            </List>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Forum Guidelines
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Be respectful and considerate" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Share accurate safety information" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Respect privacy and confidentiality" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Report inappropriate content" />
              </ListItem>
            </List>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Posts and comments that violate these guidelines may be removed by moderators.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SafetyForum;