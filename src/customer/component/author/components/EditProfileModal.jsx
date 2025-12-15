import { useState } from "react";
import countries from "../countries";

export default function EditProfileModal({
    show,
    user,
    onClose,
    onSubmit,
    editErrors,
    updateLoading,
}) {
    // ============================
    // INITIAL STATE
    // Reset automatically when modal remounts (key below)
    // ============================
    const [nationQuery, setNationQuery] = useState(user?.nationality || "");
    const [filteredCountries, setFilteredCountries] = useState([]);

    if (!show) return null;

    // ============================
    //  AUTOCOMPLETE HANDLER
    // ============================
    const handleNationalityChange = (e) => {
        const value = e.target.value;
        setNationQuery(value);

        if (!value.trim()) {
            setFilteredCountries([]);
            return;
        }

        const results = countries.filter((c) =>
            c.toLowerCase().includes(value.toLowerCase())
        );

        // Giới hạn 6 gợi ý
        setFilteredCountries(results.slice(0, 6));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                key={user?.nationality || "modal-open"} 
            >
                <div className="modal-header">
                    <h3>Edit Profile</h3>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form
                    className="modal-form-grid"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit({
                            fullName: e.target.fullName.value,
                            email: e.target.email.value,
                            phone: e.target.phone.value,
                            nationality: e.target.nationality.value,
                            gender: e.target.gender.value,
                            citizenCard: e.target.citizenCard.value,
                        });
                    }}
                >
                    {/* FULL NAME */}
                    <div className="modal-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            defaultValue={user.fullName}
                            placeholder="Enter full name"
                        />
                        {editErrors.fullName && (
                            <p className="error-text">{editErrors.fullName}</p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div className="modal-form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={user.email}
                            required
                        />
                        {editErrors.email && (
                            <p className="error-text">{editErrors.email}</p>
                        )}
                    </div>

                    {/* PHONE */}
                    <div className="modal-form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            defaultValue={user.phone || ""}
                        />
                        {editErrors.phone && (
                            <p className="error-text">{editErrors.phone}</p>
                        )}
                    </div>

                    {/* NATIONALITY WITH AUTOCOMPLETE */}
                    <div className="modal-form-group" style={{ position: "relative" }}>
                        <label>Nationality</label>
                        <input
                            type="text"
                            name="nationality"
                            value={nationQuery}
                            placeholder="Enter nationality"
                            onChange={handleNationalityChange}
                            autoComplete="off"
                        />

                        {filteredCountries.length > 0 && (
                            <ul className="autocomplete-dropdown">
                                {filteredCountries.map((country, index) => (
                                    <li
                                        key={index}
                                        className="autocomplete-item"
                                        onClick={() => {
                                            setNationQuery(country);
                                            setFilteredCountries([]);
                                        }}
                                    >
                                        {country}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {editErrors.nationality && (
                            <p className="error-text">{editErrors.nationality}</p>
                        )}
                    </div>

                    {/* GENDER */}
                    <div className="modal-form-group">
                        <label>Gender</label>
                        <select name="gender" defaultValue={user.gender || ""}>
                            <option value="">-- Select Gender --</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {editErrors.gender && (
                            <p className="error-text">{editErrors.gender}</p>
                        )}
                    </div>

                    {/* CITIZEN ID */}
                    <div className="modal-form-group">
                        <label>Citizen ID</label>
                        <input
                            type="text"
                            name="citizenCard"
                            defaultValue={user.citizenCard || ""}
                        />
                        {editErrors.citizenCard && (
                            <p className="error-text">{editErrors.citizenCard}</p>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button className="modal-save-btn" disabled={updateLoading}>
                        {updateLoading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}










