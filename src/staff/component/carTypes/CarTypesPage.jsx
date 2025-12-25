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
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, "1" (Active), "0" (Inactive)
  const [carTypes, setCarTypes] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, carType: null, error: null, deleting: false });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // LOAD DATA
  const loadData = async () => {
    try {
      const res = await searchCarTypes({
        page: page - 1,
        size: pageSize,
        keyword: search.trim() || undefined,
        status: statusFilter !== "ALL" ? Number(statusFilter) : undefined,
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

  // ============================
  // LOAD STATISTICS
  // ============================
  const loadStats = async () => {
    try {
      // Load all car types to calculate stats
      const res = await searchCarTypes({
        page: 0,
        size: 1000, // Get all for stats
        keyword: undefined,
        status: undefined,
      });

      const allItems = res.items || [];
      const total = allItems.length;
      const active = allItems.filter((item) => item.status === 1).length;
      const inactive = total - active;

      setStats({
        total,
        active,
        inactive,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  useEffect(() => {
    loadData();
    loadStats();
  }, [search, page, pageSize, statusFilter]);

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
      loadStats();
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

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Car Types</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage car types and their information</p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add New Car Type
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Total Car Types</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Active Car Types</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Inactive Car Types</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          className="flex-1 border border-neutral-200 px-4 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          placeholder="Search car types..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
        >
          <option value="ALL">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <CarTypesTable
        data={pageData}
        total={total}
        startIndex={startIndex}
        endIndex={endIndex}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onChangePage={(dir) => {
          if (dir === "prev") setPage((p) => Math.max(1, p - 1));
          if (dir === "next") setPage((p) => Math.min(totalPages, p + 1));
        }}
        onEdit={handleEdit}
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
