import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addComment as addCommentApi,
  deletePost as deletePostApi,
  fetchPosts as fetchPostsApi,
  toggleLike as toggleLikeApi,
  updatePost as updatePostApi,
} from "../api/postApi";
import { updateCurrentUser } from "../api/userApi";
import { ConfirmDialog } from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { Landing } from "../components/Landing";
import { ProfileEditModal } from "../components/ProfileEditModal";
import { CreatePostComposer } from "../components/CreatePostComposer";

const relativeTimeFromNow = (dateInput) => {
  if (!dateInput) return "just now";

  const date = new Date(dateInput);
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);

  if (Number.isNaN(diff) || diff < 0) return "just now";
  if (diff < 60) return `${Math.max(diff, 1)}s ago`;

  const intervals = [
    { label: "m", seconds: 60 },
    { label: "h", seconds: 60 * 60 },
    { label: "d", seconds: 60 * 60 * 24 },
    { label: "w", seconds: 60 * 60 * 24 * 7 },
  ];

  for (let i = intervals.length - 1; i >= 0; i -= 1) {
    const interval = Math.floor(diff / intervals[i].seconds);
    if (interval >= 1) {
      return `${interval}${intervals[i].label} ago`;
    }
  }

  const months = Math.floor(diff / (60 * 60 * 24 * 30));
  if (months >= 1) return `${months}mo ago`;

  const years = Math.floor(diff / (60 * 60 * 24 * 365));
  if (years >= 1) return `${years}y ago`;

  return "just now";
};

const getGradientForIndex = (index) => {
  const gradients = [
    "from-pink-500 via-red-500 to-yellow-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-amber-500 via-orange-500 to-rose-500",
    "from-lime-500 via-emerald-500 to-teal-500",
    "from-sky-500 via-blue-500 to-indigo-500",
  ];

  return gradients[index % gradients.length];
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((chunk) => chunk.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const renderWithHashtags = (text = "") => {
  if (!text) return null;

  const hashtagRegex = /#[\w]+/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "hashtag", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  if (!segments.length) {
    return text;
  }

  return segments.map((segment, index) =>
    segment.type === "hashtag" ? (
      <span key={`hashtag-${index}`} className="text-blue-500 font-medium">
        {segment.value}
      </span>
    ) : (
      <React.Fragment key={`text-${index}`}>{segment.value}</React.Fragment>
    )
  );
};

export const Home = ({ user, onUserUpdated, onProfileHandlersReady }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [postPendingDeletion, setPostPendingDeletion] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favoritePostIds, setFavoritePostIds] = useState(() => new Set());
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [pendingLikes, setPendingLikes] = useState({});
  const [pendingComments, setPendingComments] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    title: "",
    content: "",
  });
  const [editingImageFile, setEditingImageFile] = useState(null);
  const [editingImagePreview, setEditingImagePreview] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const editingFileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (editingImagePreview) {
        URL.revokeObjectURL(editingImagePreview);
      }
    };
  }, [editingImagePreview]);

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  useEffect(() => {
    setProfileForm({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
    });
    setProfileImageFile(null);
    setProfileImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setRemoveProfileImage(false);
    setProfileImageInputKey((prev) => prev + 1);
    setOpenCommentsId(null);
    setCommentDrafts({});
    setPendingLikes({});
    setPendingComments({});
  }, [user]);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (
        !event.target.closest("[data-post-menu-trigger]") &&
        !event.target.closest("[data-post-menu-content]")
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setFetchError(null);
      const token = localStorage.getItem("token");

      const data = await fetchPostsApi(token);
      setPosts(data?.posts ?? []);
    } catch (error) {
      setFetchError(
        error.response?.data?.message || "Unable to load feed right now."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = useCallback(
    (createdPost) => {
      if (createdPost) {
        setPosts((prev) => [createdPost, ...prev]);
      } else {
        fetchPosts();
      }
    },
    [fetchPosts]
  );

  const storyItems = useMemo(() => {
    if (!posts.length) {
      return Array.from({ length: 8 }).map((_, index) => ({
        id: `placeholder-${index}`,
        name: index === 0 && user ? user.username : `Story ${index + 1}`,
        initials:
          index === 0 && user ? getInitials(user.username) : `S${index + 1}`,
        isUser: index === 0,
        gradient: getGradientForIndex(index),
        imageUrl: index === 0 && user ? user.profileImageUrl : undefined,
      }));
    }

    return posts.slice(0, 10).map((post, index) => ({
      id: post._id || index,
      name: post.author_id?.username || "Creator",
      initials: getInitials(post.author_id?.username || "C"),
      isUser: post.author_id?._id === user?._id,
      gradient: getGradientForIndex(index),
      imageUrl: post.author_id?.profileImageUrl,
    }));
  }, [posts, user]);

  const suggestedCreators = useMemo(() => {
    const fallback = [
      {
        id: "1",
        name: "Design Daily",
        description: "Creative sparks every day",
      },
      {
        id: "2",
        name: "Code Stories",
        description: "Full-stack snippets & tips",
      },
      {
        id: "3",
        name: "Mindful Moves",
        description: "Wellness & active living",
      },
    ];

    if (!posts.length) return fallback;

    const uniqueAuthors = posts.reduce((acc, post) => {
      const authorId = post.author_id?._id;
      if (!authorId || authorId === user?._id) return acc;
      if (acc.some((item) => item.id === authorId)) return acc;

      acc.push({
        id: authorId,
        name: post.author_id?.username || "Creator",
        description: post.title || "New on your feed",
        imageUrl: post.author_id?.profileImageUrl,
      });
      return acc;
    }, []);

    return uniqueAuthors.slice(0, 5).concat(fallback).slice(0, 5);
  }, [posts, user]);

  const handleBoostProfile = () => {
    toast.success("Profile boosted! More people will see your next post.", {
      icon: "🚀",
    });
  };

  const deleteDialogMessage = postPendingDeletion
    ? `This will permanently remove "${
        postPendingDeletion.title || "this post"
      }" from your feed.`
    : "This will permanently remove the post from your feed.";
  const clearProfileImageSelection = useCallback((keepRemovalFlag = false) => {
    setProfileImageFile(null);
    setProfileImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setProfileImageInputKey((prev) => prev + 1);
    if (!keepRemovalFlag) {
      setRemoveProfileImage(false);
    }
  }, []);

  const handleProfileImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, etc.).");
      clearProfileImageSelection();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      clearProfileImageSelection();
      return;
    }

    setProfileImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
    setProfileImageFile(file);
    setRemoveProfileImage(false);
  };

  const handleClearNewProfileImage = () => {
    clearProfileImageSelection();
  };

  const handleRemoveExistingProfileImage = () => {
    clearProfileImageSelection(true);
    setRemoveProfileImage(true);
  };

  const handleUndoRemoveProfileImage = () => {
    setRemoveProfileImage(false);
  };

  const handleOpenProfileModal = useCallback(() => {
    setProfileForm({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
    });
    clearProfileImageSelection();
    setIsProfileModalOpen(true);
  }, [user, clearProfileImageSelection]);

  const handleCloseProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
    setProfileForm((prev) => ({
      username: user?.username || prev.username,
      email: user?.email || prev.email,
      password: "",
    }));
    clearProfileImageSelection();
  }, [user, clearProfileImageSelection]);

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfileUpdate = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to update your profile.");
      return;
    }

    const username = profileForm.username.trim();
    const email = profileForm.email.trim();

    if (!username || !email) {
      toast.error("Username and email are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    if (profileForm.password.trim()) {
      formData.append("password", profileForm.password.trim());
    }

    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    } else if (removeProfileImage) {
      formData.append("removeProfileImage", "true");
    }

    try {
      setIsProfileSaving(true);
      const data = await updateCurrentUser(formData, token);
      const updatedUser = data?.user || data;
      if (updatedUser) {
        onUserUpdated?.(updatedUser);
      }

      toast.success(data?.message || "Profile updated");
      handleCloseProfileModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update profile right now."
      );
    } finally {
      setIsProfileSaving(false);
    }
  };

  useEffect(() => {
    onProfileHandlersReady?.({ open: handleOpenProfileModal });
    return () => {
      onProfileHandlersReady?.({ open: null });
    };
  }, [onProfileHandlersReady, handleOpenProfileModal]);

  const handleMenuToggle = (event, postId) => {
    event.stopPropagation();
    setOpenMenuId((prev) => (prev === postId ? null : postId));
  };

  const handleToggleFavorite = (postId) => {
    let toastMessage = "";
    setFavoritePostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        toastMessage = "Removed from favorites";
      } else {
        next.add(postId);
        toastMessage = "Added to favorites";
      }
      return next;
    });

    if (toastMessage) {
      toast.success(toastMessage);
    }

    setOpenMenuId(null);
  };

  const handleToggleComments = (postId) => {
    setOpenCommentsId((prev) => (prev === postId ? null : postId));
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleToggleLike = async (postId) => {
    if (!user) {
      toast.error("You need to be logged in to like posts.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to like posts.");
      return;
    }

    if (pendingLikes[postId]) return;

    setPendingLikes((prev) => ({ ...prev, [postId]: true }));

    try {
      const data = await toggleLikeApi(postId, token);
      const updatedPost = data?.post;
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          )
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update like right now."
      );
    } finally {
      setPendingLikes((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    }
  };

  const handleSubmitComment = async (event, postId) => {
    event.preventDefault();

    if (!user) {
      toast.error("You need to be logged in to comment.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to comment.");
      return;
    }

    const rawDraft = commentDrafts[postId] || "";
    const text = rawDraft.trim();

    if (!text) {
      toast.error("Add a message before posting your comment.");
      return;
    }

    setPendingComments((prev) => ({ ...prev, [postId]: true }));

    try {
      const data = await addCommentApi(
        postId,
        { text },
        token
      );

      const updatedPost = data?.post;
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          )
        );
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not add comment right now."
      );
    } finally {
      setPendingComments((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    }
  };

  const handleRequestDeletePost = (post) => {
    if (!post?._id) return;
    setPostPendingDeletion(post);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCancelDeletePost = () => {
    setIsDeleteModalOpen(false);
    setPostPendingDeletion(null);
  };

  const handleConfirmDeletePost = async () => {
    const postId = postPendingDeletion?._id;
    if (!postId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to be logged in to delete this post.");
      return;
    }

    try {
      setDeletingPostId(postId);
      await deletePostApi(postId, token);

      toast.success("Post deleted");
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not delete the post. Try again!"
      );
    } finally {
      setDeletingPostId(null);
      setPostPendingDeletion(null);
      setIsDeleteModalOpen(false);
    }
  };

  if (!user) {
    return <Landing />;
  }

  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setEditingFields({
      title: post.title || "",
      content: post.content || "",
    });
    setRemoveExistingImage(false);
    setEditingImageFile(null);
    setEditingImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (editingFileInputRef.current) {
      editingFileInputRef.current.value = "";
    }
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingFields({ title: "", content: "" });
    setRemoveExistingImage(false);
    setEditingImageFile(null);
    setEditingImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (editingFileInputRef.current) {
      editingFileInputRef.current.value = "";
    }
  };

  const handleEditingImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, etc.).");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setEditingImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    setRemoveExistingImage(false);
    const previewUrl = URL.createObjectURL(file);
    setEditingImageFile(file);
    setEditingImagePreview(previewUrl);
  };

  const handleRemoveEditingImage = () => {
    setEditingImageFile(null);
    setEditingImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (editingFileInputRef.current) {
      editingFileInputRef.current.value = "";
    }
  };

  const handleUpdatePost = async (event) => {
    event.preventDefault();
    if (!editingPostId) return;

    const title = editingFields.title.trim();
    const content = editingFields.content.trim();

    if (!title || !content) {
      toast.error("Title and content are required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to edit this post.");
      return;
    }

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (editingImageFile) {
        formData.append("image", editingImageFile);
      } else if (removeExistingImage) {
        formData.append("removeImage", "true");
      }

      const data = await updatePostApi(editingPostId, formData, token);
      const updatedPost = data?.post;
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          )
        );
      } else {
        fetchPosts();
      }
      toast.success("Post updated");
      handleCancelEdit();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update the post. Try again!"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-gray-100/60 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col gap-2">
          <span className="uppercase tracking-[0.4em] text-xs text-gray-500">
            Daily Feed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Catch up with creators you follow and share something new.
          </p>
        </header>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Stories</h2>
            <span className="text-xs font-medium text-pink-500">LIVE</span>
          </div>
          <div className="overflow-x-auto flex gap-5 pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {storyItems.map((story, index) => (
              <button
                key={story.id || index}
                type="button"
                className="flex flex-col items-center space-y-2 focus:outline-none"
              >
                <span
                  className={`relative h-20 w-20 rounded-full p-[3px] bg-linear-to-tr ${story.gradient}`}
                >
                  <span className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
                  <span className="relative h-full w-full flex items-center justify-center rounded-full bg-white text-gray-800 font-semibold text-xl overflow-hidden">
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt={`${story.name} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      story.initials
                    )}
                  </span>
                  {story.isUser && (
                    <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl">
                      +
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-gray-600 max-w-[80px] truncate">
                  {story.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-8">
          <div className="space-y-6 flex flex-col items-center">
            <CreatePostComposer
              user={user}
              onPostCreated={handlePostCreated}
              onPostCreatedFallback={fetchPosts}
            />

            <div className="space-y-5">
              {loading && (
                <div className="space-y-3 w-full flex flex-col items-center">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-sm p-6 animate-pulse max-w-xl w-full"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 bg-gray-200 rounded-full" />
                          <div className="h-3 w-1/4 bg-gray-200 rounded-full" />
                        </div>
                      </div>
                      <div className="h-48 rounded-xl bg-gray-200" />
                    </div>
                  ))}
                </div>
              )}

              {fetchError && !loading && (
                <div className="bg-white border border-red-100 rounded-2xl p-6 text-red-500 text-sm max-w-xl w-full">
                  {fetchError}
                  <button
                    type="button"
                    onClick={fetchPosts}
                    className="ml-3 text-red-600 underline font-medium"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !posts.length && !fetchError && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center space-y-3 max-w-xl w-full">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Your feed is waiting
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Follow more creators or share something to see it appear
                    here.
                  </p>
                  <button
                    type="button"
                    onClick={handleBoostProfile}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                  >
                    Boost your profile
                  </button>
                </div>
              )}

              {posts.map((post, index) => {
                const authorName =
                  post.author_id?.username || "Unknown creator";
                const authorImageUrl = post.author_id?.profileImageUrl;
                const createdLabel = relativeTimeFromNow(post.createdAt);
                const backgroundGradient = getGradientForIndex(index);
                const isFavorited = favoritePostIds.has(post._id);
                const currentUserId = user?._id || user?.id;
                const postAuthorId =
                  (post &&
                    typeof post.author_id === "string" &&
                    post.author_id) ||
                  post.author_id?._id ||
                  post.author_id?.id;
                const isOwner =
                  currentUserId && postAuthorId
                    ? String(currentUserId) === String(postAuthorId)
                    : false;
                const isDeleting = deletingPostId === post._id;
                const isEditing = editingPostId === post._id;
                const likesArray = Array.isArray(post.likes) ? post.likes : [];
                const commentsArray = Array.isArray(post.comments)
                  ? post.comments
                  : [];
                const likesCount = likesArray.length;
                const commentsCount = commentsArray.length;
                const hasLiked =
                  likesArray.length > 0 && currentUserId
                    ? likesArray.some((like) => {
                        const likeId =
                          typeof like === "string"
                            ? like
                            : like?._id || like?.id || like;
                        return (
                          likeId && String(likeId) === String(currentUserId)
                        );
                      })
                    : false;
                const isCommentsOpen = openCommentsId === post._id;
                const commentDraft = commentDrafts[post._id] || "";
                const isLiking = !!pendingLikes[post._id];
                const isSubmittingComment = !!pendingComments[post._id];

                return (
                  <article
                    key={post._id || index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-xl w-full"
                  >
                    <header className="flex items-center gap-4 px-6 py-4 relative">
                      <div
                        className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-lg ${
                          authorImageUrl
                            ? ""
                            : `bg-linear-to-br ${backgroundGradient} text-white`
                        }`}
                      >
                        {authorImageUrl ? (
                          <img
                            src={authorImageUrl}
                            alt={`${authorName} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(authorName)
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {authorName}
                        </h3>
                        <p className="text-xs text-gray-500">{createdLabel}</p>
                      </div>
                      {isEditing ? (
                        <span className="text-xs font-semibold text-blue-500 uppercase">
                          Editing
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-post-menu-trigger
                          onClick={(event) => handleMenuToggle(event, post._id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-lg">•••</span>
                        </button>
                      )}

                      {!isEditing && openMenuId === post._id && (
                        <div
                          data-post-menu-content
                          className="absolute top-14 right-6 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-10"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(post._id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span>
                              {isFavorited
                                ? "Remove favorite"
                                : "Add to favorites"}
                            </span>
                            <span className="text-base">
                              {isFavorited ? "★" : "☆"}
                            </span>
                          </button>
                          {isOwner && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(post)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                              >
                                <span>Edit post</span>
                                <span>✏️</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestDeletePost(post)}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={isDeleting}
                              >
                                <span>
                                  {isDeleting ? "Deleting…" : "Delete post"}
                                </span>
                                <span>🗑️</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </header>

                    {isEditing ? (
                      <form
                        onSubmit={handleUpdatePost}
                        className="px-6 py-5 space-y-5 bg-gray-50/70 border-t border-gray-100"
                      >
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingFields.title}
                            onChange={(event) =>
                              setEditingFields((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-500"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Content
                          </label>
                          <textarea
                            rows={4}
                            value={editingFields.content}
                            onChange={(event) =>
                              setEditingFields((prev) => ({
                                ...prev,
                                content: event.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-gray-500 resize-none"
                          />
                        </div>
                        <div className="border border-dashed border-gray-300 rounded-xl px-4 py-4 bg-white/60">
                          {editingImagePreview ? (
                            <div
                              className="relative overflow-hidden rounded-lg"
                              style={{ aspectRatio: "1 / 1" }}
                            >
                              <img
                                src={editingImagePreview}
                                alt="New image preview"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveEditingImage}
                                className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition"
                              >
                                Remove
                              </button>
                            </div>
                          ) : !removeExistingImage && post.imageUrl ? (
                            <div
                              className="relative overflow-hidden rounded-lg"
                              style={{ aspectRatio: "1 / 1" }}
                            >
                              <img
                                src={post.imageUrl}
                                alt={post.title || "Current post image"}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingFileInputRef.current) {
                                      editingFileInputRef.current.click();
                                    }
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 rounded-full shadow-sm hover:bg-gray-100"
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRemoveExistingImage(true)}
                                  className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor={`edit-image-${post._id}`}
                              className="flex flex-col items-center justify-center text-sm text-gray-500 gap-2 cursor-pointer hover:text-gray-700"
                              style={{ aspectRatio: "1 / 1" }}
                            >
                              <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white text-gray-400 text-2xl border border-gray-200">
                                📷
                              </span>
                              <span className="font-medium">
                                Add an image (optional)
                              </span>
                              <span className="text-xs text-gray-400">
                                JPG, PNG up to 5MB
                              </span>
                              <input
                                id={`edit-image-${post._id}`}
                                ref={editingFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleEditingImageChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? "Saving…" : "Save changes"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {post.imageUrl ? (
                          <div
                            className="relative bg-black overflow-hidden"
                            style={{ aspectRatio: "1 / 1" }}
                          >
                            <img
                              src={post.imageUrl}
                              alt={post.title || "Post image"}
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/15" />
                          </div>
                        ) : (
                          <div
                            className={`relative bg-linear-to-br ${backgroundGradient}`}
                            style={{ aspectRatio: "1 / 1" }}
                          >
                            <div className="absolute inset-0 bg-black/10 mix-blend-multiply rounded-none" />
                          </div>
                        )}

                        <section className="px-6 py-5 space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {post.title}
                          </h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {renderWithHashtags(post.content)}
                          </p>
                          <div className="flex items-center justify-start gap-6 text-sm text-gray-500">
                            <button
                              type="button"
                              onClick={() => handleToggleLike(post._id)}
                              disabled={isLiking}
                              className={`inline-flex items-center gap-2 transition text-base ${
                                hasLiked
                                  ? "text-red-500"
                                  : "hover:text-gray-700"
                              } ${
                                isLiking ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                            >
                              <span className="text-2xl leading-none">
                                {hasLiked ? "❤️" : "🤍"}
                              </span>
                              <span className="font-medium">{likesCount}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleComments(post._id)}
                              className={`inline-flex items-center gap-2 transition text-base ${
                                isCommentsOpen
                                  ? "text-blue-500"
                                  : "hover:text-gray-700"
                              }`}
                            >
                              <span className="text-2xl leading-none">💬</span>
                              <span className="font-medium">
                                {commentsCount}
                              </span>
                            </button>
                            <span className="inline-flex items-center gap-2 text-gray-400 text-base">
                              <span className="text-2xl leading-none">🔁</span>
                              <span className="font-medium">
                                {Math.floor(Math.random() * 10) + 1}
                              </span>
                            </span>
                          </div>

                          {isCommentsOpen && (
                            <div className="border-t border-gray-100 pt-4 space-y-4">
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {commentsCount ? (
                                  commentsArray.map((comment, commentIndex) => {
                                    const commentUser = comment.user;
                                    const commentAuthorName =
                                      (typeof commentUser === "object" &&
                                        commentUser?.username) ||
                                      "Anonymous";
                                    const commentAvatarUrl =
                                      typeof commentUser === "object"
                                        ? commentUser?.profileImageUrl
                                        : null;
                                    const commentGradient = getGradientForIndex(
                                      commentIndex + index
                                    );
                                    return (
                                      <div
                                        key={comment._id || commentIndex}
                                        className="flex gap-3"
                                      >
                                        <div
                                          className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold ${
                                            commentAvatarUrl
                                              ? ""
                                              : `bg-linear-to-br ${commentGradient} text-white`
                                          }`}
                                        >
                                          {commentAvatarUrl ? (
                                            <img
                                              src={commentAvatarUrl}
                                              alt={`${commentAuthorName} avatar`}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            getInitials(commentAuthorName)
                                          )}
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 space-y-1">
                                          <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-semibold text-gray-700">
                                              {commentAuthorName}
                                            </span>
                                            <span>
                                              {relativeTimeFromNow(
                                                comment.createdAt
                                              )}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700 whitespace-pre-line">
                                            {renderWithHashtags(comment.text)}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Be the first to comment on this post.
                                  </p>
                                )}
                              </div>
                              <form
                                onSubmit={(event) =>
                                  handleSubmitComment(event, post._id)
                                }
                                className="flex items-center gap-3"
                              >
                                <input
                                  type="text"
                                  value={commentDraft}
                                  onChange={(event) =>
                                    handleCommentDraftChange(
                                      post._id,
                                      event.target.value
                                    )
                                  }
                                  placeholder="Add a comment..."
                                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:border-gray-400 focus:outline-none"
                                  maxLength={500}
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingComment}
                                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {isSubmittingComment ? "Posting…" : "Post"}
                                </button>
                              </form>
                            </div>
                          )}
                        </section>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center font-semibold text-lg ${
                    user?.profileImageUrl
                      ? ""
                      : "bg-linear-to-br from-blue-500 to-indigo-500 text-white"
                  }`}
                >
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={`${user.username} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(user.username)
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Suggested for you
              </h3>
              <div className="space-y-4">
                {suggestedCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full overflow-hidden flex items-center justify-center font-semibold ${
                          creator.imageUrl ? "" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {creator.imageUrl ? (
                          <img
                            src={creator.imageUrl}
                            alt={`${creator.name} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(creator.name)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {creator.name}
                        </p>
                        <p className="text-xs text-gray-400 max-w-[160px]">
                          {creator.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-500"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="text-xs text-gray-400 underline">
                See all suggestions
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3 text-xs text-gray-400">
              <p>© {new Date().getFullYear()} Social Moments</p>
              <div className="flex gap-3">
                <button type="button" className="hover:text-gray-600">
                  About
                </button>
                <button type="button" className="hover:text-gray-600">
                  Help
                </button>
                <button type="button" className="hover:text-gray-600">
                  API
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        form={profileForm}
        onChange={handleProfileFieldChange}
        onSubmit={handleSubmitProfileUpdate}
        onClose={handleCloseProfileModal}
        isSaving={isProfileSaving}
        profileImageUrl={user?.profileImageUrl || ""}
        profileImagePreview={profileImagePreview}
        removeProfileImage={removeProfileImage}
        onProfileImageSelect={handleProfileImageSelect}
        onClearNewProfileImage={handleClearNewProfileImage}
        onRemoveProfileImage={handleRemoveExistingProfileImage}
        onUndoRemoveProfileImage={handleUndoRemoveProfileImage}
        profileImageInputKey={profileImageInputKey}
      />
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete post?"
        message={deleteDialogMessage}
        confirmLabel="Delete"
        cancelLabel="Keep post"
        onConfirm={handleConfirmDeletePost}
        onCancel={handleCancelDeletePost}
        loading={
          !!postPendingDeletion &&
          deletingPostId === postPendingDeletion._id
        }
      />
    </div>
  );
};
