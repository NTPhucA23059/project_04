import React from "react";

export default function ScheduleItemList({
  items = [],
  onEdit,
  onDelete,
  onReorder,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No activities yet. Add the first activity.
      </div>
    );
  }

  // Sort items by sortOrder
  const sortedItems = [...items].sort((a, b) => {
    const orderA = a.sortOrder || a.SortOrder || 0;
    const orderB = b.sortOrder || b.SortOrder || 0;
    return orderA - orderB;
  });

  return (
    <div className="space-y-3">
      {sortedItems.map((item, index) => {
        const itemID = item.itemID || item.ItemID;
        const timeInfo = item.timeInfo || item.TimeInfo || "";
        const activity = item.activity || item.Activity || "";
        const transportation = item.transportation || item.Transportation || "";
        const sortOrder = item.sortOrder || item.SortOrder || index + 1;
        const attractionID = item.attractionID || item.AttractionID;
        const attractionName = item.attractionName || item.AttractionName || item.name || "";

        return (
          <div
            key={itemID || index}
            className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
                    {sortOrder}
                  </span>
                  {timeInfo && (
                    <span className="text-sm font-medium text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
                      {timeInfo}
                    </span>
                  )}
                  {transportation && (
                    <span className="text-xs text-neutral-600 bg-blue-50 px-2 py-1 rounded">
                      🚗 {transportation}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-neutral-800 mb-2 ml-11">
                  {activity}
                </p>

                {attractionID && (
                  <div className="ml-11 text-xs text-neutral-600">
                    <span className="font-medium">Attraction:</span>{" "}
                    {attractionName || `ID: ${attractionID}`}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition font-medium"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
