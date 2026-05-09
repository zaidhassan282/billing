import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config";
import "./AddParty.css";

const DRAFT_KEY = "inward-entry-draft";

const EMPTY_FORM = {
  gatePassNo: "",
  dated: "",
  contractNo: "",
  supplierName: "",
  receivedFrom: "",
  vehicleNo: "",
  driverName: "",
  referenceChallan: "",
  fabricType: "GREY",
  gateInTime: "",
  securityGuard: "",
  receivedCheckedBy: "",
  receivedByName: "",
  receivedByDesignation: "",
  receivedByDate: "",
  storeName: "",
  storeSignature: "",
  storeDate: "",
  authorizedName: "",
  authorizedDesignation: "",
  authorizedDate: ""
};

const blankItem = () => ({
  description: "", color: "", design: "",
  rolls: "", weight: "", meters: "", remarks: ""
});

function generateInwardId(existing) {
  const yy = new Date().getFullYear().toString().slice(-2);
  const prefix = `IGP${yy}`;
  const nums = (existing || [])
    .map(d => d.inwardId || "")
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.slice(prefix.length), 10) || 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${next.toString().padStart(3, "0")}`;
}

function InwardEntry() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(() => {
    // Restore from "Edit" navigation back, then sessionStorage, else empty.
    if (location.state?.draft) return location.state.draft.form;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) return JSON.parse(saved).form;
    } catch (_) {}
    return { ...EMPTY_FORM };
  });

  const [items, setItems] = useState(() => {
    if (location.state?.draft) return location.state.draft.items;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) return JSON.parse(saved).items;
    } catch (_) {}
    return [blankItem()];
  });

  const [itemCount, setItemCount] = useState(items.length);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/contracts`).then(r => r.json()).then(setContracts).catch(console.error);
  }, []);

  // Auto-generate Gate Pass No on mount if not already set
  useEffect(() => {
    if (form.gatePassNo) return;
    fetch(`${API_URL}/inward`)
      .then(res => res.json())
      .then(list => {
        setForm(prev => ({ ...prev, gatePassNo: generateInwardId(list) }));
      })
      .catch(() => {
        setForm(prev => ({ ...prev, gatePassNo: generateInwardId([]) }));
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleItem = (i, field, value) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handleCountChange = (raw) => {
    const n = Math.max(1, Math.min(500, parseInt(raw, 10) || 1));
    setItemCount(n);
    setItems(prev => {
      if (n === prev.length) return prev;
      if (n > prev.length) {
        return [...prev, ...Array.from({ length: n - prev.length }, blankItem)];
      }
      return prev.slice(0, n);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.gatePassNo) {
      alert("Gate Pass No is required (auto-generated; please wait or refresh)");
      return;
    }
    if (!form.contractNo) {
      alert("Contract is required (stock is scoped per contract)");
      return;
    }
    if (!form.supplierName.trim()) {
      alert("Supplier / Party Name is required");
      return;
    }
    const cleanItems = items.filter(it => it.description || it.weight || it.rolls);
    if (cleanItems.length === 0) {
      alert("Add at least one item with a description, weight, or roll count");
      return;
    }

    const draft = { form, items };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    navigate("/inward-preview", { state: { draft } });
  };

  const handleReset = () => {
    sessionStorage.removeItem(DRAFT_KEY);
    setForm({ ...EMPTY_FORM });
    setItems([blankItem()]);
    setItemCount(1);
    fetch(`${API_URL}/inward`)
      .then(res => res.json())
      .then(list => setForm(prev => ({ ...prev, gatePassNo: generateInwardId(list) })))
      .catch(() => {});
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Inward Gate Pass — Entry</h1>
            <p>Fill the details below. You'll see a printable preview on the next step.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-party-form">

          <div className="form-section">
            <h3>Basic Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Gate Pass No <small style={{ color: "#888" }}>(auto-generated)</small></label>
                <input value={form.gatePassNo} readOnly
                  style={{ backgroundColor: "#eef2ff", fontWeight: 700, color: "#1e3a8a" }} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.dated}
                  onChange={e => handleField("dated", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contract <span className="required">*</span></label>
                <select value={form.contractNo}
                  onChange={e => {
                    const sel = contracts.find(c => c.contractNo === e.target.value);
                    handleField("contractNo", e.target.value);
                    if (sel && !form.supplierName) handleField("supplierName", sel.nameOfParty || "");
                  }} required>
                  <option value="">Select contract</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.contractNo}>
                      {c.contractNo} — {c.nameOfParty || "?"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Supplier / Party Name <span className="required">*</span></label>
                <input value={form.supplierName}
                  onChange={e => handleField("supplierName", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Reference Challan / PO No.</label>
                <input value={form.referenceChallan}
                  onChange={e => handleField("referenceChallan", e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label>Received From (Address)</label>
                <input value={form.receivedFrom}
                  onChange={e => handleField("receivedFrom", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Vehicle No.</label>
                <input value={form.vehicleNo}
                  onChange={e => handleField("vehicleNo", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Driver Name / Contact</label>
                <input value={form.driverName}
                  onChange={e => handleField("driverName", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Fabric Type</label>
                <select value={form.fabricType}
                  onChange={e => handleField("fabricType", e.target.value)}>
                  <option value="GREY">Grey / Greige</option>
                  <option value="DYED">Dyed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Items</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Number of Items</label>
                <input type="number" min="1" max="500" value={itemCount}
                  onChange={e => handleCountChange(e.target.value)} />
              </div>
            </div>

            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f5ff" }}>
                    <th style={th}>#</th>
                    <th style={th}>Description / Quality</th>
                    <th style={th}>Color</th>
                    <th style={th}>Design</th>
                    <th style={th}>Rolls</th>
                    <th style={th}>Weight (kg)</th>
                    <th style={th}>Meters</th>
                    <th style={th}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td style={td}>{i + 1}</td>
                      <td style={td}><input style={cell} value={it.description}
                        onChange={e => handleItem(i, "description", e.target.value)} /></td>
                      <td style={td}><input style={cell} value={it.color}
                        onChange={e => handleItem(i, "color", e.target.value)} /></td>
                      <td style={td}><input style={cell} value={it.design}
                        onChange={e => handleItem(i, "design", e.target.value)} /></td>
                      <td style={td}><input type="number" style={cell} value={it.rolls}
                        onChange={e => handleItem(i, "rolls", e.target.value)} /></td>
                      <td style={td}><input type="number" style={cell} value={it.weight}
                        onChange={e => handleItem(i, "weight", e.target.value)} /></td>
                      <td style={td}><input type="number" style={cell} value={it.meters}
                        onChange={e => handleItem(i, "meters", e.target.value)} /></td>
                      <td style={td}><input style={cell} value={it.remarks}
                        onChange={e => handleItem(i, "remarks", e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">Continue → Preview</button>
            <button type="button" className="btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn-reset" onClick={() => navigate("/")}
              style={{ marginLeft: "auto" }}>← Dashboard</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const th = { padding: "10px 8px", textAlign: "left", fontWeight: 600, color: "#2c3e50",
             borderBottom: "2px solid #667eea" };
const td = { padding: "6px 4px", borderBottom: "1px solid #e0e0e0" };
const cell = { width: "100%", padding: "6px 8px", border: "1px solid #d4dae3",
               borderRadius: 4, fontSize: 13 };

export default InwardEntry;
