import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PermenantTable.css";
import Toast from "./Toast";
import { API_URL } from "./config";

function PermanentTable() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [deletedStack, setDeletedStack] = useState([]);
  const [editingRows, setEditingRows] = useState({});
  const [search, setSearch] = useState("");
  const [filterGST, setFilterGST] = useState("");
  const [toast, setToast] = useState(null);

  // 🔹 Load from backend
  useEffect(() => {
    fetch(`${API_URL}/permanent-table`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 🔹 Show toast if redirected from AddParty after successful save
  useEffect(() => {
    if (location.state && location.state.toast) {
      setToast(location.state.toast);
      // clear the state so toast doesn't repeat on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 🔹 Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // 🔹 Auto-generate Party ID  →  P + YY + 3-digit sequence  (e.g. P26001)
  const generatePartyId = (existingData) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const yearPrefix = `P${year}`;

    const existingNums = existingData
      .map(d => d.partyCode || "")
      .filter(code => code.startsWith(yearPrefix))
      .map(code => parseInt(code.slice(yearPrefix.length), 10) || 0);

    const nextSeq = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `${yearPrefix}${nextSeq.toString().padStart(3, "0")}`;
  };

  // 🔹 Duplicate check (frontend, real-time)
  const isDuplicate = (rowIndex, field, value) => {
    if (!value) return false;
    return data.some((r, i) => i !== rowIndex && r[field] && r[field].toString().toLowerCase() === value.toString().toLowerCase());
  };

  // 🔹 Add Party → navigate to dedicated form page
  const addRow = () => {
    navigate("/add-party");
  };

  // 🔹 Handle input change
  const handleChange = (i, field, value) => {
    const updated = [...data];
    updated[i][field] = value;
    setData(updated);
  };

  // 🔹 Live duplicate validation on blur (Name / NTN)
  const handleBlur = (i, field, value) => {
    if (!value) return;
    if (field === "nameOfParty" && isDuplicate(i, "nameOfParty", value)) {
      showToast(`Party Name "${value}" already exists`, "error");
    }
    if (field === "ntn" && isDuplicate(i, "ntn", value)) {
      showToast(`NTN "${value}" already exists`, "error");
    }
  };

  // 🔹 Enter edit mode
  const editRow = (i) => {
    setEditingRows({ ...editingRows, [i]: true });
  };

  // 🔹 Save single row
  const saveRow = async (i) => {
    const row = data[i];

    // Validation
    if (!row.nameOfParty || !row.nameOfParty.trim()) {
      showToast("Party Name is required", "error");
      return;
    }
    if (!row.ntn || !row.ntn.trim()) {
      showToast("NTN is required", "error");
      return;
    }
    if (isDuplicate(i, "nameOfParty", row.nameOfParty)) {
      showToast(`Party Name "${row.nameOfParty}" already exists`, "error");
      return;
    }
    if (isDuplicate(i, "ntn", row.ntn)) {
      showToast(`NTN "${row.ntn}" already exists`, "error");
      return;
    }

    try {
      const { _isNew, ...payload } = row;
      const response = await fetch(`${API_URL}/permanent-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        showToast(errorText || "Failed to save row", "error");
        return;
      }

      const saved = await response.json();
      const updated = [...data];
      updated[i] = { ...saved };
      setData(updated);
      setEditingRows({ ...editingRows, [i]: false });
      showToast(`Saved party ${saved.partyCode || row.partyCode}`, "success");
    } catch (err) {
      showToast("Network error while saving", "error");
      console.error(err);
    }
  };

  // 🔹 Delete row
  const deleteRow = async (index) => {
    const row = data[index];

    // If row exists in DB, call delete API
    if (row.id) {
      try {
        await fetch(`${API_URL}/permanent-table/${row.id}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Backend delete failed:", err);
      }
    }

    setDeletedStack([...deletedStack, { row, index }]);

    const updated = data.filter((_, i) => i !== index);
    setData(updated);

    // remove from editing state
    const newEditing = { ...editingRows };
    delete newEditing[index];
    setEditingRows(newEditing);

    showToast("Row deleted (use Undo to recover)", "success");
  };

  // 🔹 Undo delete
  const undoDelete = async () => {
    if (deletedStack.length === 0) {
      showToast("Nothing to undo", "error");
      return;
    }

    const last = deletedStack[deletedStack.length - 1];
    const restored = [...data, last.row];
    setData(restored);
    setDeletedStack(deletedStack.slice(0, -1));

    // Re-save to backend
    if (last.row.partyCode) {
      try {
        const { _isNew, id, ...payload } = last.row;
        await fetch(`${API_URL}/permanent-table`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Restore to backend failed:", err);
      }
    }

    showToast(`Restored party ${last.row.partyCode}`, "success");
  };

  // 🔹 Search + Filter (by Name / NTN / Party ID)
  const filteredData = data.filter(row => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (row.nameOfParty && row.nameOfParty.toLowerCase().includes(q)) ||
      (row.ntn && row.ntn.toLowerCase().includes(q)) ||
      (row.partyCode && row.partyCode.toLowerCase().includes(q));

    const matchesFilter = filterGST === "" || row.gstInvoice === filterGST;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="permanent-table-page">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="permanent-header">
        <div className="header-content">
          <h1>Permanent Party Table</h1>
          <p>Auto-generated Party IDs · Search by Name / NTN / Party ID</p>
        </div>

        <div className="header-buttons">
          <button onClick={addRow} className="btn-add-row">
            <span>+</span> Add Party
          </button>

          <button onClick={undoDelete} className="btn-undo" disabled={deletedStack.length === 0}>
            <span>↶</span> Undo {deletedStack.length > 0 && `(${deletedStack.length})`}
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="table-controls">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by Name / NTN / Party ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={filterGST}
          onChange={(e) => setFilterGST(e.target.value)}
        >
          <option value="">All GST</option>
          <option value="Yes">GST Yes</option>
          <option value="No">GST No</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="permanent-table">
            <thead>
              <tr>
                <th>Party ID</th>
                <th>Name of Party</th>
                <th>Invoice Address</th>
                <th>NTN</th>
                <th>GST Invoice</th>
                <th>Delivery Address 1</th>
                <th>Delivery Address 2</th>
                <th>Delivery Address 3</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                    No parties found. Click "Add Party" to create one.
                  </td>
                </tr>
              )}

              {filteredData.map((row, displayIdx) => {
                // map back to original index in `data`
                const i = data.indexOf(row);
                const isEditing = editingRows[i] === true;

                return (
                  <tr key={row.id || `new-${i}`} className={isEditing ? "row-editing" : "row-view"}>
                    <td>
                      <input
                        type="text"
                        value={row.partyCode || ""}
                        readOnly
                        className="party-id-cell"
                        title="Auto-generated Party ID"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.nameOfParty || ""}
                        readOnly={!isEditing}
                        onChange={e => handleChange(i, "nameOfParty", e.target.value)}
                        onBlur={e => handleBlur(i, "nameOfParty", e.target.value)}
                        placeholder="Enter name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.invoiceAddress || ""}
                        readOnly={!isEditing}
                        onChange={e => handleChange(i, "invoiceAddress", e.target.value)}
                        placeholder="Enter address"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.ntn || ""}
                        readOnly={!isEditing}
                        onChange={e => handleChange(i, "ntn", e.target.value)}
                        onBlur={e => handleBlur(i, "ntn", e.target.value)}
                        placeholder="Enter NTN"
                      />
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={row.gstInvoice || ""}
                          onChange={e => handleChange(i, "gstInvoice", e.target.value)}
                          className="gst-select"
                        >
                          <option value="">Select GST</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <input type="text" value={row.gstInvoice || ""} readOnly />
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.deliveryAddress1 || ""}
                        readOnly={!isEditing}
                        onChange={e => handleChange(i, "deliveryAddress1", e.target.value)}
                        placeholder="Address 1"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.deliveryAddress2 || ""}
                        readOnly={!isEditing}
                        onChange={e => handleChange(i, "deliveryAddress2", e.target.value)}
                        placeholder="Address 2"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.deliveryAddress3 || ""}
                        readOnly={!isEditing}
                        onChange={e => handleChange(i, "deliveryAddress3", e.target.value)}
                        placeholder="Address 3"
                      />
                    </td>

                    <td className="actions-cell">
                      {!isEditing ? (
                        <>
                          <button onClick={() => editRow(i)} className="btn-edit">✏️ Edit</button>
                          <button onClick={() => deleteRow(i)} className="btn-delete">🗑 Delete</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => saveRow(i)} className="btn-save-row">💾 Save</button>
                          <button onClick={() => deleteRow(i)} className="btn-delete">🗑 Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default PermanentTable;
