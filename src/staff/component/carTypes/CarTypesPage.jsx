import React, { useEffect, useMemo, useState } from "react";
import CarTypesTable from "./CarTypesTable";
import CarTypesFormModal from "./CarTypesFormModal";
import {
  searchCarTypes,
  createCarType,
  updateCarType,
  deleteCarType,
} from "../../../services/staff/carTypeStaffService";
import { toast } from "../../shared/toast/toast";

export default function CarTypesPage() {
  const [search, setSearch] = useState("");
  const [carTypes, setCarTypes] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, carType: null, error: null, deleting: false });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // LOAD DATA
  const loadData = async () => {
    try {
      const res = await searchCarTypes({
        page: page - 1,
        size: pageSize,
        keyword: search.trim(),
      });

      const list = res.items.map((x) => ({
        carTypeID: x.carTypeID,
        typeCode: x.typeCode,
        typeName: x.typeName,
        description: x.description,
        status: x.status,
      }));

      setCarTypes(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load car types");
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page]);

  // FILTER & PAGINATION
  const filtered = carTypes;
  const total = filtered.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageData = filtered.slice(startIndex, endIndex);

  const handleAdd = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setOpenModal(true);
  };

  const handleSave = async (form) => {
    try {
      if (editing) {
        await updateCarType(editing.carTypeID, {
          typeName: form.typeName,
          description: form.description,
          status: form.status,
        });
        toast.success("Updated successfully");
      } else {
        await createCarType(form);
        toast.success("Created successfully");
      }
      setOpenModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      
      // Get backend message
      let backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
      
      // Convert to user-friendly message
      let userFriendlyMsg = "";
      
      if (backendMsg.toLowerCase().includes("already exists")) {
        if (backendMsg.toLowerCase().includes("code")) {
          userFriendlyMsg = "This type code is already in use. Please choose a different code.";
        } else if (backendMsg.toLowerCase().includes("name")) {
          userFriendlyMsg = "This type name is already in use. Please choose a different name.";
        } else {
          userFriendlyMsg = "This car type already exists. Please check the code and name.";
        }
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "Car type not found. Please refresh the page and try again.";
      } else if (backendMsg.toLowerCase().includes("validation") || backendMsg.toLowerCase().includes("required")) {
        userFriendlyMsg = "Please fill in all required fields correctly.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to save car type. Please check your input and try again.";
      } else {
        userFriendlyMsg = "Unable to save car type. Please check your connection and try again.";
      }

      toast.error(userFriendlyMsg);
    }
  };

  const handleDelete = (carType) => {
    setDeleteConfirm({ isOpen: true, carType: carType, error: null, deleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.carType || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteCarType(deleteConfirm.carType.carTypeID);
      toast.success("Car type deleted successfully");
      setDeleteConfirm({ isOpen: false, carType: null, error: null, deleting: false });
      loadData();
    } catch (err) {
      // Get error message from response
      let backendMsg = "";
      
      if (err?.response?.data?.message) {
        backendMsg = err.response.data.message;
      } else if (err?.response?.data?.error) {
        backendMsg = err.response.data.error;
      } else if (err?.message) {
        backendMsg = err.message;
      }

      // Convert technical message to user-friendly message
      let userFriendlyMsg = "";
      
      // Check if it's a constraint error (car type is being used)
      if (backendMsg.toLowerCase().includes("car") || 
          backendMsg.toLowerCase().includes("using") ||
          backendMsg.toLowerCase().includes("cannot delete")) {
        
        // Extract number of cars if available
        const countMatch = backendMsg.match(/\d+/);
        const count = countMatch ? countMatch[0] : "some";
        
        userFriendlyMsg = `This car type is currently being used by ${count} car(s). You cannot delete it until you remove or change the type for those cars first.`;
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This car type no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this car type. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this car type. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-5">
        <input
          type="text"
          className="border px-3 py-2 rounded-lg text-sm"
          placeholder="Search car types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Add
        </button>
      </div>

      {/* TABLE */}
      <CarTypesTable
        data={pageData}
        total={total}
        startIndex={startIndex}
        endIndex={endIndex}
        page={page}
        totalPages={totalPages}
        onChangePage={(dir) => {
          if (dir === "prev") setPage((p) => Math.max(1, p - 1));
          if (dir === "next") setPage((p) => Math.min(totalPages, p + 1));
        }}
        onEdit={setEditing}
        onDelete={handleDelete}
      />

      {/* MODAL ADD / EDIT */}
      <CarTypesFormModal
        open={openModal}
        initial={editing}
        existing={carTypes}
        onSave={handleSave}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all border border-gray-200/50">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Car Type
                  </h3>
                  {deleteConfirm.error ? (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900 mb-2">
                              Cannot Delete This Car Type
                            </p>
                            <p className="text-sm text-amber-800 leading-relaxed">
                              {deleteConfirm.error}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">What to do next:</p>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                          <li>Go to the Cars management page</li>
                          <li>Find the cars using this car type</li>
                          <li>Update their car type to a different one</li>
                          <li>Then come back here to delete this car type</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.carType
                        ? `Are you sure you want to delete car type "${deleteConfirm.carType.typeName}"? This action cannot be undone.`
                        : "Are you sure you want to delete this car type?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, carType: null, error: null, deleting: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                {deleteConfirm.error ? "Close" : "Cancel"}
              </button>
              {!deleteConfirm.error && (
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirm.deleting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-md ${
                    deleteConfirm.deleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deleteConfirm.deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
