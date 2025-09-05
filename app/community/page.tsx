"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  MapPin, 
  Shield, 
  Award, 
  TrendingUp, 
  Star,
  Search,
  Filter,
  Plus,
  User,
  Clock,
  ThumbsUp,
  Share2,
  Flag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  isLiked: boolean;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  reputation: number;
  location: string;
  badges: string[];
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });

  // Mock data initialization
  useEffect(() => {
    // Mock posts data
    const mockPosts: CommunityPost[] = [
      {
        id: "1",
        author: {
          name: "Priya Sharma",
          avatar: "",
          reputation: 1245
        },
        title: "Safe route to Central Station after 9 PM?",
        content: "Has anyone found a well-lit, safe route to Central Station after 9 PM? The usual path through Park Street seems to have poor lighting lately.",
        timestamp: "2 hours ago",
        likes: 24,
        comments: 8,
        tags: ["safety", "routes", "night"],
        isLiked: false
      },
      {
        id: "2",
        author: {
          name: "Rahul Mehta",
          avatar: "",
          reputation: 892
        },
        title: "New street lights installed on MG Road",
        content: "Just wanted to let everyone know that the municipality has installed new LED street lights on MG Road between 5th and 7th cross streets. The area is much better lit now!",
        timestamp: "5 hours ago",
        likes: 42,
        comments: 12,
        tags: ["lighting", "infrastructure", "update"],
        isLiked: true
      },
      {
        id: "3",
        author: {
          name: "Anjali Patel",
          avatar: "",
          reputation: 1567
        },
        title: "Emergency contact sharing feature request",
        content: "It would be great if we could share our emergency contacts with trusted community members for added safety during group travels.",
        timestamp: "1 day ago",
        likes: 18,
        comments: 5,
        tags: ["feature", "emergency", "suggestions"],
        isLiked: false
      }
    ];

    // Mock members data
    const mockMembers: CommunityMember[] = [
      {
        id: "1",
        name: "Priya Sharma",
        avatar: "",
        reputation: 1245,
        location: "Koramangala, Bangalore",
        badges: ["Safety Champion", "Verified Reporter"]
      },
      {
        id: "2",
        name: "Rahul Mehta",
        avatar: "",
        reputation: 892,
        location: "Indiranagar, Bangalore",
        badges: ["Community Helper", "Active Contributor"]
      },
      {
        id: "3",
        name: "Anjali Patel",
        avatar: "",
        reputation: 1567,
        location: "Whitefield, Bangalore",
        badges: ["Safety Expert", "Top Contributor"]
      },
      {
        id: "4",
        name: "Vikram Singh",
        avatar: "",
        reputation: 634,
        location: "HSR Layout, Bangalore",
        badges: ["New Member", "Verified User"]
      }
    ];

    setPosts(mockPosts);
    setMembers(mockMembers);
  }, []);

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          } 
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const post: CommunityPost = {
      id: (posts.length + 1).toString(),
      author: {
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || "Anonymous",
        avatar: "",
        reputation: 0
      },
      title: newPost.title,
      content: newPost.content,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      tags: newPost.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      isLiked: false
    };
    
    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", tags: "" });
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Community Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
                <p className="mt-2 text-gray-600">
                  Connect with other safety-conscious community members
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button onClick={() => document.getElementById("new-post-modal")?.classList.remove("hidden")}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions, members, or topics..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("discussions")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "discussions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Discussions
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "members"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Members
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "leaderboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Award className="h-4 w-4 inline mr-2" />
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "discussions" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Posts */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{post.author.name}</h3>
                            <p className="text-xs text-gray-500">{post.timestamp} • {post.author.reputation} rep</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                      <p className="text-gray-600 mb-4">{post.content}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`flex items-center ${post.isLiked ? 'text-red-600' : 'text-gray-500'}`}
                            onClick={() => handleLikePost(post.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center text-gray-500">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments} Comments
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Clock className="h-4 w-4 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Members</span>
                      <span className="text-sm font-medium">1,248</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discussions</span>
                      <span className="text-sm font-medium">342</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reports Submitted</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Today</span>
                      <span className="text-sm font-medium">156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.slice(0, 3).map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.reputation} rep</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.location}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{member.reputation} Reputation</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.badges.map((badge, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>
                Top contributors based on safety reports, discussions, and community engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        index === 0 ? 'bg-yellow-100' : 
                        index === 1 ? 'bg-gray-100' : 
                        index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <span className={`font-bold text-sm ${
                          index === 0 ? 'text-yellow-800' : 
                          index === 1 ? 'text-gray-800' : 
                          index === 2 ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{member.reputation}</p>
                        <p className="text-sm text-gray-500">Reputation</p>
                      </div>
                      <div className="flex space-x-1">
                        {member.badges.slice(0, 2).map((badge, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {badge}
                          </span>
                        ))}
                        {member.badges.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{member.badges.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Post Modal */}
      <div id="new-post-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => document.getElementById("new-post-modal")?.classList.add("hidden")}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What would you like to discuss?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your thoughts, questions, or information..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., safety, routes, lighting"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => document.getElementById("new-post-modal")?.classList.add("hidden")}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                Post Discussion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}