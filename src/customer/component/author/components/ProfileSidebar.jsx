import { FaUser, FaShoppingBag, FaRegHeart, FaMapMarkerAlt, FaLock } from "react-icons/fa";

export default function ProfileSidebar({ user, onChangePassword }) {
    return (
        <aside className="profile-sidebar">
            <div className="profile-sidebar-header">
                <img src="/default-avatar.png" className="profile-avatar" alt="avatar" />
                <div>
                    <h2 className="profile-sidebar-name">{user.fullName || user.username}</h2>
                    <p className="profile-sidebar-username">@{user.username}</p>
                </div>
            </div>

            <button className="avatar-upload-btn">Change Avatar</button>

            <nav className="profile-sidebar-menu">
                <button className="sidebar-link active"><FaUser /> Account Details</button>
                <button className="sidebar-link" onClick={onChangePassword}>
                    <FaLock /> Change Password
                </button>
            </nav>
        </aside>
    );
}











