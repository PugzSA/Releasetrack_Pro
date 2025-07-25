import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Save,
  X,
  Eye,
  Edit3,
  Type,
  Code,
  Link2,
  Image,
  BarChart3,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./WikiEditor.css";

const WikiEditor = ({ page, onSave, onCancel }) => {
  const { supabase } = useApp();
  const [title, setTitle] = useState(page?.title || "");
  const [content, setContent] = useState(page?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [wikiPages, setWikiPages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
  });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState(new Set());
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setContent(page.content || "");
      setHasChanges(false);
    }
  }, [page]);

  // Fetch all wiki pages for internal linking
  useEffect(() => {
    const fetchWikiPages = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("wiki_pages")
          .select("id, title, slug, is_folder")
          .order("title");

        if (error) throw error;
        setWikiPages(data || []);
      } catch (err) {
        console.error("Error fetching wiki pages:", err);
      }
    };

    fetchWikiPages();
  }, [supabase]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions) {
        // Check if click is not on textarea or suggestion items
        const isTextarea =
          textareaRef.current && textareaRef.current.contains(event.target);
        const isSuggestion = event.target.closest(".link-suggestions");

        if (!isTextarea && !isSuggestion) {
          setShowSuggestions(false);
          setSelectedSuggestionIndex(0);
        }
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSuggestions]);

  useEffect(() => {
    const hasContentChanges = content !== (page?.content || "");
    const hasTitleChanges = title !== (page?.title || "");
    setHasChanges(hasContentChanges || hasTitleChanges);
  }, [title, content, page]);

  // Handle internal link suggestions
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check for internal link syntax [[
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPos);

    // Look for [[ pattern
    const linkMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/);

    if (linkMatch) {
      const searchTerm = linkMatch[1].toLowerCase();

      const filteredPages = wikiPages
        .filter(
          (p) =>
            !p.is_folder &&
            p.id !== page?.id && // Don't suggest current page
            p.title.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5); // Limit to 5 suggestions

      if (filteredPages.length > 0) {
        // Calculate position for suggestions dropdown
        const rect = textarea.getBoundingClientRect();
        const lineHeight = 20; // Approximate line height
        const lines = textBeforeCursor.split("\n").length - 1;

        setSuggestions(filteredPages);
        setSuggestionPosition({
          top: rect.top + lines * lineHeight + 25,
          left: rect.left + 10,
        });
        setSelectedSuggestionIndex(0); // Reset to first suggestion
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(0);
    }
  };

  const insertSuggestion = (selectedPage) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);

    // Find the last occurrence of [[ before cursor
    const lastBracketIndex = textBeforeCursor.lastIndexOf("[[");

    if (lastBracketIndex !== -1) {
      const beforeLink = textBeforeCursor.substring(0, lastBracketIndex);
      const newContent =
        beforeLink + `[[${selectedPage.title}]]` + textAfterCursor;

      setContent(newContent);

      // Position cursor after the inserted link
      setTimeout(() => {
        const newCursorPos = beforeLink.length + selectedPage.title.length + 4; // 4 for [[]]
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 10);
    }

    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[selectedSuggestionIndex]) {
          insertSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(0);
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title for the page");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(page.id, {
        title: title.trim(),
        content: content,
      });
    } catch (error) {
      console.error("Error saving page:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        // Clean up any unused images before canceling
        await deleteUnusedImages(page?.content || "", content);
        setTitle(page?.title || "");
        setContent(page?.content || "");
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const insertMarkdown = (before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = before + selectedText + after;
    const newContent =
      content.substring(0, start) + newText + content.substring(end);

    setContent(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos =
        start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    // If text is selected, use it as link text, otherwise use placeholder
    const linkText = selectedText || "Link Text";
    const linkUrl = "https://example.com";

    const newText = `[${linkText}](${linkUrl})`;
    const newContent =
      content.substring(0, start) + newText + content.substring(end);

    setContent(newContent);

    // Set cursor to select the URL part for easy editing
    setTimeout(() => {
      const urlStart = start + linkText.length + 3; // After "[linkText]("
      const urlEnd = urlStart + linkUrl.length;
      textarea.setSelectionRange(urlStart, urlEnd);
      textarea.focus();
    }, 0);
  };

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const codeBlock = selectedText
      ? `\`\`\`\n${selectedText}\n\`\`\``
      : `\`\`\`javascript\n// Your code here\n\`\`\``;

    const newContent =
      content.substring(0, start) + codeBlock + content.substring(end);
    setContent(newContent);

    // Position cursor inside the code block
    setTimeout(() => {
      const newCursorPos = selectedText ? start + codeBlock.length : start + 15; // After "```javascript\n"
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const insertTable = () => {
    const tableMarkdown = `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`;

    insertMarkdown(tableMarkdown);
  };

  const insertQuote = () => {
    insertMarkdown("> ");
  };

  const insertHorizontalRule = () => {
    insertMarkdown("\n---\n");
  };

  const insertTaskList = () => {
    insertMarkdown("- [ ] ");
  };

  const insertInternalLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    // If text is selected, use it as link text, otherwise use placeholder
    const linkText = selectedText || "Page Name";
    const newText = `[[${linkText}]]`;
    const newContent =
      content.substring(0, start) + newText + content.substring(end);

    setContent(newContent);

    // Set cursor to select the page name for easy editing
    setTimeout(() => {
      const nameStart = start + 2; // After "[["
      const nameEnd = nameStart + linkText.length;
      textarea.setSelectionRange(nameStart, nameEnd);
      textarea.focus();
    }, 0);
  };

  const handleImageUpload = async (file) => {
    if (!file || !supabase) return;

    setIsUploadingImage(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const filePath = `wiki-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("wiki-attachments")
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("wiki-attachments").getPublicUrl(filePath);

      // Insert image markdown at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![${file.name}](${publicUrl}){width=500px}`;
        const newContent =
          content.substring(0, start) + imageMarkdown + content.substring(end);

        setContent(newContent);

        // Track uploaded image
        setUploadedImages((prev) => new Set([...prev, publicUrl]));

        // Position cursor after the inserted image
        setTimeout(() => {
          const newCursorPos = start + imageMarkdown.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }, 0);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      let errorMessage = "Failed to upload image. Please try again.";

      if (error.message?.includes("Bucket not found")) {
        errorMessage =
          "Storage bucket not configured. Please contact your administrator.";
      } else if (error.message?.includes("File size")) {
        errorMessage = "File is too large. Please choose an image under 50MB.";
      } else if (error.message?.includes("mime type")) {
        errorMessage =
          "Invalid file type. Please choose a JPEG, PNG, GIF, WebP, or SVG image.";
      }

      alert(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const insertMermaidDiagram = () => {
    const mermaidTemplate = `\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\``;

    insertMarkdown(mermaidTemplate);
  };

  const resizeSelectedImage = (size) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    // Check if selected text is an image markdown
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\s*\{[^}]*\})?/;
    const match = selectedText.match(imageRegex);

    if (match) {
      const [fullMatch, altText, url] = match;
      let newImageMarkdown;

      switch (size) {
        case "small":
          newImageMarkdown = `![${altText}](${url}){width=300px}`;
          break;
        case "medium":
          newImageMarkdown = `![${altText}](${url}){width=500px}`;
          break;
        case "large":
          newImageMarkdown = `![${altText}](${url}){width=800px}`;
          break;
        case "full":
          newImageMarkdown = `![${altText}](${url})`;
          break;
        default:
          return;
      }

      const newContent =
        content.substring(0, start) + newImageMarkdown + content.substring(end);
      setContent(newContent);

      // Keep the image selected
      setTimeout(() => {
        textarea.setSelectionRange(start, start + newImageMarkdown.length);
        textarea.focus();
      }, 0);
    } else {
      alert("Please select an image (![alt](url)) to resize.");
    }
  };

  const insertImageSmall = () => resizeSelectedImage("small");
  const insertImageMedium = () => resizeSelectedImage("medium");
  const insertImageLarge = () => resizeSelectedImage("large");
  const insertImageFull = () => resizeSelectedImage("full");

  // Alignment functions for both text and images
  const alignContent = (alignment) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let selectedText = content.substring(start, end);

    if (!selectedText.trim()) {
      alert("Please select some text or an image to align.");
      return;
    }

    // Check if it's an image
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?/;
    const isImage = imageRegex.test(selectedText);

    let alignedContent;

    // Remove any existing alignment wrapper from the selection
    selectedText = selectedText.replace(
      /<div style="text-align: (left|center|right);">/g,
      ""
    );
    selectedText = selectedText.replace(
      /<div class="image-align-(left|center|right)">/g,
      ""
    );
    selectedText = selectedText.replace(/<\/div>/g, "");
    selectedText = selectedText.trim();

    if (isImage) {
      // For images, use CSS classes for better control
      alignedContent = `<div class="image-align-${alignment}">${selectedText}</div>`;
    } else {
      // For text, use inline styles
      alignedContent = `<div style="text-align: ${alignment};">${selectedText}</div>`;
    }

    const newContent =
      content.substring(0, start) + alignedContent + content.substring(end);
    setContent(newContent);

    // Position cursor after the aligned content
    setTimeout(() => {
      const newCursorPos = start + alignedContent.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const alignLeft = () => alignContent("left");
  const alignCenter = () => alignContent("center");
  const alignRight = () => alignContent("right");

  // Process content for preview (handle image sizing and internal links)
  const processPreviewContent = useCallback((content) => {
    if (!content) return content;

    // Handle image sizing syntax - convert to HTML with inline styles
    let processedContent = content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)\{width=(\d+)px\}/g,
      (match, altText, url, width) => {
        return `<img src="${url}" alt="${altText}" style="max-width: ${width}px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
      }
    );

    // Handle regular images (without sizing) - default to 500px for preview
    processedContent = processedContent.replace(
      /!\[([^\]]*)\]\(([^)]+)\)(?!\{)/g,
      (match, altText, url) => {
        return `<img src="${url}" alt="${altText}" style="max-width: 500px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
      }
    );

    // Handle internal links (basic preview - won't be clickable in editor)
    processedContent = processedContent.replace(
      /\[\[([^\]]+)\]\]/g,
      (match, pageName) => {
        return `<a href="#" style="color: #28a745; text-decoration: none;">🔗 ${pageName}</a>`;
      }
    );

    return processedContent;
  }, []);

  // Extract image URLs from content
  const extractImageUrls = useCallback((content) => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?/g;
    const urls = new Set();
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const url = match[2];
      // Only track images from our storage bucket
      if (url.includes("wiki-attachments/wiki-images/")) {
        urls.add(url);
      }
    }

    return urls;
  }, []);

  // Delete unused images from storage
  const deleteUnusedImages = useCallback(
    async (previousContent, newContent) => {
      if (!supabase) return;

      const previousImages = extractImageUrls(previousContent || "");
      const currentImages = extractImageUrls(newContent || "");

      // Find images that were removed
      const removedImages = [...previousImages].filter(
        (url) => !currentImages.has(url)
      );

      for (const imageUrl of removedImages) {
        try {
          // Extract file path from URL
          const urlParts = imageUrl.split("/wiki-attachments/");
          if (urlParts.length === 2) {
            const filePath = urlParts[1];

            // Delete from Supabase Storage
            const { error } = await supabase.storage
              .from("wiki-attachments")
              .remove([filePath]);

            if (error) {
              console.error("Error deleting image:", error);
            } else {
              console.log("Deleted unused image:", filePath);
            }
          }
        } catch (error) {
          console.error("Error processing image deletion:", error);
        }
      }
    },
    [supabase, extractImageUrls]
  );

  // Track content changes for image cleanup
  const previousContentRef = useRef(content);

  // Handle image cleanup when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (previousContentRef.current !== content) {
        deleteUnusedImages(previousContentRef.current, content);
        previousContentRef.current = content;
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [content, deleteUnusedImages]);

  const markdownToolbar = [
    { icon: Type, label: "Heading", action: () => insertMarkdown("## ") },
    { icon: "B", label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: "I", label: "Italic", action: () => insertMarkdown("*", "*") },
    {
      icon: "~~",
      label: "Strikethrough",
      action: () => insertMarkdown("~~", "~~"),
    },
    {
      icon: Code,
      label: "Inline Code",
      action: () => insertMarkdown("`", "`"),
    },
    { icon: "{ }", label: "Code Block", action: insertCodeBlock },
    { icon: "[]", label: "External Link", action: insertLink },
    { icon: Link2, label: "Internal Link", action: insertInternalLink },
    { icon: Image, label: "Upload Image", action: insertImage },
    {
      icon: "S",
      label: "Resize Image Small (300px)",
      action: insertImageSmall,
      customClass: "size-btn-small",
    },
    {
      icon: "M",
      label: "Resize Image Medium (500px)",
      action: insertImageMedium,
      customClass: "size-btn-medium",
    },
    {
      icon: "L",
      label: "Resize Image Large (800px)",
      action: insertImageLarge,
      customClass: "size-btn-large",
    },
    { icon: BarChart3, label: "Mermaid Diagram", action: insertMermaidDiagram },
    { icon: "⬅", label: "Align Left", action: alignLeft },
    { icon: "⬛", label: "Align Center", action: alignCenter },
    { icon: "➡", label: "Align Right", action: alignRight },
    { icon: "•", label: "Bullet List", action: () => insertMarkdown("- ") },
    { icon: "1.", label: "Numbered List", action: () => insertMarkdown("1. ") },
    { icon: "✓", label: "Task List", action: insertTaskList },
    { icon: "❝", label: "Quote", action: insertQuote },
    { icon: "⊞", label: "Table", action: insertTable },
    { icon: "—", label: "Horizontal Rule", action: insertHorizontalRule },
  ];

  return (
    <div className="wiki-editor">
      <div className="editor-header">
        <div className="editor-title">
          <Edit3 size={20} className="me-2" />
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title..."
          />
        </div>
        <div className="editor-actions">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X size={16} className="me-1" />
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Save size={16} className="me-1" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="editor-toolbar">
        <div className="toolbar-group">
          {markdownToolbar.slice(0, 4).map((tool, index) => (
            <button
              key={index}
              className="toolbar-btn"
              onClick={tool.action}
              title={tool.label}
            >
              {typeof tool.icon === "string" ? (
                <span className="toolbar-text">{tool.icon}</span>
              ) : (
                <tool.icon size={16} />
              )}
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          {markdownToolbar.slice(4, 15).map((tool, index) => (
            <button
              key={index + 4}
              className={`toolbar-btn ${
                tool.label === "Upload Image" && isUploadingImage
                  ? "uploading"
                  : ""
              } ${tool.customClass || ""}`}
              onClick={tool.action}
              title={tool.label}
              disabled={tool.label === "Upload Image" && isUploadingImage}
            >
              {typeof tool.icon === "string" ? (
                <span className={`toolbar-text ${tool.customClass || ""}`}>
                  {tool.icon}
                </span>
              ) : (
                <tool.icon size={16} />
              )}
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          {markdownToolbar.slice(15).map((tool, index) => (
            <button
              key={index + 15}
              className="toolbar-btn"
              onClick={tool.action}
              title={tool.label}
            >
              {typeof tool.icon === "string" ? (
                <span className="toolbar-text">{tool.icon}</span>
              ) : (
                <tool.icon size={16} />
              )}
            </button>
          ))}
        </div>

        <div className="toolbar-help">
          Supports Markdown syntax •
          <a
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noopener noreferrer"
            className="help-link"
          >
            Help
          </a>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-pane">
          <div className="pane-header">
            <Edit3 size={16} className="me-2" />
            <span>Markdown Editor</span>
          </div>
          <textarea
            ref={textareaRef}
            className="markdown-textarea"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your page content in Markdown...

💡 Tips:
• Use [[Page Name]] to create internal links to other wiki pages
• Click 📷 to upload images (auto-sized to 500px)
• Select an image and click S/M/L buttons to resize (300px/500px/800px)
• Select text or images and use alignment buttons (⬅ ⬛ ➡) to position content
• Delete image markdown to auto-remove from storage
• Use ```mermaid to create diagrams and flowcharts"
            spellCheck="true"
          />
        </div>

        <div className="preview-pane">
          <div className="pane-header">
            <Eye size={16} className="me-2" />
            <span>Live Preview</span>
          </div>
          <div className="markdown-preview">
            {content.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {processPreviewContent(content)}
              </ReactMarkdown>
            ) : (
              <div className="preview-placeholder">
                <Eye size={32} className="placeholder-icon" />
                <p>Start typing to see your content preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="unsaved-indicator">
          <span className="unsaved-dot"></span>
          Unsaved changes
        </div>
      )}

      {/* Internal Link Suggestions */}
      {showSuggestions && (
        <div
          className="link-suggestions"
          style={{
            position: "fixed",
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            zIndex: 1000,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`suggestion-item ${
                index === selectedSuggestionIndex ? "selected" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                insertSuggestion(suggestion);
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <span className="suggestion-title">{suggestion.title}</span>
              <span className="suggestion-id">{suggestion.id}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
            e.target.value = ""; // Reset input
          }
        }}
      />
    </div>
  );
};

export default WikiEditor;
