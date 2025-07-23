import React, { useState, useEffect } from "react";
import { MessageCircle, Clock, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import CommentInput from "./CommentInput";
import emailService from "../../services/EmailService";
import "./CommentSection.css";

const CommentSection = ({ ticketId, ticket, users, showToast }) => {
  const { supabase, user } = useApp();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments for the ticket
  useEffect(() => {
    const fetchComments = async () => {
      if (!ticketId || !supabase) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [ticketId, supabase]);

  // Handle new comment creation
  const handleCommentSubmit = async (content, mentions) => {
    if (!content.trim() || !user) return;

    try {
      const commentData = {
        ticket_id: ticketId,
        user_id: user.id,
        user_email: user.email, // Store email for easier lookup
        content: content.trim(),
        mentions: mentions || [],
      };

      const { data, error } = await supabase
        .from("comments")
        .insert([commentData])
        .select("*")
        .single();

      if (error) throw error;

      // Add the new comment to the list
      setComments((prev) => [...prev, data]);

      // Send mention notifications if there are mentions
      if (mentions && mentions.length > 0) {
        try {
          console.log("Sending mention notifications for users:", mentions);

          // Initialize EmailService with Supabase if not already done
          if (!emailService.supabase) {
            emailService.supabase = supabase;
          }

          const emailResult = await emailService.sendMentionNotifications({
            mentionedUserIds: mentions,
            comment: data,
            ticket: ticket,
            commenter: user,
            allUsers: users,
          });

          if (emailResult.success && emailResult.summary) {
            const { sent, skipped } = emailResult.summary;
            if (sent > 0) {
              if (showToast) {
                showToast(
                  `Comment added and ${sent} mention notification${
                    sent > 1 ? "s" : ""
                  } sent`,
                  "success"
                );
              }
            } else if (skipped > 0) {
              if (showToast) {
                showToast(
                  "Comment added (mention notifications disabled for mentioned users)",
                  "success"
                );
              }
            }
          } else {
            if (showToast) {
              showToast("Comment added successfully", "success");
            }
          }
        } catch (emailError) {
          console.error("Error sending mention notifications:", emailError);
          if (showToast) {
            showToast(
              "Comment added (mention notifications failed to send)",
              "warning"
            );
          }
        }
      } else {
        if (showToast) {
          showToast("Comment added successfully", "success");
        }
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      if (showToast) {
        showToast("Failed to add comment", "error");
      }
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;

    return date.toLocaleDateString();
  };

  // Get user display name
  const getUserDisplayName = (comment) => {
    // If this is the current user's comment, use their info
    if (comment.user_id === user?.id) {
      if (user.user_metadata?.full_name) {
        return user.user_metadata.full_name;
      }
      if (user.user_metadata?.name) {
        return user.user_metadata.name;
      }
      if (user.email) {
        return user.email.split("@")[0];
      }
    }

    // For other users, try to find them in the users table by email
    // This is a workaround since we can't easily join auth.users with comments
    const matchingUser = users.find((u) => u.email === comment.user_email);
    if (matchingUser) {
      return `${matchingUser.firstName} ${matchingUser.lastName}`;
    }

    // Fallback to a generic display
    return `User ${comment.user_id.slice(0, 8)}`;
  };

  // Get user avatar initials
  const getUserInitials = (comment) => {
    const displayName = getUserDisplayName(comment);
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render comment content with mention highlighting
  const renderCommentContent = (content, mentions) => {
    if (!mentions || mentions.length === 0) {
      return content;
    }

    let processedContent = content;

    // Replace @mentions with highlighted spans
    mentions.forEach((userId) => {
      const mentionedUser = users.find((u) => u.id === userId);
      if (mentionedUser) {
        const mentionText = `@${mentionedUser.firstName} ${mentionedUser.lastName}`;
        const regex = new RegExp(
          `@${mentionedUser.firstName}\\s+${mentionedUser.lastName}`,
          "gi"
        );
        processedContent = processedContent.replace(
          regex,
          `<span class="comment-mention">${mentionText}</span>`
        );
      }
    });

    return <span dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  if (loading) {
    return (
      <div className="comment-section-loading">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="comment-section-error">
        <MessageCircle size={20} className="me-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <div className="d-flex align-items-center">
          <MessageCircle size={18} className="me-2 text-primary" />
          <h6 className="mb-0">Comments ({comments.length})</h6>
        </div>
      </div>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="empty-comments-state">
            <MessageCircle size={32} className="text-muted mb-2" />
            <p className="text-muted mb-0">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                <div className="avatar-circle">{getUserInitials(comment)}</div>
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">
                    {getUserDisplayName(comment)}
                  </span>
                  <span className="comment-timestamp">
                    <Clock size={12} className="me-1" />
                    {formatTimestamp(comment.created_at)}
                  </span>
                </div>
                <div className="comment-text">
                  {renderCommentContent(comment.content, comment.mentions)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="comment-input-section">
        <CommentInput
          onSubmit={handleCommentSubmit}
          users={users}
          placeholder="Add a comment..."
        />
      </div>
    </div>
  );
};

export default CommentSection;
