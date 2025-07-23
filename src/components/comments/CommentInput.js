import React, { useState, useRef, useEffect } from "react";
import { Send, AtSign } from "lucide-react";
import "./CommentInput.css";

const CommentInput = ({ onSubmit, users, placeholder = "Add a comment..." }) => {
  const [content, setContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentions, setMentions] = useState([]);
  const textareaRef = useRef(null);
  const mentionDropdownRef = useRef(null);

  // Filter users based on mention query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(mentionQuery.toLowerCase());
  }).slice(0, 5); // Limit to 5 suggestions

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setSelectedMentionIndex(0);
      
      // Calculate position for dropdown
      const textarea = textareaRef.current;
      const textMetrics = getTextMetrics(textBeforeCursor, textarea);
      setMentionPosition({
        top: textMetrics.height + 5,
        left: textMetrics.width
      });
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  // Get text metrics for positioning dropdown
  const getTextMetrics = (text, textarea) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const computedStyle = window.getComputedStyle(textarea);
    
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    
    const lines = text.split('\n');
    const lineHeight = parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.2;
    
    return {
      width: context.measureText(lines[lines.length - 1]).width + 10,
      height: (lines.length - 1) * lineHeight + 5
    };
  };

  // Handle key down events
  const handleKeyDown = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          selectMention(filteredUsers[selectedMentionIndex]);
          break;
        case 'Escape':
          setShowMentions(false);
          break;
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Select a mention
  const selectMention = (user) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    
    // Find the @ symbol position
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const beforeMention = content.substring(0, mentionStart);
    const mentionText = `@${user.firstName} ${user.lastName}`;
    
    const newContent = beforeMention + mentionText + ' ' + textAfterCursor;
    setContent(newContent);
    
    // Add to mentions array
    setMentions(prev => [...prev.filter(id => id !== user.id), user.id]);
    
    setShowMentions(false);
    setMentionQuery("");
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current.focus();
      const newCursorPosition = beforeMention.length + mentionText.length + 1;
      textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!content.trim()) return;
    
    onSubmit(content, mentions);
    setContent("");
    setMentions([]);
    setShowMentions(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [content]);

  return (
    <div className="comment-input-container">
      <div className="comment-input-wrapper">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="comment-input"
          rows={1}
        />
        
        {showMentions && filteredUsers.length > 0 && (
          <div 
            ref={mentionDropdownRef}
            className="mention-dropdown"
            style={{
              top: mentionPosition.top,
              left: mentionPosition.left
            }}
          >
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                className={`mention-option ${index === selectedMentionIndex ? 'selected' : ''}`}
                onClick={() => selectMention(user)}
                onMouseEnter={() => setSelectedMentionIndex(index)}
              >
                <div className="mention-avatar">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="mention-info">
                  <div className="mention-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="mention-email">
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="comment-submit-btn"
          title="Send comment (Ctrl+Enter)"
        >
          <Send size={16} />
        </button>
      </div>
      
      <div className="comment-input-footer">
        <div className="comment-input-hint">
          <AtSign size={12} className="me-1" />
          Type @ to mention users • Ctrl+Enter to send
        </div>
      </div>
    </div>
  );
};

export default CommentInput;
