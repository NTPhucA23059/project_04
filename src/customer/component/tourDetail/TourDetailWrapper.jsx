import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { getReviewsByTourID } from "../../../services/customer/reviewService";
import TourDetail from "./TourDetail";

export default function TourDetailWrapper() {
    const { id } = useParams();
    const tourId = Number(id);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        tour: null,
        details: null, // Selected detail (for backward compatibility)
        allDetails: [], // All available departure dates
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
                Summary: s.summary,
                Notes: s.notes,
                Items: (s.items || []).map((it) => ({
                    ItemID: it.itemID,
                    TimeInfo: it.timeInfo,
                    Activity: it.activity,
                    Transportation: it.transportation,
                    SortOrder: it.sortOrder,
                    AttractionID: it.attractionID,
                    AttractionName: it.attractionName,
                    AttractionAddress: it.attractionAddress,
                    CityName: it.cityName
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
                          CategoryID: payload.categoryID,
                          TourCities: (payload.tourCities || []).map(tc => ({
                              CityID: tc.cityID,
                              CityName: tc.cityName,
                              CityCode: tc.cityCode,
                              CityOrder: tc.cityOrder,
                              StayDays: tc.stayDays
                          }))
                      }
                    : null;

                // Map tất cả details (các ngày khởi hành)
                const allDetailsList = (payload?.details || []).map(detailData => ({
                    TourDetailID: detailData.tourDetailID,
                    DepartureDate: detailData.departureDate,
                    ArrivalDate: detailData.arrivalDate,
                    NumberOfGuests: detailData.numberOfGuests,
                    MinimumNumberOfGuests: detailData.minimumNumberOfGuests,
                    BookedSeat: detailData.bookedSeat || 0,
                    UnitPrice: Number(detailData.unitPrice),
                    SeasonID: detailData.seasonID,
                    SeasonName: detailData.seasonName || null,
                    SeasonDescription: detailData.seasonDescription || null,
                    Status: detailData.status,
                    Schedules: mapSchedules(detailData.schedules || [])
                }));

                // Lấy detail đầu tiên làm mặc định (hoặc dùng getDetail() nếu có)
                const detailData = payload?.detail || (allDetailsList.length > 0 ? allDetailsList[0] : null);
                
                let detail = detailData
                    ? {
                          TourDetailID: detailData.tourDetailID,
                          DepartureDate: detailData.departureDate,
                          ArrivalDate: detailData.arrivalDate,
                          NumberOfGuests: detailData.numberOfGuests,
                          MinimumNumberOfGuests: detailData.minimumNumberOfGuests,
                          BookedSeat: detailData.bookedSeat || 0,
                          UnitPrice: Number(detailData.unitPrice),
                          SeasonID: detailData.seasonID,
                          Status: detailData.status,
                          Schedules: mapSchedules(detailData.schedules || [])
                      }
                    : null;

                // Load schedules nếu chưa có
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

                // Load schedules cho tất cả details nếu chưa có
                const allDetailsWithSchedules = await Promise.all(
                    allDetailsList.map(async (d) => {
                        if (d.Schedules && d.Schedules.length > 0) {
                            return d;
                        }
                        try {
                            const scRes = await api.get(
                                `/customer/tour-schedules/tour-detail/${d.TourDetailID}`
                            );
                            return {
                                ...d,
                                Schedules: mapSchedules(scRes.data || [])
                            };
                        } catch (e) {
                            console.warn(`Không tải được lịch trình cho detail ${d.TourDetailID}`, e);
                            return d;
                        }
                    })
                );

                // Map images từ tour.images (ảnh gallery của tour, không phải của tourDetail)
                const images =
                    (payload?.images || []).map((img) => ({
                        ImageID: img.imageID,
                        ImageUrl: toAbsoluteUrl(img.imageUrl),
                        Caption: img.caption || "",
                        SortOrder: img.sortOrder || 0
                    })) || [];

                // Map category from payload
                const category = payload?.categoryName
                    ? {
                        CategoryID: payload.categoryID,
                        CategoryName: payload.categoryName
                    }
                    : null;
                
                // Map season from detailData (của detail được chọn)
                const season = detailData?.seasonID
                    ? {
                        SeasonID: detailData.seasonID,
                        SeasonName: detailData.seasonName || null,
                        Description: detailData.seasonDescription || null
                    }
                    : null;

                // Load reviews for this tour
                let reviews = [];
                try {
                    const reviewsData = await getReviewsByTourID(tourId);
                    reviews = (reviewsData || []).map(r => ({
                        ReviewID: r.reviewID,
                        AccountID: r.accountID,
                        Rating: r.rating,
                        Comment: r.comment,
                        CreatedAt: r.createdAt
                    }));
                } catch (e) {
                    console.warn("Không tải được reviews:", e);
                }

                if (isMounted) {
                    setData({
                        tour,
                        details: detail,
                        allDetails: allDetailsWithSchedules, // Tất cả các ngày khởi hành
                        images,
                        category,
                        season,
                        reviews: reviews
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
            allDetails={data.allDetails}
            images={data.images}
            category={data.category}
            season={data.season}
            reviews={data.reviews}
        />
    );
}
