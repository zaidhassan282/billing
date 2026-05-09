import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ContractTable.css";
import AutocompleteInput from "./AutocompleteInput";
import Toast from "./Toast";
import { API_URL } from "./config";

function ContractsTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [deletedStack, setDeletedStack] = useState([]);

  // NEW STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGST, setFilterGST] = useState("");
  const [permanentTableNames, setPermanentTableNames] = useState([]);
  const [toast, setToast] = useState(null);

  // 🔹 Show toast if redirected from AddContract after successful save
  useEffect(() => {
    if (location.state && location.state.toast) {
      setToast(location.state.toast);
      // clear the state so toast doesn't repeat on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // FETCH PERMANENT TABLE DATA (full records, not just names)
  useEffect(() => {
    const fetchPermanentTableData = async () => {
      try {
        const response = await fetch(`${API_URL}/permanent-table`);
        if (response.ok) {
          const permanentData = await response.json();
          // Store full permanent table data for autocomplete and data population
          setPermanentTableNames(permanentData.filter(item => item.nameOfParty));
        }
      } catch (error) {
        console.log("Could not fetch permanent table data. Autocomplete will not be available.");
      }
    };
    fetchPermanentTableData();
  }, []);

  const addRow = () => {
    setData([
      ...data,
      {
        dated: "",
        contractNo: "",
        partyCode: "",
        nameOfParty: "",
        gstInvoiceYesNo: "",
        hsCode: "",
        quality: "",
        weight: "",
        rateA: "",
        rateB: "",
        shrinkage: "",
        deliveryTime: "",
        paymentTerm: ""
      }
    ]);
  };

  const handleChange = (i, field, value) => {
    const updated = [...data];
    updated[i][field] = value;
    setData(updated);
  };

  // HANDLE PARTY SELECTION FROM AUTOCOMPLETE
  const handlePartySelect = (rowIndex, partyData) => {
    const updated = [...data];
    updated[rowIndex] = {
      ...updated[rowIndex],
      partyCode: partyData.partyCode || "",
      nameOfParty: partyData.nameOfParty || "",
      gstInvoiceYesNo: partyData.gstInvoice || "",
      // Pre-fill available fields from permanent table
    };
    setData(updated);
  };

  // SHOW TOAST NOTIFICATION
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // DELETE ROW
  const deleteRow = (index) => {
    const rowToDelete = data[index];
    setDeletedStack([...deletedStack, rowToDelete]);

    const updated = data.filter((_, i) => i !== index);
    setData(updated);
  };

  const undoDelete = () => {
    if (deletedStack.length === 0) return;

    const lastDeleted = deletedStack[deletedStack.length - 1];
    setData([...data, lastDeleted]);
    setDeletedStack(deletedStack.slice(0, -1));
  };

  // 💾 SAVE ALL ROWS
  const saveAll = async () => {
    for (let row of data) {
      // Duplicate check (frontend)
      const duplicate = data.filter(
        r =>
          r !== row &&
          (r.contractNo === row.contractNo || r.nameOfParty === row.nameOfParty)
      );

      if (duplicate.length > 0) {
        showToast("Duplicate Contract No. or Party Name not allowed", "error");
        return;
      }

      await fetch(`${API_URL}/contracts-table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(row)
      });
    }

    showToast("Saved successfully", "success");
  };

  // 🔍 FILTER LOGIC
  const filteredData = data.filter(row => {
    const matchesSearch =
      row.nameOfParty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.partyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.contractNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterGST === ""
        ? true
        : row.gstInvoiceYesNo.toLowerCase() === filterGST.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="contracts-table-page">

      {/* TOAST NOTIFICATION */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* HEADER */}
      <div className="contracts-header">
        <div className="header-content">
          <h1>Contracts Table</h1>
          <p>Manage contract details and terms</p>
        </div>

        <div className="header-buttons">
          <button onClick={() => navigate("/add-contract")} className="btn-add-row">
            <span>+</span> Add New Contract
          </button>

          <button onClick={saveAll} className="btn-save">
            <span>💾</span> Save All
          </button>

          <button onClick={undoDelete} className="btn-undo">
            <span>↶</span> Undo
          </button>
        </div>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="table-controls">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by Contract No., Party Code, or Party Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          <table className="contracts-table">
            <thead>
              <tr>
                <th>Dated</th>
                <th>Contract No.</th>
                <th>Party Code</th>
                <th>Name of Party</th>
                <th>GST Invoice</th>
                <th>H.S. Code</th>
                <th>Quality</th>
                <th>Weight</th>
                <th>Rate A</th>
                <th>Rate B</th>
                <th>Shrinkage %</th>
                <th>Delivery Time</th>
                <th>Payment Term</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, filteredIndex) => {
                const actualIndex = data.findIndex(r => r === row);
                return (
                <tr key={filteredIndex}>
                  <td><input type="date" value={row.dated || ""} onChange={e => handleChange(actualIndex, "dated", e.target.value)} /></td>
                  <td><input type="text" value={row.contractNo || ""} onChange={e => handleChange(actualIndex, "contractNo", e.target.value)} /></td>
                  <td><input type="text" value={row.partyCode || ""} onChange={e => handleChange(actualIndex, "partyCode", e.target.value)} /></td>
                  <td><AutocompleteInput value={row.nameOfParty || ""} onChange={(value) => handleChange(actualIndex, "nameOfParty", value)} suggestions={permanentTableNames} onSelect={(partyData) => handlePartySelect(actualIndex, partyData)} /></td>
                  <td><select value={row.gstInvoiceYesNo || ""} onChange={e => handleChange(actualIndex, "gstInvoiceYesNo", e.target.value)} className="gst-select"><option value="">Select GST</option><option value="Yes">Yes</option><option value="No">No</option></select></td>
                  <td><input type="text" value={row.hsCode || ""} onChange={e => handleChange(actualIndex, "hsCode", e.target.value)} /></td>
                  <td><input type="text" value={row.quality || ""} onChange={e => handleChange(actualIndex, "quality", e.target.value)} /></td>
                  <td><input type="number" value={row.weight || ""} onChange={e => handleChange(actualIndex, "weight", e.target.value)} /></td>
                  <td><input type="number" value={row.rateA || ""} onChange={e => handleChange(actualIndex, "rateA", e.target.value)} /></td>
                  <td><input type="number" value={row.rateB || ""} onChange={e => handleChange(actualIndex, "rateB", e.target.value)} /></td>
                  <td><input type="number" value={row.shrinkage || ""} onChange={e => handleChange(actualIndex, "shrinkage", e.target.value)} /></td>
                  <td><input type="text" value={row.deliveryTime || ""} onChange={e => handleChange(actualIndex, "deliveryTime", e.target.value)} /></td>
                  <td><input type="text" value={row.paymentTerm || ""} onChange={e => handleChange(actualIndex, "paymentTerm", e.target.value)} /></td>

                  <td>
                    <button onClick={() => deleteRow(actualIndex)} className="btn-delete">🗑 Delete</button>
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


export default ContractsTable;