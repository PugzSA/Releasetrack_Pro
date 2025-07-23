import React from "react";
import { useApp } from "../../context/AppContext";
import { Dropdown, Image } from "react-bootstrap";
import "./UserAvatar.css";

const getCleanAvatarUrl = (url) => {
  if (!url) return null;
  try {
    // For Google URLs, we'll use a more reliable approach
    // Google avatar URLs often have CORS issues, so we'll be more conservative
    let cleanUrl = url;

    // Ensure HTTPS
    cleanUrl = cleanUrl.replace(/^http:/, "https:");

    // For Google URLs, try a simpler format that's more likely to work
    if (cleanUrl.includes("googleusercontent.com")) {
      // Remove existing size parameters and add a standard one
      cleanUrl = cleanUrl.replace(/=s\d+-c$/, "");
      cleanUrl = cleanUrl.replace(/=s\d+$/, "");
      cleanUrl = cleanUrl.replace(/=w\d+-h\d+$/, "");
      // Add a standard size parameter that Google typically supports
      cleanUrl = `${cleanUrl}=s96-c`;
    }

    return cleanUrl;
  } catch (error) {
    console.error("Error cleaning avatar URL:", error);
    return url;
  }
};

const UserAvatar = ({ size = 32 }) => {
  const { session, signOut } = useApp();
  const user = session?.user;
  const rawAvatarUrl =
    session?.user?.user_metadata?.picture ||
    session?.user?.user_metadata?.avatar_url;

  // State for managing avatar loading
  const [currentAvatarUrl, setCurrentAvatarUrl] = React.useState(
    getCleanAvatarUrl(rawAvatarUrl)
  );
  const [urlAttempt, setUrlAttempt] = React.useState(0);
  const [showPlaceholder, setShowPlaceholder] = React.useState(!rawAvatarUrl);
  const [imageLoadTimeout, setImageLoadTimeout] = React.useState(null);

  const userName =
    session?.user?.user_metadata?.full_name || session?.user?.email;

  // Generate alternative URLs to try for Google avatars
  const getAlternativeUrls = (originalUrl) => {
    if (!originalUrl) return [];

    // For Google URLs, try different size parameters
    if (originalUrl.includes("googleusercontent.com")) {
      const baseUrl = originalUrl.replace(/=.*$/, ""); // Remove all parameters
      return [
        `${baseUrl}=s96-c`, // Standard size with crop
        `${baseUrl}=s128-c`, // Larger size with crop
        `${baseUrl}=s64-c`, // Smaller size with crop
        `${baseUrl}=s96`, // Without crop
        baseUrl, // No parameters
      ];
    }

    // For non-Google URLs, return as-is
    return [originalUrl];
  };

  // Reset state when rawAvatarUrl changes
  React.useEffect(() => {
    // Clear any existing timeout
    if (imageLoadTimeout) {
      clearTimeout(imageLoadTimeout);
      setImageLoadTimeout(null);
    }

    if (rawAvatarUrl) {
      const cleanUrl = getCleanAvatarUrl(rawAvatarUrl);

      // For Google URLs that are known to be problematic, use a shorter timeout
      const isGoogleUrl = rawAvatarUrl.includes("googleusercontent.com");
      const timeoutDuration = isGoogleUrl ? 1500 : 3000; // Shorter timeout for Google URLs

      setCurrentAvatarUrl(cleanUrl);
      setUrlAttempt(0);
      setShowPlaceholder(false);

      // Set a timeout to fallback to placeholder if image doesn't load
      const timeout = setTimeout(() => {
        setShowPlaceholder(true);
        setCurrentAvatarUrl(null);
      }, timeoutDuration);
      setImageLoadTimeout(timeout);
    } else {
      setCurrentAvatarUrl(null);
      setUrlAttempt(0);
      setShowPlaceholder(true);
    }
  }, [rawAvatarUrl]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (imageLoadTimeout) {
        clearTimeout(imageLoadTimeout);
      }
    };
  }, [imageLoadTimeout]);

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="user-avatar-toggle"
    >
      {children}
    </a>
  ));

  if (!session) return null;

  return (
    <div className="user-avatar-container">
      <Dropdown align="end">
        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
          {currentAvatarUrl && !showPlaceholder ? (
            <Image
              src={currentAvatarUrl}
              roundedCircle
              width={size}
              height={size}
              alt={userName}
              className="user-avatar-image"
              onError={(e) => {
                // Clear the timeout since we're handling the error
                if (imageLoadTimeout) {
                  clearTimeout(imageLoadTimeout);
                  setImageLoadTimeout(null);
                }

                // Try alternative URLs
                const alternativeUrls = getAlternativeUrls(rawAvatarUrl);
                const nextAttempt = urlAttempt + 1;

                if (nextAttempt < alternativeUrls.length) {
                  setCurrentAvatarUrl(alternativeUrls[nextAttempt]);
                  setUrlAttempt(nextAttempt);
                } else {
                  // Show placeholder instead of broken image
                  setShowPlaceholder(true);
                  setCurrentAvatarUrl(null);
                }
              }}
              onLoad={(e) => {
                // Clear the timeout since image loaded successfully
                if (imageLoadTimeout) {
                  clearTimeout(imageLoadTimeout);
                  setImageLoadTimeout(null);
                }

                // Ensure placeholder is hidden when image loads successfully
                setShowPlaceholder(false);
              }}
            />
          ) : null}
          {/* Fallback placeholder that shows when image fails to load or no URL */}
          <div
            className="avatar-placeholder avatar-placeholder-fallback"
            style={{
              width: size,
              height: size,
              fontSize: size * 0.4,
              display: showPlaceholder || !currentAvatarUrl ? "flex" : "none",
            }}
          >
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Header>{userName}</Dropdown.Header>
          <Dropdown.Divider />
          <Dropdown.Item onClick={signOut}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default UserAvatar;
