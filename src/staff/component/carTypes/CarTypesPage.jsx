import React, { useEffect, useMemo, useState } from "react";
import CarTypesTable from "./CarTypesTable";
import CarTypesFormModal from "./CarTypesFormModal";
import {
  searchCarTypes,
  createCarType,
  updateCarType,
  deleteCarType,
} from "../../../services/staff/carTypeStaffService";

export default function CarTypesPage() {
  const [search, setSearch] = useState("");
  const [carTypes, setCarTypes] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [toast, setToast] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

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
      alert("Failed to load car types");
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
        setToast({ type: "success", message: "Updated successfully" });
      } else {
        await createCarType(form);
        setToast({ type: "success", message: "Created successfully" });
      }
      setOpenModal(false);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.error || "Save failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCarType(deleteItem.carTypeID);
      setToast({ type: "success", message: "Deleted successfully" });
      setDeleteItem(null);
      loadData();
    } catch (err) {
      alert("Delete failed");
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
        onDelete={setDeleteItem}
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

      {/* DELETE MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="font-bold mb-4">Delete Car Type</h3>
            <p className="mb-6">
              Delete <b>{deleteItem.typeName}</b>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg">
          {toast.message}
        </div>
      )}
    </div>
  );
}
