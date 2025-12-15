import { FaUser, FaPhone, FaEnvelope, FaGlobeAsia, FaIdCard, FaTransgender } from "react-icons/fa";

export default function ProfileInfo({ user, onEdit }) {
    const items = [
        { icon: <FaUser />, label: "Username", value: user.username },
        { icon: <FaUser />, label: "Full Name", value: user.fullName || "Not set" },
        { icon: <FaEnvelope />, label: "Email", value: user.email },
        { icon: <FaPhone />, label: "Phone", value: user.phone || "Not set" },
        { icon: <FaTransgender />, label: "Gender", value: user.gender || "Not set" },
        { icon: <FaGlobeAsia />, label: "Nationality", value: user.nationality || "Not set" },
        { icon: <FaIdCard />, label: "Citizen ID", value: user.citizenCard || "Not set" },
    ];

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <h3>Account Details</h3>
                <button className="edit-btn" onClick={onEdit}>Edit</button>
            </div>

            <div className="profile-info-grid">
                {items.map((item, i) => (
                    <div className="profile-info-item" key={i}>
                        <span className="profile-icon">{item.icon}</span>
                        <div>
                            <p className="label">{item.label}</p>
                            <p className="value">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}











