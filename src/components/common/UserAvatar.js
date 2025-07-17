import React from 'react';
import { useApp } from '../../context/AppContext';
import { Dropdown, Image } from 'react-bootstrap';
import './UserAvatar.css';

const getCleanAvatarUrl = (url) => {
    if (!url) return null;
    // Fix for Google's URL format which may contain size specifications
    return url.replace(/=s\d+-c$/, '=s256-c');
};

const UserAvatar = ({ size = 32 }) => {
    const { session, signOut } = useApp();
    const user = session?.user;
    const rawAvatarUrl = session?.user?.user_metadata?.picture || session?.user?.user_metadata?.avatar_url;
    const avatarUrl = getCleanAvatarUrl(rawAvatarUrl);
    const userName = session?.user?.user_metadata?.full_name || session?.user?.email;

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
                    {avatarUrl ? (
                        <Image 
                            src={avatarUrl} 
                            roundedCircle 
                            width={size} 
                            height={size} 
                            alt={userName}
                            className="user-avatar-image"
                        />
                    ) : (
                        <div 
                            className="avatar-placeholder" 
                            style={{ width: size, height: size, fontSize: size * 0.4 }}
                        >
                            {userName ? userName.charAt(0).toUpperCase() : ''}
                        </div>
                    )}
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
