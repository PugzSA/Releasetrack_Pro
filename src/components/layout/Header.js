import React from "react";
import { useApp } from "../../context/AppContext";
import { Dropdown, Image } from "react-bootstrap";
import "./Header.css";

const getCleanAvatarUrl = (url) => {
  if (!url) return null;
  // Fix for Google's URL format which may contain size specifications
  return url.replace(/=s\d+-c$/, "=s256-c");
};

const Header = () => {
  const { session, signOut } = useApp();
  const user = session?.user;
  const rawAvatarUrl =
    session?.user?.user_metadata?.picture ||
    session?.user?.user_metadata?.avatar_url;
  const avatarUrl = getCleanAvatarUrl(rawAvatarUrl);
  const userName =
    session?.user?.user_metadata?.full_name || session?.user?.email;

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

  return (
    <header className="app-header">
      {/* Header content removed to maximize UI real estate */}
    </header>
  );
};

export default Header;
