import api from "../api";

const BASE = "/customer/seasons";

// Get all seasons (for filters)
export const fetchSeasons = async () => {
  try {
    const res = await api.get(`${BASE}/all`);
    return res.data || [];
  } catch (e) {
    console.error("Error fetching seasons:", e);
    return [];
  }
};


