import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import TourDetail from "./TourDetail";

export default function TourDetailWrapper() {
    const { id } = useParams();
    const tourId = Number(id);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        tour: null,
        details: null,
        images: [],
        category: null,
        season: null,
        reviews: []
    });

    useEffect(() => {
        let isMounted = true;

        const mapSchedules = (schedules = []) =>
            schedules.map((s) => ({
                ScheduleID: s.scheduleID,
                TourDetailID: s.tourDetailID,
                DayNumber: s.dayNumber,
                Title: s.title,
                MealInfo: s.mealInfo,
                Summary: s.summary,
                Items: (s.items || []).map((it) => ({
                    ItemID: it.itemID,
                    TimeInfo: it.timeInfo,
                    Activity: it.activity,
                    PlaceName: it.placeName,
                    Transportation: it.transportation,
                    Cost: it.cost,
                    SortOrder: it.sortOrder,
                    AttractionID: it.attractionID
                }))
            }));

        const toAbsoluteUrl = (url) => {
            if (!url) return "";
            if (url.startsWith("http://") || url.startsWith("https://")) return url;
            const base = (api.defaults.baseURL || "").replace(/\/$/, "");
            const normalized = url.replace(/^\/+/, "");
            return base ? `${base}/${normalized}` : `/${normalized}`;
        };

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/customer/tours/${tourId}`);
                const payload = res.data;

                const tour = payload
                    ? {
                          TourID: payload.tourID,
                          TourCode: payload.tourCode,
                          TourName: payload.tourName,
                        TourImg: toAbsoluteUrl(payload.tourImg),
                          TourDescription: payload.tourDescription,
                          Nation: payload.nation,
                          StartingLocation: payload.startingLocation,
                          Duration: payload.duration,
                          CategoryID: payload.categoryID
                      }
                    : null;

                let detail = payload?.detail
                    ? {
                          TourDetailID: payload.detail.tourDetailID,
                          DepartureDate: payload.detail.departureDate,
                          ArrivalDate: payload.detail.arrivalDate,
                          NumberOfGuests: payload.detail.numberOfGuests,
                          MinimumNumberOfGuests: payload.detail.minimumNumberOfGuests,
                          BookedSeat: payload.detail.bookedSeat,
                          UnitPrice: Number(payload.detail.unitPrice),
                          FromLocation: payload.detail.fromLocation,
                          ToLocation: payload.detail.toLocation,
                          SeasonID: payload.detail.seasonID,
                          Status: payload.detail.status,
                          Schedules: mapSchedules(payload.detail.schedules || [])
                      }
                    : null;

                // Fallback: nếu lịch trình chưa có trong payload, thử gọi API lịch trình riêng
                if (detail?.TourDetailID && (!detail.Schedules || detail.Schedules.length === 0)) {
                    try {
                        const scRes = await api.get(
                            `/customer/tour-schedules/tour-detail/${detail.TourDetailID}`
                        );
                        detail = {
                            ...detail,
                            Schedules: mapSchedules(scRes.data || [])
                        };
                    } catch (e) {
                        console.warn("Không tải được lịch trình riêng", e);
                    }
                }

                // Map images từ payload.detail.images (nếu backend đã trả)
                const images =
                    (payload?.detail?.images || []).map((img) => ({
                        ImageID: img.imageID,
                        ImageUrl: toAbsoluteUrl(img.imageUrl),
                        Caption: img.caption,
                        SortOrder: img.sortOrder
                    })) || [];

                if (isMounted) {
                    setData({
                        tour,
                        details: detail,
                        images,
                        category: null, // TODO: bind real category nếu backend trả
                        season: null,   // TODO: bind real season nếu cần
                        reviews: []     // TODO: bind reviews khi có API
                    });
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setError("Không tải được dữ liệu tour. Vui lòng thử lại.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [tourId]);

    if (loading) return <p className="p-10 text-gray-600">Đang tải tour...</p>;
    if (error) return <p className="p-10 text-red-600">{error}</p>;
    if (!data.tour) return <p className="p-10 text-red-600">Tour not found.</p>;

    return (
        <TourDetail
            tour={data.tour}
            details={data.details}
            images={data.images}
            category={data.category}
            season={data.season}
            reviews={data.reviews}
        />
    );
}
