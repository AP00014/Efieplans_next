import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../hooks/useTheme";
import type {
  Profile,
  PostWithProfile,
  SupabaseComment,
  ContactMessage,
  EmailSubscription,
  Project,
} from "../../types/index";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Menu,
  X,
  Shield,
  Upload,
  Plus,
  Tag,
  Image,
  Video,
  LogOut,
  Home,
  Search,
  Sun,
  Moon,
  Send,
  Building2,
  FolderKanban,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  Ruler,
  Wrench,
  Star,
  Images,
  File,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import "./AdminPage.css";

interface UserActivity {
  username: string;
  created_at: string;
}

interface PostActivity {
  title: string;
  created_at: string;
  user_id: string;
}

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  recentUsers: UserActivity[];
  recentPosts: PostActivity[];
}

const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, role, created_at, updated_at")
        .eq("id", user.id)
        .single();

      if (!profileData || profileData.role !== "admin") {
        router.push("/");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create-post", label: "Create Post", icon: FileText },
    { id: "posts", label: "Post Management", icon: FileText },
    { id: "create-project", label: "Create Project", icon: Building2 },
    { id: "manage-projects", label: "Manage Projects", icon: FolderKanban },
    { id: "users", label: "User Management", icon: Users },
    { id: "contact-messages", label: "Contacts", icon: FileText },
    { id: "email-subscriptions", label: "Subscriptions", icon: Users },
    { id: "send-newsletter", label: "Send Newsletter", icon: Send },
    { id: "home", label: "Homepage", icon: Home },
    { id: "blogpage", label: "Blogpage", icon: FileText },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "create-post":
        return <CreatePostContent />;
      case "posts":
        return <PostManagement />;
      case "create-project":
        return <CreateProjectContent />;
      case "manage-projects":
        return <ManageProjectsContent />;
      case "users":
        return <UserManagement />;
      case "contact-messages":
        return <ContactMessagesManagement />;
      case "email-subscriptions":
        return <EmailSubscriptionsManagement />;
      case "send-newsletter":
        return <SendNewsletterContent />;
      default:
        return <DashboardContent />;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : ""} ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <div className="sidebar-header">
          <Shield size={32} className="admin-icon" />
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => {
                  if (item.id === "home") {
                    router.push("/");
                  } else if (item.id === "blogpage") {
                    router.push("/blog");
                  } else {
                    setActiveSection(item.id);
                  }
                  setSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>Logged in as: {profile?.username}</p>
          <div className="sidebar-controls">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
              style={{
                background: isDarkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(255, 255, 255, 0.9)",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid rgba(0, 123, 255, 0.2)",
                color: isDarkMode ? "#FFFFFF" : "#4a5568",
              }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-content">{renderContent()}</div>
      </main>
    </div>
  );
};

// Create Post Component
const CreatePostContent: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as string[],
    videos: [] as string[],
    tags: [] as string[],
    category: "" as string,
  });
  const [tagInput, setTagInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && formData.images.length < 4) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
      }));
      setImageUrlInput("");
    } else if (formData.images.length >= 4) {
      alert("Maximum 4 images allowed");
    }
  };

  const addVideoUrl = () => {
    if (videoUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoUrlInput.trim()],
      }));
      setVideoUrlInput("");
    }
  };

  const validateFile = (file: File, type: "image" | "video"): boolean => {
    const allowedTypes =
      type === "image"
        ? ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        : ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"];

    if (!allowedTypes.includes(file.type)) {
      alert(`Please select a valid ${type} file (${allowedTypes.join(", ")})`);
      return false;
    }

    return true;
  };

  const uploadFileToSupabase = async (
    file: File,
    type: "image" | "video"
  ): Promise<string> => {
    // Check authentication before uploading
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to upload files");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `posts/${type}s/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("storage")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("storage").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (files: FileList, type: "image" | "video") => {
    // Check authentication before uploading
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to upload files");
      return;
    }

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validateFile(file, type)) continue;

      try {
        console.log(
          `Starting upload of ${file.name} (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB)`
        );
        const publicUrl = await uploadFileToSupabase(file, type);
        console.log(`Upload successful for ${file.name}`);

        if (type === "image") {
          if (formData.images.length < 4) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, publicUrl],
            }));
          } else {
            alert("Maximum 4 images allowed");
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            videos: [...(prev.videos || []), publicUrl],
          }));
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert(
          `Failed to upload ${file.name}. Please try again or contact support if the issue persists.`
        );
      }
    }

    // Clear file input after successful upload to allow uploading again
    const fileInput = document.getElementById(
      type === "image" ? "image-upload" : "video-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Submitting post with data:", {
        title: formData.title,
        content: formData.content,
        images: formData.images,
        videos: formData.videos,
        tags: formData.tags,
        category: formData.category,
      });

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        image_url:
          formData.images.length > 0 ? JSON.stringify(formData.images) : null,
        video_url:
          formData.videos.length > 0 ? JSON.stringify(formData.videos) : null,
        tags: formData.tags,
        category: formData.category,
      });

      if (error) throw error;

      alert("Post created successfully!");
      setFormData({
        title: "",
        content: "",
        images: [],
        videos: [],
        tags: [],
        category: "",
      });
      setImageUrlInput("");
      setVideoUrlInput("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Create New Post</h1>
        <p>Share your thoughts and media with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Post Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter an engaging title..."
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your post content here..."
                required
                rows={8}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                required
                className="form-input"
              >
                <option value="">Select a category</option>
                <option value="architectural design">
                  Architectural Design
                </option>
                <option value="construction">Construction</option>
                <option value="interior design">Interior Design</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-group">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="form-input"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <button type="button" onClick={addTag} className="add-tag-btn">
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <div className="tags-display">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <Tag size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Media Upload</label>

              <div className="media-upload-section">
                <div className="upload-group">
                  <label className="upload-label">
                    <Image size={20} />
                    Images ({formData.images.length}/4)
                  </label>

                  <div className="url-input-group">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Enter image URL..."
                      className="form-input"
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addImageUrl())
                      }
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="add-url-btn"
                    >
                      Add Image
                    </button>
                  </div>

                  <div className="url-input-group">
                    <label
                      htmlFor="image-upload"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          e.target.files &&
                          handleFileUpload(e.target.files, "image")
                        }
                        className="form-input"
                        id="image-upload"
                        style={{ padding: "0.5rem", flex: 1 }}
                      />
                    </label>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#666",
                        marginTop: "0.25rem",
                      }}
                    >
                      Max 4 images, unlimited file size
                    </span>
                  </div>

                  {formData.images.map((image: string, index: number) => (
                    <div key={index} className="media-preview">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.add(
                            "error"
                          );
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.display = "block";
                        }}
                      />
                      <div className="image-error" style={{ display: "none" }}>
                        Failed to load image
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter(
                              (_: string, i: number) => i !== index
                            ),
                          }));
                          // Reset file input to allow uploading the same file again
                          const fileInput = document.getElementById(
                            "image-upload"
                          ) as HTMLInputElement;
                          if (fileInput) {
                            fileInput.value = "";
                          }
                        }}
                        className="remove-media"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="upload-group">
                  <label className="upload-label">
                    <Video size={20} />
                    Video
                  </label>

                  <div className="url-input-group">
                    <input
                      type="url"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="Enter video URL..."
                      className="form-input"
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addVideoUrl())
                      }
                    />
                    <button
                      type="button"
                      onClick={addVideoUrl}
                      className="add-url-btn"
                    >
                      Add Video
                    </button>
                  </div>

                  <div className="url-input-group">
                    <label
                      htmlFor="video-upload"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          e.target.files &&
                          handleFileUpload(e.target.files, "video")
                        }
                        className="form-input"
                        id="video-upload"
                        style={{ padding: "0.5rem", flex: 1 }}
                      />
                    </label>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#666",
                        marginTop: "0.25rem",
                      }}
                    >
                      Unlimited file size
                    </span>
                  </div>

                  {formData.videos &&
                    formData.videos.length > 0 &&
                    formData.videos.map((video: string, index: number) => (
                      <div key={index} className="media-preview">
                        <video src={video} className="preview-video" controls />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              videos: prev.videos.filter(
                                (_: string, i: number) => i !== index
                              ),
                            }));
                            // Reset file input to allow uploading the same file again
                            const fileInput = document.getElementById(
                              "video-upload"
                            ) as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = "";
                            }
                          }}
                          className="remove-media"
                          title="Remove video"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Creating Post...
              </>
            ) : (
              <>
                <Upload size={16} />
                Create Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Dashboard Component
const DashboardContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    recentUsers: [],
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel for better performance
        const [
          totalUsersResult,
          totalAdminsResult,
          totalPostsResult,
          totalLikesResult,
          totalCommentsResult,
          recentUsersResult,
          recentPostsResult,
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "admin"),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("likes").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }),
          supabase
            .from("profiles")
            .select("username, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("posts")
            .select("title, created_at, user_id")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalUsers: totalUsersResult.count || 0,
          totalAdmins: totalAdminsResult.count || 0,
          totalPosts: totalPostsResult.count || 0,
          totalLikes: totalLikesResult.count || 0,
          totalComments: totalCommentsResult.count || 0,
          recentUsers: recentUsersResult.data || [],
          recentPosts: recentPostsResult.data || [],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Dashboard Overview</h1>
        <p>Monitor your platform's performance and user activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admins">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3>Administrators</h3>
            <p className="stat-value">{stats.totalAdmins}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon posts">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Posts</h3>
            <p className="stat-value">{stats.totalPosts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon likes">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Likes</h3>
            <p className="stat-value">{stats.totalLikes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon comments">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Comments</h3>
            <p className="stat-value">{stats.totalComments}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-activity">
          <h2>Recent Users</h2>
          <div className="activity-list">
            {stats.recentUsers.map((user, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <Users size={16} />
                </div>
                <div className="activity-content">
                  <p>{user.username} joined</p>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Posts</h2>
          <div className="activity-list">
            {stats.recentPosts.map((post, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <FileText size={16} />
                </div>
                <div className="activity-content">
                  <p>{post.title}</p>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const banUser = async (userId: string, ban: boolean) => {
    const action = ban ? "ban" : "unban";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );
    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: ban,
          banned_at: ban ? new Date().toISOString() : null,
          ban_reason: ban ? "Banned by admin" : null,
        })
        .eq("id", userId);

      if (error) throw error;

      alert(`User ${action}ned successfully`);
      fetchUsers(); // Refresh the list
      // Force re-render by updating state
      setUsers((prev) => [...prev]);
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      alert(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>User Management</h1>
        <p>Manage user accounts and permissions</p>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="stats-summary">
          <span>Total Users: {users.length}</span>
          <span>Admins: {users.filter((u) => u.role === "admin").length}</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="data-table-container desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.full_name || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>
                  <select
                    value={user.role || "user"}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`action-btn ${user.is_banned ? "unban" : "ban"}`}
                    onClick={() => banUser(user.id, !user.is_banned)}
                    disabled={user.role === "admin"} // Prevent banning other admins
                  >
                    {user.is_banned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-view">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar-large">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} />
                ) : (
                  <div className="default-avatar-large">👤</div>
                )}
              </div>
              <div className="user-card-info">
                <h3 className="user-card-username">{user.username}</h3>
                <p className="user-card-name">
                  {user.full_name || "No full name"}
                </p>
                <div className="user-role-badge">
                  <span className={`role-badge ${user.role || "user"}`}>
                    {user.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-card-details">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {user.email || "Not provided"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span
                  className={`detail-value ${
                    user.is_banned ? "banned" : "active"
                  }`}
                >
                  {user.is_banned ? "Banned" : "Active"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Bio:</span>
                <span className="detail-value">
                  {user.bio || "No bio available"}
                </span>
              </div>
            </div>

            <div className="user-card-actions">
              <div className="role-selector-mobile">
                <label>Role:</label>
                <select
                  value={user.role || "user"}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  className="role-select-mobile"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                className={`action-btn ${
                  user.is_banned ? "unban-mobile" : "ban-mobile"
                }`}
                onClick={() => banUser(user.id, !user.is_banned)}
                disabled={user.role === "admin"}
              >
                {user.is_banned ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Post Management Component
const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [modalPost, setModalPost] = useState<PostWithProfile | null>(null);

  interface LikeWithProfile {
    user_id: string;
    profiles: {
      username: string;
      full_name?: string;
      avatar_url?: string;
    } | null;
  }

  interface CommentWithProfile extends SupabaseComment {
    profiles: {
      username: string;
      full_name?: string;
      avatar_url?: string;
    } | null;
  }

  const [likesUsers, setLikesUsers] = useState<LikeWithProfile[]>([]);
  const [commentsData, setCommentsData] = useState<CommentWithProfile[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-refresh posts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles: user_id (username, full_name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(50); // Limit to 50 posts for admin view

      if (error) throw error;

      // Fetch likes and comments count in parallel for better performance
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
            supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
          ]);

          return {
            ...post,
            likes: likesResult.count || 0,
            comments: commentsResult.count || 0,
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleEditPost = (post: PostWithProfile) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedPost: PostWithProfile) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: updatedPost.title,
          content: updatedPost.content,
          image_url: updatedPost.image_url,
          video_url: updatedPost.video_url,
          tags: updatedPost.tags,
          category: updatedPost.category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedPost.id);

      if (error) throw error;

      setShowEditModal(false);
      setEditingPost(null);
      fetchPosts(); // Refresh the list
      alert("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleShowLikes = async (post: PostWithProfile) => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select(
          `
          user_id,
          profiles: user_id (username, full_name, avatar_url)
        `
        )
        .eq("post_id", post.id);

      if (error) throw error;
      setLikesUsers((data || []) as unknown as LikeWithProfile[]);
      setModalPost(post);
      setShowLikesModal(true);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleShowComments = async (post: PostWithProfile) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles: user_id (username, full_name, avatar_url)
        `
        )
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCommentsData((data || []) as unknown as CommentWithProfile[]);
      setModalPost(post);
      setShowCommentsModal(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const closeModals = () => {
    setShowLikesModal(false);
    setShowCommentsModal(false);
    setModalPost(null);
    setLikesUsers([]);
    setCommentsData([]);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Post Management</h1>
        <p>Manage blog posts and content</p>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder="Search posts by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="stats-summary">
          <span>Total Posts: {posts.length}</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="data-table-container desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Author</th>
              <th>Created</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td className="post-description">
                  {post.content
                    ? post.content.substring(0, 50) +
                      (post.content.length > 50 ? "..." : "")
                    : "No description"}
                </td>
                <td>{post.profiles?.username || "Unknown"}</td>
                <td>{new Date(post.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="stat-link"
                    onClick={() => handleShowLikes(post)}
                  >
                    {post.likes || 0} likes
                  </button>
                </td>
                <td>
                  <button
                    className="stat-link"
                    onClick={() => handleShowComments(post)}
                  >
                    {post.comments || 0} comments
                  </button>
                </td>
                <td>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditPost(post)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-view">
        {filteredPosts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-card-header">
              <h3 className="post-card-title">{post.title}</h3>
              <div className="post-card-meta">
                <span className="post-author">
                  {post.profiles?.username || "Unknown"}
                </span>
                <span className="post-date">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="post-card-content">
              <p className="post-description">
                {post.content
                  ? post.content.substring(0, 100) +
                    (post.content.length > 100 ? "..." : "")
                  : "No description"}
              </p>
            </div>

            <div className="post-card-stats">
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <button
                  className="stat-link-mobile"
                  onClick={() => handleShowLikes(post)}
                >
                  {post.likes || 0} likes
                </button>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <button
                  className="stat-link-mobile"
                  onClick={() => handleShowComments(post)}
                >
                  {post.comments || 0} comments
                </button>
              </div>
            </div>

            <div className="post-card-actions">
              <button
                className="action-btn edit"
                onClick={() => handleEditPost(post)}
              >
                Edit
              </button>
              <button
                className="action-btn delete"
                onClick={() => deletePost(post.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <EditPostModal
          post={editingPost}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Likes Modal */}
      {showLikesModal && modalPost && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content likes-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Likes for "{modalPost.title}"</h2>
              <button className="close-btn" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {likesUsers.length === 0 ? (
                <p className="no-data">No likes yet</p>
              ) : (
                <div className="likes-list">
                  {likesUsers.map((like, index) => (
                    <div key={index} className="like-item">
                      <div className="user-avatar">
                        {like.profiles?.avatar_url ? (
                          <img
                            src={like.profiles.avatar_url}
                            alt={like.profiles.username}
                          />
                        ) : (
                          <div className="default-avatar">👤</div>
                        )}
                      </div>
                      <div className="user-info">
                        <span className="username">
                          {like.profiles?.full_name ||
                            like.profiles?.username ||
                            "Anonymous"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && modalPost && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content comments-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Comments for "{modalPost.title}"</h2>
              <button className="close-btn" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {commentsData.length === 0 ? (
                <p className="no-data">No comments yet</p>
              ) : (
                <div className="comments-list">
                  {commentsData.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="user-avatar">
                        {comment.profiles?.avatar_url ? (
                          <img
                            src={comment.profiles.avatar_url}
                            alt={comment.profiles.username}
                          />
                        ) : (
                          <div className="default-avatar">👤</div>
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="username">
                            {comment.profiles?.full_name ||
                              comment.profiles?.username ||
                              "Anonymous"}
                          </span>
                          <span className="comment-date">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Post Modal Component
const EditPostModal: React.FC<{
  post: PostWithProfile;
  onSave: (post: PostWithProfile) => void;
  onCancel: () => void;
}> = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: post.title || "",
    content: post.content,
    images: post.image_url ? JSON.parse(post.image_url) : [],
    videos: post.video_url ? JSON.parse(post.video_url) : [],
    tags: post.tags || [],
    category: post.category || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateFile = (file: File, type: "image" | "video"): boolean => {
    const allowedTypes =
      type === "image"
        ? ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        : [
            "video/mp4",
            "video/avi",
            "video/mov",
            "video/wmv",
            "video/webm",
            "video/3gp",
            "video/flv",
            "video/m4v",
          ];

    if (!allowedTypes.includes(file.type)) {
      alert(`Please select a valid ${type} file (${allowedTypes.join(", ")})`);
      return false;
    }

    // Check file size - Supabase has a 50MB limit per file for direct uploads
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos (Supabase limit)
    if (file.size > maxSize) {
      const maxSizeText = type === "image" ? "5MB" : "50MB";
      alert(
        `File size exceeds the maximum limit of ${maxSizeText} (Supabase platform limit). For larger files, please use external hosting and provide the URL instead.`
      );
      return false;
    }

    return true;
  };

  const uploadFileToSupabase = async (
    file: File,
    type: "image" | "video"
  ): Promise<string> => {
    // Check authentication before uploading
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to upload files");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `posts/${type}s/${fileName}`;

    // Use regular upload for all files (Supabase has 50MB limit)
    const { error: uploadError } = await supabase.storage
      .from("storage")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("storage").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (files: FileList, type: "image" | "video") => {
    // Check authentication before uploading
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to upload files");
      return;
    }

    const fileArray = Array.from(files);
    console.log(`Starting upload of ${fileArray.length} ${type} files`);

    for (const file of fileArray) {
      console.log(
        `Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`
      );

      if (!validateFile(file, type)) {
        console.log(`File validation failed for ${file.name}`);
        continue;
      }

      try {
        console.log(`Uploading ${file.name} to Supabase storage...`);
        const publicUrl = await uploadFileToSupabase(file, type);
        console.log(`Upload successful! Public URL: ${publicUrl}`);

        if (type === "image") {
          if (formData.images.length < 4) {
            console.log(`Adding image URL to formData.images array`);
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, publicUrl],
            }));
          } else {
            alert("Maximum 4 images allowed");
          }
        } else {
          console.log(`Adding video URL to formData.videos array`);
          setFormData((prev) => ({
            ...prev,
            videos: [...(prev.videos || []), publicUrl],
          }));
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    // Clear file input after successful upload to allow uploading again
    const fileInput = document.getElementById(
      type === "image" ? "image-upload" : "video-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    console.log(`Upload process complete. Current formData:`, {
      images: formData.images,
      videos: formData.videos,
    });
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
      }));
      setImageUrlInput("");
    }
  };

  const addVideoUrl = () => {
    if (videoUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoUrlInput.trim()],
      }));
      setVideoUrlInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedPost: PostWithProfile = {
        ...post,
        title: formData.title,
        content: formData.content,
        image_url:
          formData.images.length > 0
            ? JSON.stringify(formData.images)
            : undefined,
        video_url:
          formData.videos.length > 0
            ? JSON.stringify(formData.videos)
            : undefined,
        tags: formData.tags,
        category: formData.category,
      };

      onSave(updatedPost);
    } catch (error) {
      console.error("Error preparing post update:", error);
      alert("Failed to prepare post update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-post-modal">
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-post-form">
          <div className="form-grid">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="edit-title">Post Title</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging title..."
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">Content</label>
                <textarea
                  id="edit-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your post content here..."
                  required
                  rows={8}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Select a category</option>
                  <option value="architectural design">
                    Architectural Design
                  </option>
                  <option value="construction">Construction</option>
                  <option value="interior design">Interior Design</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    className="form-input"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="add-tag-btn"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                <div className="tags-display">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      <Tag size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="remove-tag"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Media URLs</label>

                <div className="media-upload-section">
                  <div className="upload-group">
                    <label className="upload-label">
                      <Image size={20} />
                      Images ({formData.images.length}/4)
                    </label>

                    <div className="url-input-group">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="form-input"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addImageUrl())
                        }
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="add-url-btn"
                      >
                        Add Image
                      </button>
                    </div>

                    <div className="url-input-group">
                      <label
                        htmlFor="image-upload"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload(e.target.files, "image")
                          }
                          className="form-input"
                          id="image-upload"
                          style={{ padding: "0.5rem", flex: 1 }}
                        />
                      </label>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#666",
                          marginTop: "0.25rem",
                        }}
                      >
                        Max 4 images, unlimited file size
                      </span>
                    </div>
                    {formData.images.map((image: string, index: number) => (
                      <div key={index} className="media-preview">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="preview-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.add(
                              "error"
                            );
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.display = "block";
                          }}
                        />
                        <div
                          className="image-error"
                          style={{ display: "none" }}
                        >
                          Failed to load image
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter(
                                (_: string, i: number) => i !== index
                              ),
                            }));
                            // Reset file input to allow uploading the same file again
                            const fileInput = document.getElementById(
                              "image-upload"
                            ) as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = "";
                            }
                          }}
                          className="remove-media"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="upload-group">
                    <label className="upload-label">
                      <Video size={20} />
                      Video
                    </label>

                    <div className="url-input-group">
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="Enter video URL..."
                        className="form-input"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addVideoUrl())
                        }
                      />
                      <button
                        type="button"
                        onClick={addVideoUrl}
                        className="add-url-btn"
                      >
                        Add Video
                      </button>
                    </div>

                    <div className="url-input-group">
                      <label
                        htmlFor="video-upload"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload(e.target.files, "video")
                          }
                          className="form-input"
                          id="video-upload"
                          style={{ padding: "0.5rem", flex: 1 }}
                        />
                      </label>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#666",
                          marginTop: "0.25rem",
                        }}
                      >
                        Unlimited file size
                      </span>
                    </div>
                    {formData.videos &&
                      formData.videos.length > 0 &&
                      formData.videos.map((video: string, index: number) => (
                        <div key={index} className="media-preview">
                          <video
                            src={video}
                            className="preview-video"
                            controls
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                videos: prev.videos.filter(
                                  (_: string, i: number) => i !== index
                                ),
                              }));
                              // Reset file input to allow uploading the same file again
                              const fileInput = document.getElementById(
                                "video-upload"
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = "";
                              }
                            }}
                            className="remove-media"
                            title="Remove video"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Updating Post...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Update Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Contact Messages Management Component
const ContactMessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;
      fetchMessages(); // Refresh the list
    } catch (error) {
      console.error("Error updating message status:", error);
      alert("Failed to update message status");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyMessage.trim()) return;

    setReplying(true);
    try {
      // Verify user is authenticated and is admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to send replies");
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error("Admin access required");
      }

      const { error } = await supabase.functions.invoke("send-contact-reply", {
        body: {
          message_id: selectedMessage.id,
          reply: replyMessage.trim(),
          reply_subject: replySubject.trim() || undefined,
        },
      });

      if (error) throw error;

      alert("Reply sent successfully!");
      setShowReplyModal(false);
      setReplyMessage("");
      setReplySubject("");
      setSelectedMessage(null);
      fetchMessages(); // Refresh to show updated status
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const openReplyModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplySubject(`Re: ${message.subject || "Your Contact Message"}`);
    setShowReplyModal(true);
  };

  const openDetailsModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowReplyModal(false);
    setShowDetailsModal(false);
    setSelectedMessage(null);
    setReplyMessage("");
    setReplySubject("");
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "status-pending",
      read: "status-read",
      replied: "status-replied",
    };
    return (
      statusClasses[status as keyof typeof statusClasses] || "status-pending"
    );
  };

  if (loading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
        <p>Loading contact messages...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Contact Messages</h1>
        <p>Manage and respond to contact form submissions</p>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder="Search messages by name, email, subject, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="stats-summary">
          <span>Total Messages: {messages.length}</span>
          <span>
            Pending: {messages.filter((m) => m.status === "pending").length}
          </span>
          <span>
            Replied: {messages.filter((m) => m.status === "replied").length}
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="data-table-container desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message.id}>
                <td>{message.name}</td>
                <td>{message.email}</td>
                <td>{message.subject || "No subject"}</td>
                <td>
                  <span
                    className={`status-badge ${getStatusBadge(message.status)}`}
                  >
                    {message.status}
                  </span>
                </td>
                <td>{new Date(message.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="action-btn view"
                    onClick={() => openDetailsModal(message)}
                  >
                    View
                  </button>
                  {message.status !== "replied" && (
                    <>
                      <button
                        className="action-btn mark-read"
                        onClick={() => updateMessageStatus(message.id, "read")}
                      >
                        Mark Read
                      </button>
                      <button
                        className="action-btn reply"
                        onClick={() => openReplyModal(message)}
                      >
                        Reply
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-view">
        {filteredMessages.map((message) => (
          <div key={message.id} className="message-card">
            <div className="message-card-header">
              <div className="message-info">
                <h3 className="message-name">{message.name}</h3>
                <p className="message-email">{message.email}</p>
                <div className="message-status">
                  <span
                    className={`status-badge ${getStatusBadge(message.status)}`}
                  >
                    {message.status}
                  </span>
                </div>
              </div>
              <span className="message-date">
                {new Date(message.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="message-card-content">
              <h4 className="message-subject">
                {message.subject || "No subject"}
              </h4>
              <p className="message-preview">
                {message.message.length > 100
                  ? message.message.substring(0, 100) + "..."
                  : message.message}
              </p>
            </div>

            <div className="message-card-actions">
              <button
                className="action-btn view"
                onClick={() => openDetailsModal(message)}
              >
                View Details
              </button>
              {message.status !== "replied" && (
                <>
                  <button
                    className="action-btn mark-read"
                    onClick={() => updateMessageStatus(message.id, "read")}
                  >
                    Mark Read
                  </button>
                  <button
                    className="action-btn reply"
                    onClick={() => openReplyModal(message)}
                  >
                    Reply
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content reply-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Reply to {selectedMessage.name}</h2>
              <button className="close-btn" onClick={closeModals}>
                ×
              </button>
            </div>
            <form onSubmit={handleReply} className="reply-form">
              <div className="form-group">
                <label htmlFor="reply-subject">Subject</label>
                <input
                  type="text"
                  id="reply-subject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reply-message">Your Reply</label>
                <textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message here..."
                  rows={8}
                  className="form-textarea"
                  required
                />
              </div>
              <div className="original-message">
                <h4>Original Message:</h4>
                <div className="original-content">
                  <p>
                    <strong>Subject:</strong>{" "}
                    {selectedMessage.subject || "No subject"}
                  </p>
                  <p>
                    <strong>Message:</strong>
                  </p>
                  <div className="original-text">{selectedMessage.message}</div>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={replying}
                >
                  {replying ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="close-btn" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="message-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedMessage.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedMessage.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Subject:</span>
                  <span className="detail-value">
                    {selectedMessage.subject || "No subject"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span
                    className={`detail-value status-${selectedMessage.status}`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row message-content">
                  <span className="detail-label">Message:</span>
                  <div className="detail-value message-text">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
              {selectedMessage.status !== "replied" && (
                <div className="modal-actions">
                  <button
                    className="action-btn mark-read"
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, "read");
                      closeModals();
                    }}
                  >
                    Mark as Read
                  </button>
                  <button
                    className="action-btn reply"
                    onClick={() => {
                      closeModals();
                      openReplyModal(selectedMessage);
                    }}
                  >
                    Reply to Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Send Newsletter Component
const SendNewsletterContent: React.FC = () => {
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{
    isSending: boolean;
    current: number;
    total: number;
    message: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, content: value || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      alert("Please fill in both subject and content");
      return;
    }

    setLoading(true);
    setSendingProgress({
      isSending: true,
      current: 0,
      total: 0,
      message: "Preparing newsletter...",
    });

    try {
      // Get active subscribers count first
      const { data: subscribers, error: countError } = await supabase
        .from("email_subscriptions")
        .select("email", { count: "exact", head: true })
        .eq("is_active", true);

      if (countError) throw countError;

      const totalSubscribers = subscribers?.length || 0;

      setSendingProgress({
        isSending: true,
        current: 0,
        total: totalSubscribers,
        message: `Sending to ${totalSubscribers} subscribers...`,
      });

      // Send newsletter
      const { error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject: formData.subject.trim(),
          content: formData.content.trim(),
        },
      });

      if (error) throw error;

      setSendingProgress({
        isSending: false,
        current: totalSubscribers,
        total: totalSubscribers,
        message: `Newsletter sent successfully to ${totalSubscribers} subscribers!`,
      });

      // Reset form after successful send
      setTimeout(() => {
        setFormData({ subject: "", content: "" });
        setSendingProgress(null);
      }, 3000);
    } catch (error) {
      console.error("Error sending newsletter:", error);
      setSendingProgress({
        isSending: false,
        current: 0,
        total: 0,
        message: "Failed to send newsletter. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Send Newsletter</h1>
        <p>Send newsletters to all active subscribers</p>
      </div>

      <form onSubmit={handleSubmit} className="newsletter-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="subject">Subject Line</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter newsletter subject..."
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Content (Markdown)</label>
              <div data-color-mode="light" className="markdown-editor">
                <MDEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  preview="edit"
                  hideToolbar={false}
                  textareaProps={{
                    placeholder: "Write your newsletter content here...",
                    disabled: loading,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {sendingProgress && (
          <div className="sending-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width:
                    sendingProgress.total > 0
                      ? `${
                          (sendingProgress.current / sendingProgress.total) *
                          100
                        }%`
                      : "0%",
                }}
              />
            </div>
            <p className="progress-message">{sendingProgress.message}</p>
            {sendingProgress.isSending && (
              <div className="loading-spinner small"></div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={
              loading || !formData.subject.trim() || !formData.content.trim()
            }
          >
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Sending Newsletter...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Newsletter
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Email Subscriptions Management Component
const EmailSubscriptionsManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching email subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriptionStatus = async (
    subscriptionId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .update({ is_active: !currentStatus })
        .eq("id", subscriptionId);

      if (error) throw error;
      fetchSubscriptions(); // Refresh the list
    } catch (error) {
      console.error("Error updating subscription status:", error);
      alert("Failed to update subscription status");
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this email subscription? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .delete()
        .eq("id", subscriptionId);

      if (error) throw error;
      fetchSubscriptions(); // Refresh the list
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Failed to delete subscription");
    }
  };

  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
        <p>Loading email subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Email Subscriptions</h1>
        <p>Manage email newsletter subscriptions</p>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder="Search subscriptions by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="stats-summary">
          <span>Total Subscriptions: {subscriptions.length}</span>
          <span>Active: {subscriptions.filter((s) => s.is_active).length}</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="data-table-container desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.email}</td>
                <td>
                  {new Date(subscription.subscribed_at).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      subscription.is_active ? "active" : "inactive"
                    }`}
                  >
                    {subscription.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className={`action-btn ${
                      subscription.is_active ? "deactivate" : "activate"
                    }`}
                    onClick={() =>
                      toggleSubscriptionStatus(
                        subscription.id,
                        subscription.is_active
                      )
                    }
                  >
                    {subscription.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteSubscription(subscription.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-view">
        {filteredSubscriptions.map((subscription) => (
          <div key={subscription.id} className="subscription-card">
            <div className="subscription-card-header">
              <div className="subscription-info">
                <h3 className="subscription-email">{subscription.email}</h3>
                <div className="subscription-status">
                  <span
                    className={`status-badge ${
                      subscription.is_active ? "active" : "inactive"
                    }`}
                  >
                    {subscription.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <span className="subscription-date">
                {new Date(subscription.subscribed_at).toLocaleDateString()}
              </span>
            </div>

            <div className="subscription-card-actions">
              <button
                className={`action-btn ${
                  subscription.is_active
                    ? "deactivate-mobile"
                    : "activate-mobile"
                }`}
                onClick={() =>
                  toggleSubscriptionStatus(
                    subscription.id,
                    subscription.is_active
                  )
                }
              >
                {subscription.is_active ? "Deactivate" : "Activate"}
              </button>
              <button
                className="action-btn delete"
                onClick={() => deleteSubscription(subscription.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Create Project Component with Modern UI
const CreateProjectContent: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "ongoing" as "completed" | "ongoing",
    image: "",
    location: "",
    category: "" as string,
    // Common specifications with dedicated fields
    height: "",
    floors: "",
    area: "",
    completion: "",
    units: "",
    bedrooms: "",
    length: "",
    lanes: "",
    // Dynamic specifications for custom fields
    specifications: {} as Record<string, string>,
    timeline: "",
    materials: [] as string[],
    features: [] as string[],
    imageGallery: [] as string[],
    blueprints: [] as string[],
    videos: [] as Array<{
      url: string;
      type: "local" | "external";
      thumbnail: string;
    }>,
    virtualTour: "",
  });

  const [featureInput, setFeatureInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [blueprintUrlInput, setBlueprintUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoThumbnailInput, setVideoThumbnailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const addFeature = () => {
    if (
      featureInput.trim() &&
      !formData.features.includes(featureInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const addImageToGallery = () => {
    if (
      imageUrlInput.trim() &&
      !formData.imageGallery.includes(imageUrlInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        imageGallery: [...prev.imageGallery, imageUrlInput.trim()],
      }));
      setImageUrlInput("");
    }
  };

  const removeImageFromGallery = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((img) => img !== url),
    }));
  };

  const addBlueprint = () => {
    if (
      blueprintUrlInput.trim() &&
      !formData.blueprints.includes(blueprintUrlInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        blueprints: [...prev.blueprints, blueprintUrlInput.trim()],
      }));
      setBlueprintUrlInput("");
    }
  };

  const removeBlueprint = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      blueprints: prev.blueprints.filter((bp) => bp !== url),
    }));
  };

  const addVideo = () => {
    if (videoUrlInput.trim() && videoThumbnailInput.trim()) {
      const newVideo = {
        url: videoUrlInput.trim(),
        type: "external" as const,
        thumbnail: videoThumbnailInput.trim(),
      };
      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, newVideo],
      }));
      setVideoUrlInput("");
      setVideoThumbnailInput("");
    }
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  // File upload functions for projects
  const validateFile = (file: File, type: "image" | "video"): boolean => {
    // Allow any image or video type
    const isValidType = type === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/");

    if (!isValidType) {
      alert(`Please select a valid ${type} file. Any ${type} type is supported.`);
      return false;
    }

    // No file size limits - unlimited upload size
    return true;
  };

  const uploadProjectFileToSupabase = async (
    file: File,
    type: "image" | "video" | "thumbnail" | "blueprint",
    projectId: string
  ): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to upload files");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Determine folder based on type
    let folder = "images";
    if (type === "video") folder = "videos";
    if (type === "thumbnail") folder = "thumbnails";
    if (type === "blueprint") folder = "blueprints";

    // Include "projects/" prefix to match SQL bucket structure
    const filePath = `projects/${projectId}/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleMainImageFileSelect = async (file: File | null) => {
    if (!file) return;

    if (!validateFile(file, "image")) return;

    setUploadingMainImage(true);
  try {
    // Upload immediately
    const publicUrl = await uploadProjectFileToSupabase(file, "thumbnail", "temp"); // Use temp folder since no projectId yet
    setFormData((prev) => ({
      ...prev,
      image: publicUrl,
    }));
  } catch (error: unknown) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload main image: ${message}`);
    } finally {
      setUploadingMainImage(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.image ||
      !formData.location
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const details = {
        timeline: formData.timeline || undefined,
        materials:
          formData.materials.length > 0 ? formData.materials : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        imageGallery:
          formData.imageGallery.length > 0 ? formData.imageGallery : undefined,
        blueprints:
          formData.blueprints.length > 0 ? formData.blueprints : undefined,
        videos: formData.videos.length > 0 ? formData.videos : undefined,
        virtualTour: formData.virtualTour || undefined,
      };

      // Handle category - convert empty string to null
      const categoryValue = formData.category && formData.category.trim() !== "" 
        ? formData.category.trim() 
        : null;

      // Ensure status is valid
      const statusValue = formData.status === "completed" || formData.status === "ongoing"
        ? formData.status
        : "ongoing";

      const { error } = await supabase
        .from("projects")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: statusValue,
          image: formData.image.trim(),
          location: formData.location.trim(),
          category: categoryValue,
          details: details,
          created_by: user.id,
        });

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      alert(
        "Project created successfully! All images have been uploaded and saved."
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "ongoing",
        image: "",
        location: "",
        category: "",
        timeline: "",
        materials: [],
        features: [],
        imageGallery: [],
        blueprints: [],
        videos: [],
        virtualTour: "",
      });
    } catch (error: unknown) {
      console.error("Error creating project:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert("Failed to create project: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Create New Project</h1>
        <p>Add a new project to the portfolio</p>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group project-title-group">
          <label htmlFor="title" className="project-title-label">
            <Building2 size={20} className="title-icon" />
            Project Title 
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., The Metropol"
            className="form-input project-title-input"
          />
        </div>

        <div className="form-group description-group">
          <label htmlFor="description" className="description-label">
            <FileText size={20} className="description-icon" />
            Description 
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Project description..."
            className="form-textarea description-textarea"
          />
        </div>

        <div className="form-row">
          <div className="form-group status-group">
            <label htmlFor="status" className="status-label">
              <CheckCircle size={20} className="status-icon" />
              Status 
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="form-input status-select"
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group category-group">
            <label htmlFor="category" className="category-label">
              <Tag size={20} className="category-icon" />
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input category-select"
            >
              <option value="">Select Category</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="town-houses">Town Houses</option>
              <option value="group-dwelling">Group Dwelling</option>
              <option value="architectural">Architectural</option>
            </select>
          </div>
        </div>

        <div className="form-group image-group">
          <label htmlFor="image" className="image-label">
            <Image size={20} className="image-icon" />
            Main Image (Thumbnail) *
          </label>
          <div className="input-with-button" style={{ marginBottom: "10px" }}>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              required
              placeholder="Image URL or upload file below"
              className="form-input image-url-input"
            />
          </div>
          <div className="upload-group">
           
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleMainImageFileSelect(file);
                e.target.value = ""; // Reset input
              }}
              style={{ display: "none" }}
              id="main-image-upload"
            />
            <label htmlFor="main-image-upload" className="upload-btn">
              <Upload size={16} />
              Upload Main Image
            </label>
            {uploadingMainImage && (
              <span style={{ marginLeft: "10px" }}>Uploading...</span>
            )}
          </div>
          {formData.image && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={formData.image}
                alt="Main image preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "5px" }}>
            Upload a main thumbnail image or provide a URL. This image will be
            displayed on the Projects page.
          </p>
        </div>

        <div className="form-group location-group">
          <label htmlFor="location" className="location-label">
            <MapPin size={20} className="location-icon" />
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            placeholder="e.g., Accra, Ghana"
            className="form-input location-input"
          />
        </div>

        <div className="form-group timeline-group">
          <label htmlFor="timeline" className="timeline-label">
            <Calendar size={20} className="timeline-icon" />
            Timeline
          </label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            placeholder="e.g., 2018-2025"
            className="form-input timeline-input"
          />
        </div>

        <div className="form-group virtual-tour-group">
          <label htmlFor="virtualTour" className="virtual-tour-label">
            <Eye size={20} className="virtual-tour-icon" />
            Virtual Tour URL
          </label>
          <input
            type="url"
            id="virtualTour"
            name="virtualTour"
            value={formData.virtualTour}
            onChange={handleInputChange}
            placeholder="https://..."
            className="form-input virtual-tour-input"
          />
        </div>

      
        {/* Features */}
        <div className="form-group features-group">
          <label className="features-label">
            <Star size={20} className="features-icon" />
            Features
          </label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="Add feature"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addFeature())
              }
              className="feature-input"
            />
            <button type="button" onClick={addFeature} className="add-btn">
              <Plus size={16} />
            </button>
          </div>
          <div className="tags-list">
            {formData.features.map((feature, index) => (
              <span key={index} className="tag">
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="tag-remove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="form-group image-gallery-group">
          <label className="image-gallery-label">
            <Images size={20} className="image-gallery-icon" />
            Image Gallery (Unlimited Images)
          </label>
          <div className="input-with-button">
            <input
              type="url"
              placeholder="Image URL (or upload files below)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="gallery-url-input"
            />
            <button
              type="button"
              onClick={addImageToGallery}
              className="add-btn"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="upload-group" style={{ marginTop: "10px" }}>
            <label
              className="upload-label"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Upload Images (Multiple files supported)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                if (e.target.files) {
                  const fileArray = Array.from(e.target.files);
                  const uploadedUrls: string[] = [];

                  for (const file of fileArray) {
                    if (validateFile(file, "image")) {
                      try {
                        // Upload immediately to temp folder
                        const publicUrl = await uploadProjectFileToSupabase(file, "image", "temp");
                        uploadedUrls.push(publicUrl);
                      } catch (error) {
                        console.error("Gallery upload error:", error);
                        alert(`Failed to upload ${file.name}`);
                      }
                    }
                  }

                  // Add uploaded URLs to form data
                  setFormData((prev) => ({
                    ...prev,
                    imageGallery: [...prev.imageGallery, ...uploadedUrls],
                  }));
                }
                // Reset input
                e.target.value = "";
              }}
              style={{ display: "none" }}
              id="image-file-upload"
            />
            <label htmlFor="image-file-upload" className="upload-btn">
              <Upload size={16} />
              Select Images (Multiple)
            </label>
          </div>
          <div className="tags-list" style={{ marginTop: "10px" }}>
            {formData.imageGallery.map((url, index) => (
              <span key={index} className="tag">
                <Image size={12} /> Image {index + 1}
                <button
                  type="button"
                  onClick={() => removeImageFromGallery(url)}
                  className="tag-remove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "5px" }}>
            Tip: You can add unlimited images via URL or file upload. For file
            uploads, create the project first, then use the edit form to upload
            files.
          </p>
        </div>

        {/* Videos */}
        <div className="form-group videos-group">
          <label className="videos-label">
            <Video size={20} className="videos-icon" />
            Videos (Unlimited Videos)
          </label>
          <div className="video-input-group">
            <input
              type="url"
              placeholder="Video URL (YouTube, Vimeo, or direct link)"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              className="video-url-input"
            />
            <input
              type="url"
              placeholder="Thumbnail URL (optional)"
              value={videoThumbnailInput}
              onChange={(e) => setVideoThumbnailInput(e.target.value)}
              className="video-thumbnail-input"
            />
            <button type="button" onClick={addVideo} className="add-btn">
              <Plus size={16} />
            </button>
          </div>
          <div className="upload-group" style={{ marginTop: "10px" }}>
            <label
              className="upload-label"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Upload Videos (Multiple files supported)
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={async (e) => {
                if (e.target.files) {
                  const fileArray = Array.from(e.target.files);

                  for (const file of fileArray) {
                    if (validateFile(file, "video")) {
                      try {
                        // Upload video immediately to temp folder
                        const videoUrl = await uploadProjectFileToSupabase(file, "video", "temp");
                        // For thumbnail, use a placeholder or upload a default
                        const thumbnailUrl = "https://via.placeholder.com/300x200?text=Video+Thumbnail"; // Placeholder
                        const newVideo = {
                          url: videoUrl,
                          type: "local" as const,
                          thumbnail: thumbnailUrl,
                        };
                        setFormData((prev) => ({
                          ...prev,
                          videos: [...prev.videos, newVideo],
                        }));
                      } catch (error) {
                        console.error("Video upload error:", error);
                        alert(`Failed to upload ${file.name}`);
                      }
                    }
                  }
                }
                // Reset input
                e.target.value = "";
              }}
              style={{ display: "none" }}
              id="video-file-upload"
            />
            <label htmlFor="video-file-upload" className="upload-btn">
              <Upload size={16} />
              Select Videos (Multiple)
            </label>
          </div>
          <div className="tags-list" style={{ marginTop: "10px" }}>
            {formData.videos.map((video, index) => (
              <span key={index} className="tag">
                <Video size={12} /> {video.type} Video
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="tag-remove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "5px" }}>
            Tip: You can add unlimited videos via URL or file upload. For file
            uploads, create the project first, then use the edit form to upload
            files.
          </p>
        </div>

        {/* Blueprints */}
        <div className="form-group blueprints-group">
          <label className="blueprints-label">
            <File size={20} className="blueprints-icon" />
            Blueprints
          </label>
          <div className="input-with-button">
            <input
              type="url"
              placeholder="Blueprint URL"
              value={blueprintUrlInput}
              onChange={(e) => setBlueprintUrlInput(e.target.value)}
              className="blueprint-url-input"
            />
            <button type="button" onClick={addBlueprint} className="add-btn">
              <Plus size={16} />
            </button>
          </div>
          <div className="tags-list">
            {formData.blueprints.map((url, index) => (
              <span key={index} className="tag">
                Blueprint {index + 1}
                <button
                  type="button"
                  onClick={() => removeBlueprint(url)}
                  className="tag-remove"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <div className="loading-spinner small"></div>
              Creating Project...
            </>
          ) : (
            <>
              <Upload size={16} />
              Create Project
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Manage Projects Component
const ManageProjectsContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log("Fetching projects from database...");
      // Optimized query: Only fetch fields needed for admin list view
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, description, status, image, location, category, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
      
      console.log("Fetched projects:", data?.length || 0, "projects");
      if (editingProject && data) {
        const updatedProject = data.find(p => p.id === editingProject.id);
        if (updatedProject) {
          console.log("Updated project in list:", {
            id: updatedProject.id,
            title: updatedProject.title,
            status: updatedProject.status,
            category: updatedProject.category,
          });
        }
      }
      
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This will also delete all associated images and videos from storage.")) return;

    try {
      // First, get the project details to extract file URLs
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Extract all file URLs from the project
      const fileUrls: string[] = [];

      // Main image
      if (project.image) {
        fileUrls.push(project.image);
      }

      // Details object
      if (project.details) {
        const details = project.details;

        // Image gallery
        if (details.imageGallery && Array.isArray(details.imageGallery)) {
          fileUrls.push(...details.imageGallery);
        }

        // Videos
        if (details.videos && Array.isArray(details.videos)) {
          details.videos.forEach((video: { url?: string; thumbnail?: string }) => {
            if (video.url) fileUrls.push(video.url);
            if (video.thumbnail) fileUrls.push(video.thumbnail);
          });
        }

        // Blueprints
        if (details.blueprints && Array.isArray(details.blueprints)) {
          fileUrls.push(...details.blueprints);
        }
      }

      // Delete files from storage
      const deletePromises = fileUrls.map(async (url) => {
        try {
          // Check if it's a Supabase storage URL
          if (url.includes('supabase.co/storage/v1/object/public/portfolio/')) {
            // Extract path from Supabase storage URL
            // URL format: https://supabase.co/storage/v1/object/public/portfolio/{projectId}/...
            const urlParts = url.split('/storage/v1/object/public/portfolio/');
            if (urlParts.length === 2) {
              const filePath = urlParts[1]; // This gives us "{projectId}/folder/filename"

              try {
                const { error } = await supabase.storage
                  .from('portfolio')
                  .remove([filePath]);

                if (error) {
                  console.error(`Failed to delete file ${filePath}:`, error);
                  // If bucket_id error or bucket doesn't exist, log but continue
                  if (error.message?.includes('bucket_id') || error.message?.includes('not found')) {
                    console.warn(`Storage bucket issue for ${filePath}, file may not be deleted from storage`);
                  }
                } else {
                  console.log(`Successfully deleted file: ${filePath}`);
                }
              } catch (storageError) {
                console.error(`Storage operation failed for ${filePath}:`, storageError);
                // Continue with other files even if one fails
              }
            }
          } else {
            // External URL - can't delete from our storage
            console.log(`Skipping external URL: ${url}`);
          }
        } catch (error) {
          console.error(`Error processing file ${url}:`, error);
        }
      });

      // Wait for all file deletions to complete
      await Promise.all(deletePromises);

      // Now delete the project record
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;

      fetchProjects();
      alert("Project and all associated files deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    status: "ongoing" as "completed" | "ongoing",
    image: "",
    location: "",
    category: "" as string,
    // Common specifications with dedicated fields
    height: "",
    floors: "",
    area: "",
    completion: "",
    units: "",
    bedrooms: "",
    length: "",
    lanes: "",
    // Dynamic specifications for custom fields
    specifications: {} as Record<string, string>,
    timeline: "",
    materials: [] as string[],
    features: [] as string[],
    imageGallery: [] as string[],
    blueprints: [] as string[],
    videos: [] as Array<{
      url: string;
      type: "local" | "external";
      thumbnail: string;
    }>,
    virtualTour: "",
  });

  const [editMaterialInput, setEditMaterialInput] = useState("");
  const [editFeatureInput, setEditFeatureInput] = useState("");
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editBlueprintUrlInput, setEditBlueprintUrlInput] = useState("");
  const [editVideoUrlInput, setEditVideoUrlInput] = useState("");
  const [editVideoThumbnailInput, setEditVideoThumbnailInput] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editUploadingImages, setEditUploadingImages] = useState(false);
  const [editUploadingVideos, setEditUploadingVideos] = useState(false);
  const [editUploadingMainImage, setEditUploadingMainImage] = useState(false);

  const openEditModal = (project: Project) => {
    const details = project.details || {};

    setEditFormData({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "ongoing",
      image: project.image || "",
      location: project.location || "",
      category: project.category ?? "", // Use nullish coalescing - only use "" if category is null/undefined
      timeline: details.timeline || "",
      materials: details.materials || [],
      features: details.features || [],
      imageGallery: details.imageGallery || [],
      blueprints: details.blueprints || [],
      videos: details.videos || [],
      virtualTour: details.virtualTour || "",
    });
    setEditingProject(project);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingProject(null);
    setShowEditModal(false);
    // Reset form
    setEditFormData({
      title: "",
      description: "",
      status: "ongoing",
      image: "",
      location: "",
      category: "",
      timeline: "",
      materials: [],
      features: [],
      imageGallery: [],
      blueprints: [],
      videos: [],
      virtualTour: "",
    });
    // Reset input states
    setEditMaterialInput("");
    setEditFeatureInput("");
    setEditImageUrlInput("");
    setEditBlueprintUrlInput("");
    setEditVideoUrlInput("");
    setEditVideoThumbnailInput("");
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const element = e.target as HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement;
    const selectedValue = element instanceof HTMLSelectElement ? element.value : value;
    
    console.log("Edit form input change:", { 
      name, 
      value, 
      selectedValue,
      type: element.type || element.tagName,
      elementValue: element.value,
    });
    
    setEditFormData((prev) => {
      const updated = { ...prev, [name]: selectedValue };
      console.log("Updated editFormData - Category:", updated.category, "Status:", updated.status);
      return updated;
    });
  };


  const addEditMaterial = () => {
    if (
      editMaterialInput.trim() &&
      !editFormData.materials.includes(editMaterialInput.trim())
    ) {
      setEditFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, editMaterialInput.trim()],
      }));
      setEditMaterialInput("");
    }
  };

  const removeEditMaterial = (material: string) => {
    setEditFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m !== material),
    }));
  };

  const addEditFeature = () => {
    if (
      editFeatureInput.trim() &&
      !editFormData.features.includes(editFeatureInput.trim())
    ) {
      setEditFormData((prev) => ({
        ...prev,
        features: [...prev.features, editFeatureInput.trim()],
      }));
      setEditFeatureInput("");
    }
  };

  const removeEditFeature = (feature: string) => {
    setEditFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  const addEditImageToGallery = () => {
    if (
      editImageUrlInput.trim() &&
      !editFormData.imageGallery.includes(editImageUrlInput.trim())
    ) {
      setEditFormData((prev) => ({
        ...prev,
        imageGallery: [...prev.imageGallery, editImageUrlInput.trim()],
      }));
      setEditImageUrlInput("");
    }
  };

  const removeEditImageFromGallery = (url: string) => {
    setEditFormData((prev) => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((img) => img !== url),
    }));
  };

  const addEditBlueprint = () => {
    if (
      editBlueprintUrlInput.trim() &&
      !editFormData.blueprints.includes(editBlueprintUrlInput.trim())
    ) {
      setEditFormData((prev) => ({
        ...prev,
        blueprints: [...prev.blueprints, editBlueprintUrlInput.trim()],
      }));
      setEditBlueprintUrlInput("");
    }
  };

  const removeEditBlueprint = (url: string) => {
    setEditFormData((prev) => ({
      ...prev,
      blueprints: prev.blueprints.filter((bp) => bp !== url),
    }));
  };

  const addEditVideo = () => {
    if (editVideoUrlInput.trim() && editVideoThumbnailInput.trim()) {
      const newVideo = {
        url: editVideoUrlInput.trim(),
        type: "external" as const,
        thumbnail: editVideoThumbnailInput.trim(),
      };
      setEditFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, newVideo],
      }));
      setEditVideoUrlInput("");
      setEditVideoThumbnailInput("");
    }
  };

  const removeEditVideo = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  // File upload functions for edit form
  const validateEditFile = (file: File, type: "image" | "video"): boolean => {
    // Allow any image or video type
    const isValidType = type === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/");

    if (!isValidType) {
      alert(`Please select a valid ${type} file. Any ${type} type is supported.`);
      return false;
    }

    // No file size limits - unlimited upload size
    return true;
  };

  const uploadEditFileToSupabase = async (
    file: File,
    type: "image" | "video" | "thumbnail" | "blueprint",
    projectId: string
  ): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to upload files");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    let folder = "images";
    if (type === "video") folder = "videos";
    if (type === "thumbnail") folder = "thumbnails";
    if (type === "blueprint") folder = "blueprints";

    // Include "projects/" prefix to match SQL bucket structure
    const filePath = `projects/${projectId}/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleEditImageFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProject) return;

    setEditUploadingImages(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validateEditFile(file, "image")) continue;

      try {
        const publicUrl = await uploadEditFileToSupabase(
          file,
          "image",
          editingProject.id
        );
        setEditFormData((prev) => ({
          ...prev,
          imageGallery: [...prev.imageGallery, publicUrl],
        }));
      } catch (error: unknown) {
        console.error("Upload error:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Failed to upload ${file.name}: ${message}`);
      }
    }

    setEditUploadingImages(false);
  };

  const handleEditVideoFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProject) return;

    setEditUploadingVideos(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validateEditFile(file, "video")) continue;

      try {
        const videoUrl = await uploadEditFileToSupabase(
          file,
          "video",
          editingProject.id
        );
        const thumbnailUrl = videoUrl.replace(
          /\.(mp4|webm|avi|mov|wmv)$/i,
          ".jpg"
        );

        const newVideo = {
          url: videoUrl,
          type: "local" as const,
          thumbnail: thumbnailUrl,
        };

        setEditFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, newVideo],
        }));
      } catch (error: unknown) {
        console.error("Upload error:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Failed to upload ${file.name}: ${message}`);
      }
    }

    setEditUploadingVideos(false);
  };

  const handleEditMainImageFileUpload = async (file: File | null) => {
    if (!file || !editingProject) return;

    if (!validateEditFile(file, "image")) return;

    try {
      setEditUploadingMainImage(true);
      const publicUrl = await uploadEditFileToSupabase(
        file,
        "thumbnail",
        editingProject.id
      );

      setEditFormData((prev) => ({
        ...prev,
        image: publicUrl,
      }));
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload main image: ${message}`);
    } finally {
      setEditUploadingMainImage(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== FORM SUBMISSION START ===");
    
    // Get the actual current values from the form elements directly
    const form = e.currentTarget as HTMLFormElement;
    const categorySelect = form.querySelector('#edit-category') as HTMLSelectElement;
    const statusSelect = form.querySelector('#edit-status') as HTMLSelectElement;
    
    const actualCategoryValue = categorySelect?.value || editFormData.category;
    const actualStatusValue = statusSelect?.value || editFormData.status;
    
    console.log("Form element values (direct from DOM):", {
      categoryFromSelect: categorySelect?.value,
      statusFromSelect: statusSelect?.value,
      categoryFromState: editFormData.category,
      statusFromState: editFormData.status,
    });
    
    // Use the actual form values, not just state (in case state is stale)
    const formDataToUse = {
      ...editFormData,
      category: actualCategoryValue,
      status: actualStatusValue,
    };
    
    console.log("Form submitted with editFormData (from state):", {
      ...editFormData,
      category: editFormData.category,
      categoryType: typeof editFormData.category,
      status: editFormData.status,
      statusType: typeof editFormData.status,
    });
    console.log("Form submitted with formDataToUse (from DOM):", {
      ...formDataToUse,
      category: formDataToUse.category,
      categoryType: typeof formDataToUse.category,
      status: formDataToUse.status,
      statusType: typeof formDataToUse.status,
    });
    console.log("Original editingProject:", {
      ...editingProject,
      category: editingProject?.category,
      categoryType: typeof editingProject?.category,
      status: editingProject?.status,
    });
    
    // Use the actual form values, not just state (in case state is stale)
    const finalFormData = {
      ...editFormData,
      category: actualCategoryValue,
      status: actualStatusValue,
    };
    
    console.log("🔍 Using final form data:", {
      category: finalFormData.category,
      status: finalFormData.status,
    });
    
    if (
      !finalFormData.title ||
      !finalFormData.description ||
      !finalFormData.image ||
      !finalFormData.location
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!editingProject) {
      console.error("No editing project found!");
      return;
    }

    setEditLoading(true);
    try {
      // Combine common specifications with dynamic specifications
      const combinedSpecifications = { ...finalFormData.specifications };
      if (finalFormData.height) combinedSpecifications.height = finalFormData.height;
      if (finalFormData.floors) combinedSpecifications.floors = finalFormData.floors;
      if (finalFormData.area) combinedSpecifications.area = finalFormData.area;
      if (finalFormData.completion) combinedSpecifications.completion = finalFormData.completion;
      if (finalFormData.units) combinedSpecifications.units = finalFormData.units;
      if (finalFormData.bedrooms) combinedSpecifications.bedrooms = finalFormData.bedrooms;
      if (finalFormData.length) combinedSpecifications.length = finalFormData.length;
      if (finalFormData.lanes) combinedSpecifications.lanes = finalFormData.lanes;

      const details = {
        specifications: Object.keys(combinedSpecifications).length > 0 ? combinedSpecifications : undefined,
        timeline: finalFormData.timeline || undefined,
        materials:
          finalFormData.materials.length > 0
            ? finalFormData.materials
            : undefined,
        features:
          finalFormData.features.length > 0 ? finalFormData.features : undefined,
        imageGallery:
          finalFormData.imageGallery.length > 0
            ? finalFormData.imageGallery
            : undefined,
        blueprints:
          finalFormData.blueprints.length > 0
            ? finalFormData.blueprints
            : undefined,
        videos:
          finalFormData.videos.length > 0 ? finalFormData.videos : undefined,
        virtualTour: finalFormData.virtualTour || undefined,
      };

      // Handle category - convert empty string to null
      // Important: Use explicit null, not undefined, for Supabase
      // Also validate against CHECK constraint values
      // Use the actual DOM value, not just state
      let categoryValue: string | null = null;
      const rawCategory = actualCategoryValue;
      console.log("Raw category from DOM:", rawCategory, "Type:", typeof rawCategory);
      
      if (rawCategory && typeof rawCategory === 'string' && rawCategory.trim() !== "") {
        const trimmed = editFormData.category.trim();
        // Validate against database CHECK constraint
        const allowedCategories = ['residential', 'commercial', 'town-houses', 'group-dwelling', 'architectural'];
        if (allowedCategories.includes(trimmed)) {
          categoryValue = trimmed;
        } else {
          console.warn("Invalid category value:", trimmed, "- must be one of:", allowedCategories);
          categoryValue = null;
        }
      }

      // Ensure status is valid - must be one of the allowed values
      // Use the actual DOM value
      let statusValue: "completed" | "ongoing" = "ongoing";
      if (actualStatusValue === "completed" || actualStatusValue === "ongoing") {
        statusValue = actualStatusValue;
      }

      console.log("Category processing:", {
        original: editFormData.category,
        trimmed: editFormData.category?.trim(),
        final: categoryValue,
        type: typeof categoryValue,
      });

      console.log("Status processing:", {
        original: editFormData.status,
        final: statusValue,
        type: typeof statusValue,
      });

      // Prepare update data - explicitly set all fields
      // IMPORTANT: For Supabase, we must explicitly set category to null if empty,
      // not undefined or empty string
      const updateData: Record<string, any> = {
        title: finalFormData.title.trim(),
        description: finalFormData.description.trim(),
        status: statusValue,
        image: finalFormData.image.trim(),
        location: finalFormData.location.trim(),
          details: details,
      };

      // Explicitly set category - use null, not undefined
      if (categoryValue !== null && categoryValue !== undefined) {
        updateData.category = categoryValue;
      } else {
        // Explicitly set to null to clear the category
        updateData.category = null;
      }

      console.log("Update data prepared:", {
        ...updateData,
        category: updateData.category,
        categoryType: typeof updateData.category,
        categoryIsNull: updateData.category === null,
      });

      // Log comparison with original values
      console.log("Value comparison:", {
        status: {
          original: editingProject.status,
          new: statusValue,
          changed: editingProject.status !== statusValue,
        },
        category: {
          original: editingProject.category,
          new: categoryValue,
          originalType: typeof editingProject.category,
          newType: typeof categoryValue,
          changed: editingProject.category !== categoryValue,
          // Check if both are null/empty
          bothNull: !editingProject.category && !categoryValue,
          bothEmpty: editingProject.category === "" && categoryValue === null,
        },
      });

      console.log("Updating project with data:", {
        id: editingProject.id,
        updateData,
        originalCategory: editingProject.category,
        newCategory: categoryValue,
        originalStatus: editingProject.status,
        newStatus: statusValue,
      });

      // Force update by explicitly setting all fields
      // Note: Supabase will update even if values are the same
      // IMPORTANT: Make sure category is explicitly included, even if null
      const updatePayload: Record<string, any> = {
        title: updateData.title,
        description: updateData.description,
        status: updateData.status,
        image: updateData.image,
        location: updateData.location,
        details: updateData.details,
      };

      // Explicitly set category - this is critical
      // CRITICAL: Always include category in the update, even if null
      // Supabase might ignore fields that are undefined, so we must explicitly set null
      updatePayload.category = categoryValue; // This will be null or a valid string
      
      // Double-check the category value before sending
      console.log("=== FINAL CHECK BEFORE UPDATE ===");
      console.log("Category value to send:", categoryValue);
      console.log("Category value type:", typeof categoryValue);
      console.log("Category value === null:", categoryValue === null);
      console.log("Category value stringified:", JSON.stringify(categoryValue));
      console.log("Full update payload:", JSON.stringify(updatePayload, null, 2));
      console.log("Category in payload object:", updatePayload.category);
      console.log("Payload keys:", Object.keys(updatePayload));

      // Perform the update - try with select first to see if we get data back
      const { data: updateResponseData, error: updateError } = await supabase
        .from("projects")
        .update(updatePayload)
        .eq("id", editingProject.id)
        .select("id, category, status");
      
      console.log("Update result - Error:", updateError);
      console.log("Update result - Data:", updateResponseData);
      
      if (updateError) {
        console.error("Supabase update error:", updateError);
        console.error("Error details:", JSON.stringify(updateError, null, 2));
        throw updateError;
      }
      
      // If we got data back, check if category was updated
      if (updateResponseData && updateResponseData.length > 0) {
        const updatedRecord = updateResponseData[0];
        console.log("Update returned record:", updatedRecord);
        console.log("Category in returned record:", updatedRecord.category);
        
        if (updatedRecord.category !== categoryValue && 
            !(categoryValue === null && (updatedRecord.category === null || updatedRecord.category === ""))) {
          console.warn("Category mismatch in update response:", {
            expected: categoryValue,
            got: updatedRecord.category,
          });
        }
      }

      if (updateError) {
        console.error("Supabase update error:", updateError);
        console.error("Error details:", JSON.stringify(updateError, null, 2));
        throw updateError;
      }

      console.log("Update query executed successfully (no error)");

      // Wait a moment for the database to process the update
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify the update by fetching the project again
      const { data: verifyData, error: verifyError } = await supabase
        .from("projects")
        .select("id, status, category, title, location")
        .eq("id", editingProject.id)
        .single();

      if (verifyError) {
        console.error("Error verifying update:", verifyError);
        throw new Error(`Update may have succeeded but verification failed: ${verifyError.message}`);
      }

      console.log("Verified update - current database values:", {
        status: verifyData?.status,
        category: verifyData?.category,
        categoryType: typeof verifyData?.category,
        title: verifyData?.title,
      });
      
      // Check if the update actually took effect
      const statusUpdated = verifyData?.status === statusValue;
      
      // For category, handle null, undefined, and empty string comparisons
      const dbCategory = verifyData?.category;
      const categoryMatches = 
        (categoryValue === null && (dbCategory === null || dbCategory === undefined || dbCategory === "")) ||
        (categoryValue !== null && dbCategory === categoryValue);
      
      console.log("Update verification details:", {
        status: {
          expected: statusValue,
          actual: verifyData?.status,
          matches: statusUpdated,
        },
        category: {
          expected: categoryValue,
          expectedType: typeof categoryValue,
          actual: dbCategory,
          actualType: typeof dbCategory,
          actualIsNull: dbCategory === null,
          actualIsUndefined: dbCategory === undefined,
          actualIsEmpty: dbCategory === "",
          matches: categoryMatches,
        },
      });
      
      // If category didn't update, try updating it separately
      if (!categoryMatches) {
        console.warn("⚠️ Category did not update in main query, attempting separate category update...");
        console.log("Attempting to set category to:", categoryValue, "Type:", typeof categoryValue);
        console.log("Current database value:", dbCategory);
        
        // Try updating category with explicit value - use a fresh query
        const categoryUpdatePayload: Record<string, any> = {};
        
        // Explicitly set category - ensure it's the right type
        if (categoryValue === null) {
          categoryUpdatePayload.category = null;
        } else {
          categoryUpdatePayload.category = String(categoryValue);
        }
        
        console.log("Category update payload:", JSON.stringify(categoryUpdatePayload, null, 2));
        console.log("Payload category value:", categoryUpdatePayload.category);
        console.log("Payload category type:", typeof categoryUpdatePayload.category);
        
        // Try the update
        const { data: categoryUpdateData, error: categoryUpdateError } = await supabase
          .from("projects")
          .update(categoryUpdatePayload)
          .eq("id", editingProject.id)
          .select("id, category");
        
        if (categoryUpdateError) {
          console.error("❌ Separate category update failed:", categoryUpdateError);
          console.error("Error code:", categoryUpdateError.code);
          console.error("Error message:", categoryUpdateError.message);
          console.error("Error details:", JSON.stringify(categoryUpdateError, null, 2));
          throw new Error(`Category update failed: ${categoryUpdateError.message} (Code: ${categoryUpdateError.code})`);
        }
        
        console.log("✅ Category update query executed (no error)");
        console.log("Category update response data:", categoryUpdateData);
        
        // Wait longer and verify again - give database time to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch the full project to see what's actually in the database
        const { data: reVerifyData, error: reVerifyError } = await supabase
          .from("projects")
          .select("id, category, status, title, location, created_at, updated_at")
          .eq("id", editingProject.id)
          .single();
        
        if (reVerifyError) {
          console.error("Re-verification error:", reVerifyError);
          throw new Error(`Re-verification failed: ${reVerifyError.message}`);
        }
        
        console.log("Re-verification data (full record):", reVerifyData);
        console.log("Re-verification - Category value:", {
          value: reVerifyData?.category,
          type: typeof reVerifyData?.category,
          isNull: reVerifyData?.category === null,
          isUndefined: reVerifyData?.category === undefined,
          isEmpty: reVerifyData?.category === "",
        });
        console.log("Comparing - Expected category:", categoryValue, "Actual:", reVerifyData?.category);
        
        // More robust comparison
        const actualCategory = reVerifyData?.category;
        const finalCategoryMatches = 
          (categoryValue === null && (actualCategory === null || actualCategory === undefined || actualCategory === "")) ||
          (categoryValue !== null && String(actualCategory) === String(categoryValue));
        
        console.log("Final category match check:", {
          expected: categoryValue,
          expectedString: String(categoryValue),
          actual: actualCategory,
          actualString: String(actualCategory),
          strictEqual: categoryValue === actualCategory,
          stringEqual: String(categoryValue) === String(actualCategory),
          matches: finalCategoryMatches,
        });
        
        if (!finalCategoryMatches) {
          console.error("❌ Category still not updated after separate update attempt");
          console.error("Final comparison details:", {
            expected: categoryValue,
            expectedType: typeof categoryValue,
            expectedStringified: JSON.stringify(categoryValue),
            actual: actualCategory,
            actualType: typeof actualCategory,
            actualStringified: JSON.stringify(actualCategory),
            strictEqual: categoryValue === actualCategory,
            looseEqual: categoryValue == actualCategory,
            stringComparison: String(categoryValue) === String(actualCategory),
          });
          
          // This is a critical error - the update is not working
          throw new Error(
            `Category update failed completely. ` +
            `Expected: "${categoryValue}" (${typeof categoryValue}), ` +
            `Database has: "${actualCategory}" (${typeof actualCategory}). ` +
            `The update query executed without error but the value did not change. ` +
            `This may indicate a database constraint, trigger, or RLS policy issue.`
          );
        } else {
          console.log("✅ Category updated successfully via separate update");
        }
      }
      
      if (!statusUpdated) {
        console.error("Status update failed:", {
          expected: statusValue,
          actual: verifyData?.status,
        });
        throw new Error(`Status update failed. Expected: ${statusValue}, Got: ${verifyData?.status}`);
      }

      console.log("✅ Update verified successfully - all values match expected values");

      alert("Project updated successfully!");
      
      // Close modal and refresh projects list
      closeEditModal();
      
      // Small delay to ensure database has processed the update
      setTimeout(() => {
      fetchProjects();
      }, 100);
    } catch (error: unknown) {
      console.error("Error updating project:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert("Failed to update project: " + message);
    } finally {
      setEditLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="content-section">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  // If editing, show full-page edit form
  if (showEditModal && editingProject) {
  return (
      <div className="content-section edit-project-full-page">
        <div className="edit-project-header">
          <button className="back-button" onClick={closeEditModal}>
            <ArrowLeft size={20} />
            Back to Projects
          </button>
          <h1>Edit Project</h1>
        </div>
        <div className="edit-project-content">
              <form onSubmit={handleEditSubmit} className="project-form">
                <div className="form-group edit-project-title-group">
                  <label htmlFor="edit-title" className="edit-project-title-label">
                    <Building2 size={20} className="edit-title-icon" />
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    required
                    placeholder="e.g., The Metropol"
                    className="form-input edit-project-title-input"
                  />
                </div>

                <div className="form-group edit-description-group">
                  <label htmlFor="edit-description" className="edit-description-label">
                    <FileText size={20} className="edit-description-icon" />
                    Description *
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    required
                    rows={4}
                    placeholder="Project description..."
                    className="form-textarea edit-description-textarea"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group edit-status-group">
                    <label htmlFor="edit-status" className="edit-status-label">
                      <CheckCircle size={20} className="edit-status-icon" />
                      Status *
                    </label>
                    <select
                      id="edit-status"
                      name="status"
                      value={editFormData.status}
                      onChange={(e) => {
                        console.log("Status select changed:", e.target.value);
                        handleEditInputChange(e);
                      }}
                      required
                      className="form-input edit-status-select"
                    >
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group edit-category-group">
                    <label htmlFor="edit-category" className="edit-category-label">
                      <Tag size={20} className="edit-category-icon" />
                      Category
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      value={editFormData.category || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log("Category select onChange triggered:", {
                          newValue,
                          oldValue: editFormData.category,
                          elementValue: e.target.value,
                          elementSelectedIndex: e.target.selectedIndex,
                        });
                        // Directly update the state to ensure it's captured
                        setEditFormData((prev) => {
                          const updated = { ...prev, category: newValue };
                          console.log("Category state updated:", {
                            before: prev.category,
                            after: updated.category,
                            fullState: updated,
                          });
                          return updated;
                        });
                      }}
                      className="form-input edit-category-select"
                    >
                      <option value="">Select Category</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="town-houses">Town Houses</option>
                      <option value="group-dwelling">Group Dwelling</option>
                      <option value="architectural">Architectural</option>
                    </select>
                  </div>
                </div>

                <div className="form-group edit-image-group">
                  <label htmlFor="edit-image" className="edit-image-label">
                    <Image size={20} className="edit-image-icon" />
                    Main Image (Thumbnail) *
                  </label>
                  <div
                    className="input-with-button"
                    style={{ marginBottom: "10px" }}
                  >
                    <input
                      type="url"
                      id="edit-image"
                      name="image"
                      value={editFormData.image}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Image URL or upload file below"
                    />
                  </div>
                  <div className="upload-group">
                    <label
                      className="upload-label"
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      Upload Main Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleEditMainImageFileUpload(file);
                        e.target.value = ""; // Reset input
                      }}
                      style={{ display: "none" }}
                      id="edit-main-image-upload"
                    />
                    <label
                      htmlFor="edit-main-image-upload"
                      className="upload-btn"
                    >
                      <Upload size={16} />
                      Select Main Image
                    </label>
                    {editUploadingMainImage && (
                      <span style={{ marginLeft: "10px" }}>Uploading...</span>
                    )}
                  </div>
                  {editFormData.image && (
                    <div style={{ marginTop: "10px" }}>
                      <img
                        src={editFormData.image}
                        alt="Main image preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    Upload a main thumbnail image or provide a URL. This image
                    will be displayed on the Projects page.
                  </p>
                </div>

                <div className="form-group edit-location-group">
                  <label htmlFor="edit-location" className="edit-location-label">
                    <MapPin size={20} className="edit-location-icon" />
                    Location *
                  </label>
                  <input
                    type="text"
                    id="edit-location"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditInputChange}
                    required
                    placeholder="e.g., Accra, Ghana"
                    className="form-input edit-location-input"
                  />
                </div>

                <div className="form-group edit-timeline-group">
                  <label htmlFor="edit-timeline" className="edit-timeline-label">
                    <Calendar size={20} className="edit-timeline-icon" />
                    Timeline
                  </label>
                  <input
                    type="text"
                    id="edit-timeline"
                    name="timeline"
                    value={editFormData.timeline}
                    onChange={handleEditInputChange}
                    placeholder="e.g., 2018-2025"
                    className="form-input edit-timeline-input"
                  />
                </div>

                <div className="form-group edit-virtual-tour-group">
                  <label htmlFor="edit-virtualTour" className="edit-virtual-tour-label">
                    <Eye size={20} className="edit-virtual-tour-icon" />
                    Virtual Tour URL
                  </label>
                  <input
                    type="url"
                    id="edit-virtualTour"
                    name="virtualTour"
                    value={editFormData.virtualTour}
                    onChange={handleEditInputChange}
                    placeholder="https://..."
                    className="form-input edit-virtual-tour-input"
                  />
                </div>


                {/* Materials */}
                <div className="form-group edit-materials-group">
                  <label className="edit-materials-label">
                    <Wrench size={20} className="edit-materials-icon" />
                    Materials
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="Add material"
                      value={editMaterialInput}
                      onChange={(e) => setEditMaterialInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addEditMaterial())
                      }
                      className="edit-material-input"
                    />
                    <button
                      type="button"
                      onClick={addEditMaterial}
                      className="add-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="tags-list">
                    {editFormData.materials.map((material, index) => (
                      <span key={index} className="tag">
                        {material}
                        <button
                          type="button"
                          onClick={() => removeEditMaterial(material)}
                          className="tag-remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="form-group edit-features-group">
                  <label className="edit-features-label">
                    <Star size={20} className="edit-features-icon" />
                    Features
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="Add feature"
                      value={editFeatureInput}
                      onChange={(e) => setEditFeatureInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addEditFeature())
                      }
                      className="edit-feature-input"
                    />
                    <button
                      type="button"
                      onClick={addEditFeature}
                      className="add-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="tags-list">
                    {editFormData.features.map((feature, index) => (
                      <span key={index} className="tag">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeEditFeature(feature)}
                          className="tag-remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Gallery */}
                <div className="form-group edit-image-gallery-group">
                  <label className="edit-image-gallery-label">
                    <Images size={20} className="edit-image-gallery-icon" />
                    Image Gallery (Unlimited Images)
                  </label>
                  <div className="input-with-button">
                    <input
                      type="url"
                      placeholder="Image URL (or upload files below)"
                      value={editImageUrlInput}
                      onChange={(e) => setEditImageUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addEditImageToGallery}
                      className="add-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="upload-group" style={{ marginTop: "10px" }}>
                  
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleEditImageFileUpload(e.target.files)
                      }
                      style={{ display: "none" }}
                      id="edit-image-file-upload"
                    />
                    <label
                      htmlFor="edit-image-file-upload"
                      className="upload-btn"
                    >
                      <Upload size={16} />
                      Select Images (Multiple)
                    </label>
                    {editUploadingImages && (
                      <span style={{ marginLeft: "10px" }}>Uploading...</span>
                    )}
                  </div>
                  <div className="tags-list" style={{ marginTop: "10px" }}>
                    {editFormData.imageGallery.map((url, index) => (
                      <span key={index} className="tag">
                        <Image size={12} /> Image {index + 1}
                        <button
                          type="button"
                          onClick={() => removeEditImageFromGallery(url)}
                          className="tag-remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                 
                </div>

                {/* Videos */}
                <div className="form-group edit-videos-group">
                  <label className="edit-videos-label">
                    <Video size={20} className="edit-videos-icon" />
                    Videos (Unlimited Videos)
                  </label>
                  <div className="video-input-group">
                    <input
                      type="url"
                      placeholder="Video URL (YouTube, Vimeo, etc.)"
                      value={editVideoUrlInput}
                      onChange={(e) => setEditVideoUrlInput(e.target.value)}
                      className="edit-video-url-input"
                    />
                    <input
                      type="url"
                      placeholder="Thumbnail URL"
                      value={editVideoThumbnailInput}
                      onChange={(e) =>
                        setEditVideoThumbnailInput(e.target.value)
                      }
                      className="edit-video-thumbnail-input"
                    />
                    <button
                      type="button"
                      onClick={addEditVideo}
                      className="add-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="upload-group" style={{ marginTop: "10px" }}>
                    <label
                      className="upload-label"
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      Upload Videos (Multiple files supported - Unlimited)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) =>
                        handleEditVideoFileUpload(e.target.files)
                      }
                      style={{ display: "none" }}
                      id="edit-video-file-upload"
                    />
                    <label
                      htmlFor="edit-video-file-upload"
                      className="upload-btn"
                    >
                      <Upload size={16} />
                      Select Videos (Multiple)
                    </label>
                    {editUploadingVideos && (
                      <span style={{ marginLeft: "10px" }}>Uploading...</span>
                    )}
                  </div>
                  <div className="tags-list" style={{ marginTop: "10px" }}>
                    {editFormData.videos.map((video, index) => (
                      <span key={index} className="tag">
                        <Video size={12} /> {video.type} Video
                        <button
                          type="button"
                          onClick={() => removeEditVideo(index)}
                          className="tag-remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    You can upload unlimited videos. Files will be stored in
                    Supabase Storage. Max 50MB per video.
                  </p>
                </div>

                {/* Blueprints */}
                <div className="form-group edit-blueprints-group">
                  <label className="edit-blueprints-label">
                    <File size={20} className="edit-blueprints-icon" />
                    Blueprints
                  </label>
                  <div className="input-with-button">
                    <input
                      type="url"
                      placeholder="Blueprint URL"
                      value={editBlueprintUrlInput}
                      onChange={(e) => setEditBlueprintUrlInput(e.target.value)}
                      className="edit-blueprint-url-input"
                    />
                    <button
                      type="button"
                      onClick={addEditBlueprint}
                      className="add-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="tags-list">
                    {editFormData.blueprints.map((url, index) => (
                      <span key={index} className="tag">
                        Blueprint {index + 1}
                        <button
                          type="button"
                          onClick={() => removeEditBlueprint(url)}
                          className="tag-remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="edit-project-actions">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <div className="loading-spinner small"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Update Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
    );
  }

  // Default: Show project list
  return (
    <div className="content-section">
      <div className="section-header">
        <h1>Manage Projects</h1>
        <p>View, edit, and delete projects</p>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Toggle search"
          >
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder="Search projects by title, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="stats-summary">
          <span>Total Projects: {projects.length}</span>
          <span>
            Ongoing: {projects.filter((p) => p.status === "ongoing").length}
          </span>
          <span>
            Completed: {projects.filter((p) => p.status === "completed").length}
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="data-table-container desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/100?text=No+Image";
                    }}
                  />
                </td>
                <td>{project.title}</td>
                <td>{project.category || "N/A"}</td>
                <td>{project.location}</td>
                <td>
                  <span
                    className={`status-badge ${
                      project.status === "completed" ? "completed" : "ongoing"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td>{new Date(project.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="action-btn edit"
                    onClick={() => openEditModal(project)}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards-view">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card-admin">
            <img
              src={project.image}
              alt={project.title}
              className="project-card-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/300?text=No+Image";
              }}
            />
            <div className="project-card-content">
              <h3>{project.title}</h3>
              <p className="project-card-location">📍 {project.location}</p>
              <div className="project-card-meta">
                <span className="project-card-category">
                  {project.category || "N/A"}
                </span>
                <span
                  className={`status-badge ${
                    project.status === "completed" ? "completed" : "ongoing"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="project-card-actions">
                <button
                  className="action-btn edit"
                  onClick={() => openEditModal(project)}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>No projects found</p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
