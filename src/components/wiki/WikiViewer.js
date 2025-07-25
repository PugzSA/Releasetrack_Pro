import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
// Mermaid will be loaded dynamically to avoid build issues
import { Edit3, FileText, Calendar, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./WikiViewer.css";

const WikiViewer = ({ page, onEdit, onPageSelect }) => {
  const { supabase } = useApp();
  const [wikiPages, setWikiPages] = useState([]);
  const [processedContent, setProcessedContent] = useState("");

  // Initialize Mermaid from CDN
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    const loadMermaid = () => {
      // Check if Mermaid is already loaded
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });
        setMermaidLoaded(true);
        return;
      }

      // Load Mermaid from CDN
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js";
      script.onload = () => {
        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
            fontFamily: "inherit",
          });
          setMermaidLoaded(true);
        }
      };
      script.onerror = () => {
        console.error("Failed to load Mermaid from CDN");
      };
      document.head.appendChild(script);
    };

    loadMermaid();
  }, []);
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

  // Process content to handle internal links and image sizing
  const processInternalLinks = useCallback(
    (content) => {
      if (!content) return content;

      // First, handle image sizing syntax
      let processedContent = content.replace(
        /!\[([^\]]*)\]\(([^)]+)\)\{width=(\d+)px\}/g,
        (match, altText, url, width) => {
          return `<img src="${url}" alt="${altText}" style="max-width: ${width}px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
        }
      );

      // Then handle regular images (without sizing) to add default styling
      processedContent = processedContent.replace(
        /!\[([^\]]*)\]\(([^)]+)\)(?!\{)/g,
        (match, altText, url) => {
          return `<img src="${url}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
        }
      );

      // Finally, handle internal links
      processedContent = processedContent.replace(
        /\[\[([^\]]+)\]\]/g,
        (match, pageName) => {
          const targetPage = wikiPages.find(
            (p) =>
              p.title.toLowerCase() === pageName.toLowerCase() && !p.is_folder
          );

          if (targetPage) {
            // Create HTML link with data attributes for React to handle
            return `<a href="#" data-internal-link="${targetPage.id}" class="internal-link">${pageName}</a>`;
          } else {
            // Page doesn't exist - show as broken link
            return `<a href="#" data-broken-link="${pageName}" class="broken-link">${pageName}</a>`;
          }
        }
      );

      return processedContent;
    },
    [wikiPages]
  );

  // Process content when page or wikiPages change
  useEffect(() => {
    if (page && page.content && wikiPages.length > 0) {
      const processed = processInternalLinks(page.content);
      setProcessedContent(processed);
    } else if (page && page.content) {
      setProcessedContent(page.content);
    } else {
      setProcessedContent("");
    }
  }, [page, wikiPages, processInternalLinks]);

  // Handle clicks on internal links
  const handleContentClick = (e) => {
    const target = e.target;

    // Handle internal links
    if (target.hasAttribute("data-internal-link")) {
      e.preventDefault();
      const pageId = target.getAttribute("data-internal-link");
      const targetPage = wikiPages.find((p) => p.id === pageId);

      if (targetPage && onPageSelect) {
        onPageSelect(targetPage);
      }
    }

    // Handle broken links
    if (target.hasAttribute("data-broken-link")) {
      e.preventDefault();
      // Could show a toast or modal here for broken links
    }
  };

  // Mermaid diagram component
  const MermaidDiagram = ({ chart }) => {
    const [svg, setSvg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const renderDiagram = async () => {
        if (!mermaidLoaded || !chart) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await window.mermaid.render(id, chart);
          setSvg(svg);
          setError("");
        } catch (err) {
          setError(`Mermaid Error: ${err.message}`);
          setSvg("");
        } finally {
          setLoading(false);
        }
      };

      renderDiagram();
    }, [chart, mermaidLoaded]);

    if (loading) {
      return (
        <div className="mermaid-loading">
          <p>Loading diagram...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mermaid-error">
          <p>⚠️ {error}</p>
          <pre>{chart}</pre>
        </div>
      );
    }

    if (!svg) {
      return (
        <div className="mermaid-error">
          <p>⚠️ Failed to render diagram</p>
          <pre>{chart}</pre>
        </div>
      );
    }

    return (
      <div
        className="mermaid-diagram"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  };

  if (!page) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="wiki-viewer">
      <div className="viewer-header">
        <div className="page-info">
          <div className="page-title">
            <FileText size={24} className="me-2" />
            <h1>{page.title}</h1>
          </div>
          <div className="page-meta">
            <div className="meta-item">
              <Calendar size={14} className="me-1" />
              <span>Updated {formatDate(page.updated_at)}</span>
            </div>
            {page.created_at !== page.updated_at && (
              <div className="meta-item">
                <span className="text-muted">
                  Created {formatDate(page.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="viewer-actions">
          <button
            className="btn btn-outline-primary"
            onClick={onEdit}
            title="Edit this page"
          >
            <Edit3 size={16} className="me-1" />
            Edit
          </button>
        </div>
      </div>

      <div className="viewer-content">
        {page.content && page.content.trim() ? (
          <div className="markdown-content" onClick={handleContentClick}>
            <ReactMarkdown
              key={`${page.id}-${wikiPages.length}`}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const code = String(children).replace(/\n$/, "");

                  // Handle Mermaid diagrams
                  if (language === "mermaid") {
                    return <MermaidDiagram chart={code} />;
                  }

                  // Handle regular code blocks
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={language}
                      PreTag="div"
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Handle external links only (internal links are now HTML)
                a({ node, href, children, ...props }) {
                  if (!href) return <a {...props}>{children}</a>;

                  // Handle external links
                  let finalHref = href;
                  let isExternal = false;

                  if (
                    href.startsWith("http://") ||
                    href.startsWith("https://")
                  ) {
                    // Already has protocol
                    isExternal = true;
                  } else if (
                    href.startsWith("www.") ||
                    href.includes(".com") ||
                    href.includes(".org") ||
                    href.includes(".net") ||
                    href.includes(".edu") ||
                    href.includes(".gov")
                  ) {
                    // Looks like an external domain without protocol
                    finalHref = `https://${href}`;
                    isExternal = true;
                  } else if (
                    href.startsWith("/") ||
                    href.startsWith("#") ||
                    href.startsWith("mailto:") ||
                    href.startsWith("tel:")
                  ) {
                    // Internal link, anchor, or special protocol
                    isExternal = false;
                  } else {
                    // Assume it's an external domain if it contains a dot
                    if (href.includes(".")) {
                      finalHref = `https://${href}`;
                      isExternal = true;
                    }
                  }

                  return (
                    <a
                      href={finalHref}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                // Add table wrapper for responsive tables
                table({ children, ...props }) {
                  return (
                    <div className="table-wrapper">
                      <table {...props}>{children}</table>
                    </div>
                  );
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="empty-content">
            <FileText size={48} className="empty-icon" />
            <h3>This page is empty</h3>
            <p>Click the Edit button to add content to this page.</p>
            <button className="btn btn-primary" onClick={onEdit}>
              <Edit3 size={16} className="me-2" />
              Start Editing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WikiViewer;
