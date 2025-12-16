import React, { useState, useEffect } from "react";
import { searchTours } from "../../../services/staff/tourStaffService";
import { getTourDetails } from "../../../services/staff/tourDetailStaffService";
import { getTourCities } from "../../../services/staff/tourCityStaffService";
import {
  getTourSchedules,
  createTourSchedule,
  updateTourSchedule,
  deleteTourSchedule,
} from "../../../services/staff/tourScheduleStaffService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
import ScheduleFormModal from "./ScheduleFormModal";
import ScheduleItemFormModal from "./ScheduleItemFormModal";
import ScheduleItemList from "./ScheduleItemList";

export default function TourSchedulesPage() {
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedTourDetail, setSelectedTourDetail] = useState(null);
  const [tours, setTours] = useState([]);
  const [tourDetails, setTourDetails] = useState([]);
  const [tourCities, setTourCities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modals
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedScheduleForItems, setSelectedScheduleForItems] = useState(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Load tours on mount
  useEffect(() => {
    loadTours();
  }, []);

  // Load tour details and cities when tour is selected
  useEffect(() => {
    if (selectedTour?.tourID) {
      loadTourDetails(selectedTour.tourID);
      loadTourCities(selectedTour.tourID);
    } else {
      setTourDetails([]);
      setTourCities([]);
      setSelectedTourDetail(null);
      setSchedules([]);
    }
  }, [selectedTour]);

  // Load schedules when tour detail is selected
  useEffect(() => {
    if (selectedTourDetail?.tourDetailID) {
      loadSchedules(selectedTourDetail.tourDetailID);
    } else {
      setSchedules([]);
    }
  }, [selectedTourDetail]);

  const loadTours = async () => {
    setLoading(true);
    try {
      const result = await searchTours({
        page: 0,
        size: 1000,
        keyword: searchKeyword,
      });
      setTours(result?.items || []);
    } catch (err) {
      console.error("Failed to load tours:", err);
      toast.error("Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  const loadTourDetails = async (tourID) => {
    try {
      const details = await getTourDetails(tourID);
      setTourDetails(details);
    } catch (err) {
      console.error("Failed to load tour details:", err);
      toast.error("Failed to load departures");
      setTourDetails([]);
    }
  };

  const loadTourCities = async (tourID) => {
    try {
      const cities = await getTourCities(tourID);
      setTourCities(cities);
    } catch (err) {
      console.error("Failed to load tour cities:", err);
      toast.error("Failed to load cities");
      setTourCities([]);
    }
  };

  const loadSchedules = async (tourDetailID) => {
    setLoading(true);
    try {
      const data = await getTourSchedules(tourDetailID);
      setSchedules(data || []);
    } catch (err) {
      console.error("Failed to load schedules:", err);
      toast.error("Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTours();
  };

  const handleCreateSchedule = async (payload) => {
    try {
      if (editingSchedule) {
        // Update existing schedule - preserve existing items if not provided
        const scheduleID = editingSchedule.scheduleID || editingSchedule.ScheduleID;
        const existingItems = editingSchedule.items || editingSchedule.Items || [];
        const updatePayload = {
          dayNumber: payload.dayNumber,
          title: payload.title,
          summary: payload.summary,
          notes: payload.notes,
          items: payload.items !== undefined ? payload.items : existingItems,
        };
        await updateTourSchedule(scheduleID, updatePayload);
        toast.success("Schedule updated successfully");
      } else {
        await createTourSchedule(payload);
        toast.success("Schedule created successfully");
      }
      setOpenScheduleModal(false);
      setEditingSchedule(null);
      if (selectedTourDetail?.tourDetailID) {
        await loadSchedules(selectedTourDetail.tourDetailID);
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
      toast.error(err?.response?.data?.message || "Failed to save schedule");
    }
  };

  const handleDeleteSchedule = (schedule) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: `Are you sure you want to delete Day ${schedule.dayNumber || schedule.DayNumber}? All activities in this day will also be deleted.`,
      onConfirm: async () => {
        try {
          const scheduleID = schedule.scheduleID || schedule.ScheduleID;
          await deleteTourSchedule(scheduleID);
          toast.success("Schedule deleted successfully");
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          if (selectedTourDetail?.tourDetailID) {
            await loadSchedules(selectedTourDetail.tourDetailID);
          }
        } catch (err) {
          console.error("Failed to delete schedule:", err);
          toast.error(err?.response?.data?.message || "Failed to delete schedule");
        }
      },
    });
  };

  const handleOpenEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setOpenScheduleModal(true);
  };

  const handleOpenAddItem = (schedule) => {
    setSelectedScheduleForItems(schedule);
    setEditingItem(null);
    setOpenItemModal(true);
  };

  const handleOpenEditItem = (item, schedule) => {
    setSelectedScheduleForItems(schedule);
    setEditingItem(item);
    setOpenItemModal(true);
  };

  const handleSaveItem = async (itemPayload) => {
    if (!selectedScheduleForItems) return;

    const scheduleID = selectedScheduleForItems.scheduleID || selectedScheduleForItems.ScheduleID;
    const currentItems = selectedScheduleForItems.items || selectedScheduleForItems.Items || [];
    
    let updatedItems;
    if (editingItem) {
      // Update existing item
      updatedItems = currentItems.map((item) => {
        const itemID = item.itemID || item.ItemID;
        const editingItemID = editingItem.itemID || editingItem.ItemID;
        if (itemID === editingItemID) {
          return { ...item, ...itemPayload };
        }
        return item;
      });
    } else {
      // Add new item
      updatedItems = [...currentItems, { ...itemPayload, itemID: null }];
    }

    // Update schedule with updated items
    const updatePayload = {
      dayNumber: selectedScheduleForItems.dayNumber || selectedScheduleForItems.DayNumber,
      title: selectedScheduleForItems.title || selectedScheduleForItems.Title || null,
      summary: selectedScheduleForItems.summary || selectedScheduleForItems.Summary || null,
      notes: selectedScheduleForItems.notes || selectedScheduleForItems.Notes || null,
      items: updatedItems,
    };

    try {
      await updateTourSchedule(scheduleID, updatePayload);
      toast.success(editingItem ? "Activity updated successfully" : "Activity added successfully");
      setOpenItemModal(false);
      setEditingItem(null);
      setSelectedScheduleForItems(null);
      if (selectedTourDetail?.tourDetailID) {
        await loadSchedules(selectedTourDetail.tourDetailID);
      }
    } catch (err) {
      console.error("Failed to save item:", err);
      toast.error(err?.response?.data?.message || "Failed to save activity");
    }
  };

  const handleDeleteItem = (item, schedule) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: "Are you sure you want to delete this activity?",
      onConfirm: async () => {
        const scheduleID = schedule.scheduleID || schedule.ScheduleID;
        const currentItems = schedule.items || schedule.Items || [];
        const itemID = item.itemID || item.ItemID;
        const updatedItems = currentItems.filter(
          (i) => (i.itemID || i.ItemID) !== itemID
        );

        const updatePayload = {
          dayNumber: schedule.dayNumber || schedule.DayNumber,
          title: schedule.title || schedule.Title || null,
          summary: schedule.summary || schedule.Summary || null,
          notes: schedule.notes || schedule.Notes || null,
          items: updatedItems,
        };

        try {
          await updateTourSchedule(scheduleID, updatePayload);
          toast.success("Activity deleted successfully");
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          if (selectedTourDetail?.tourDetailID) {
            await loadSchedules(selectedTourDetail.tourDetailID);
          }
        } catch (err) {
          console.error("Failed to delete item:", err);
          toast.error(err?.response?.data?.message || "Failed to delete activity");
        }
      },
    });
  };

  // Sort schedules by dayNumber
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dayA = a.dayNumber || a.DayNumber || 0;
    const dayB = b.dayNumber || b.DayNumber || 0;
    return dayA - dayB;
  });

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Tour Schedule Management
        </h2>
      </div>

      {/* Tour Selection */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 shadow-sm">
        <h3 className="font-semibold text-neutral-900 mb-4">1. Select Tour</h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            className="flex-1 border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
            placeholder="Search by tour name or code..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Search
          </button>
        </div>

        {tours.length > 0 && (
          <select
            className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
            value={selectedTour?.tourID || ""}
            onChange={(e) => {
              const tour = tours.find((t) => t.tourID === Number(e.target.value));
              setSelectedTour(tour || null);
            }}
          >
            <option value="">-- Select tour --</option>
            {tours.map((tour) => (
              <option key={tour.tourID} value={tour.tourID}>
                {tour.tourCode} - {tour.tourName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tour Detail Selection */}
      {selectedTour && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-4">2. Select Departure</h3>
          {loading ? (
            <p className="text-sm text-neutral-500">Loading...</p>
          ) : tourDetails.length === 0 ? (
            <p className="text-sm text-neutral-500">
              This tour has no departures. Please create a departure first.
            </p>
          ) : (
            <select
              className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none"
              value={selectedTourDetail?.tourDetailID || ""}
              onChange={(e) => {
                const detail = tourDetails.find(
                  (d) => d.tourDetailID === Number(e.target.value)
                );
                setSelectedTourDetail(detail || null);
              }}
            >
              <option value="">-- Select departure --</option>
              {tourDetails.map((detail) => (
                <option key={detail.tourDetailID} value={detail.tourDetailID}>
                  {detail.departureDate
                    ? new Date(detail.departureDate).toLocaleDateString("vi-VN")
                    : "N/A"}{" "}
                  - {detail.arrivalDate
                    ? new Date(detail.arrivalDate).toLocaleDateString("vi-VN")
                    : "N/A"}{" "}
                  ({detail.unitPrice?.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Schedules Management */}
      {selectedTourDetail && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-neutral-900">
              3. Daily Schedule
            </h3>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setOpenScheduleModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition font-medium text-sm"
            >
              + Add Day
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-500 text-center py-8">Loading...</p>
          ) : sortedSchedules.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">
              No schedules yet. Add the first day.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedSchedules.map((schedule) => {
                const scheduleID = schedule.scheduleID || schedule.ScheduleID;
                const dayNumber = schedule.dayNumber || schedule.DayNumber;
                const title = schedule.title || schedule.Title || "";
                const summary = schedule.summary || schedule.Summary || "";
                const notes = schedule.notes || schedule.Notes || "";
                const items = schedule.items || schedule.Items || [];

                return (
                  <div
                    key={scheduleID}
                    className="border border-neutral-200 rounded-lg p-5 bg-neutral-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-primary-700">
                            Day {dayNumber}
                          </span>
                          {title && (
                            <span className="text-sm font-medium text-neutral-700">
                              {title}
                            </span>
                          )}
                        </div>
                        {summary && (
                          <p className="text-sm text-neutral-600 mb-2">{summary}</p>
                        )}
                        {notes && (
                          <p className="text-xs text-neutral-500 italic">{notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenAddItem(schedule)}
                          className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition font-medium"
                        >
                          + Activity
                        </button>
                        <button
                          onClick={() => handleOpenEditSchedule(schedule)}
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule)}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Schedule Items */}
                    <div className="mt-4 pl-4 border-l-2 border-primary-200">
                      <ScheduleItemList
                        items={items}
                        onEdit={(item) => handleOpenEditItem(item, schedule)}
                        onDelete={(item) => handleDeleteItem(item, schedule)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ScheduleFormModal
        open={openScheduleModal}
        onClose={() => {
          setOpenScheduleModal(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleCreateSchedule}
        initial={editingSchedule}
        tourDetailID={selectedTourDetail?.tourDetailID}
        existingSchedules={schedules}
      />

      <ScheduleItemFormModal
        open={openItemModal}
        onClose={() => {
          setOpenItemModal(false);
          setEditingItem(null);
          setSelectedScheduleForItems(null);
        }}
        onSubmit={handleSaveItem}
        initial={editingItem}
        existingItems={selectedScheduleForItems?.items || selectedScheduleForItems?.Items || []}
        scheduleID={selectedScheduleForItems?.scheduleID || selectedScheduleForItems?.ScheduleID}
        allowedCityIDs={tourCities.map(c => c.cityID || c.CityID).filter(Boolean)}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
