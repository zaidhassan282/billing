import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import "./AddParty.css";

const STATUS_OPTIONS = ["IN_PROGRESS", "TESTING", "READY_FOR_DELIVERY", "DELIVERED"];

const STATUS_COLORS = {
  IN_PROGRESS:        { bg: "#fef3c7", fg: "#92400e", label: "In Progress" },
  TESTING:            { bg: "#dbeafe", fg: "#1e40af", label: "Testing" },
  READY_FOR_DELIVERY: { bg: "#dcfce7", fg: "#166534", label: "Ready for Delivery" },
  DELIVERED:          { bg: "#e5e7eb", fg: "#374151", label: "Delivered" }
};

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    contractNo: "", quality: "", color: "",
    quantityKg: "", quantityRolls: "", quantityMeters: "",
    remarks: ""
  });

  const load = () => {
    setLoading(true);
    const url = filterStatus
      ? `${API_URL}/orders?status=${filterStatus}`
      : `${API_URL}/orders`;
    fetch(url).then(r => r.json()).then(setOrders).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filterStatus]);
  useEffect(() => {
    fetch(`${API_URL}/contracts`).then(r => r.json()).then(setContracts).catch(console.error);
  }, []);

  const updateStatus = async (order, status) => {
    const remarks = window.prompt(`Status → ${status}.  Add a remark (optional):`, order.remarks || "");
    if (remarks === null) return;
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks })
      });
      if (!res.ok) throw new Error(await res.text());
      load();
    } catch (e) { alert("Failed: " + e.message); }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Delete order ${order.orderId}?`)) return;
    await fetch(`${API_URL}/orders/${order.id}`, { method: "DELETE" });
    load();
  };

  const generateOutwardGP = (order) => {
    // Pre-fill OutwardEntry from this order
    const draft = {
      form: {
        gatePassNo: "",
        dated: "",
        type: "DELIVERY",
        fabricType: "DYED",
        customerName: order.nameOfParty || "",
        deliveryAddress: "",
        vehicleNo: "",
        driverName: "",
        referenceInvoice: order.contractNo || "",
        gateOutTime: "",
        securityGuard: "",
        checkedByStore: "",
        issuedByName: "", issuedByDesignation: "", issuedByDate: "",
        storeName: "", storeSignature: "", storeDate: "",
        authorizedName: "", authorizedDesignation: "", authorizedDate: ""
      },
      items: [{
        description: order.quality || "",
        color: order.color || "",
        design: "",
        rolls: order.quantityRolls != null ? String(order.quantityRolls) : "",
        weight: order.quantityKg != null ? String(order.quantityKg) : "",
        meters: order.quantityMeters != null ? String(order.quantityMeters) : "",
        remarks: order.remarks || ""
      }],
      fromOrder: { id: order.id, orderId: order.orderId }
    };
    sessionStorage.setItem("outward-entry-draft", JSON.stringify(draft));
    navigate("/outward-entry", { state: { draft } });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.contractNo) { alert("Pick a contract"); return; }
    if (!form.quality) { alert("Quality is required"); return; }
    const contract = contracts.find(c => c.contractNo === form.contractNo);
    const payload = {
      contractNo: form.contractNo,
      partyCode: contract?.partyCode || "",
      nameOfParty: contract?.nameOfParty || "",
      quality: form.quality,
      color: form.color || "NA",
      quantityKg: parseFloat(form.quantityKg) || 0,
      quantityRolls: parseInt(form.quantityRolls, 10) || 0,
      quantityMeters: parseFloat(form.quantityMeters) || 0,
      status: "IN_PROGRESS",
      remarks: form.remarks
    };
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      setForm({ contractNo: "", quality: "", color: "",
                quantityKg: "", quantityRolls: "", quantityMeters: "", remarks: "" });
      setShowForm(false);
      load();
    } catch (e) { alert("Failed: " + e.message); }
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Orders</h1>
            <p>Track dyed orders from in-progress through delivery.</p>
          </div>
        </div>

        <div className="add-party-form">

          <div style={{ display: "flex", gap: 12, alignItems: "center",
                         marginBottom: 20, flexWrap: "wrap" }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d4dae3" }}>
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
              ))}
            </select>
            <button onClick={() => setShowForm(s => !s)} className="btn-submit"
              style={{ padding: "8px 16px" }}>
              {showForm ? "Cancel" : "+ New Order"}
            </button>
            <button onClick={load} className="btn-reset" style={{ padding: "8px 16px" }}>
              Refresh
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate}
              style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8,
                       marginBottom: 24, border: "1px solid #e0e0e0" }}>
              <h3 style={{ marginTop: 0 }}>Create Order</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contract <span className="required">*</span></label>
                  <select value={form.contractNo}
                    onChange={e => setForm({ ...form, contractNo: e.target.value })} required>
                    <option value="">Select contract</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.contractNo}>
                        {c.contractNo} — {c.nameOfParty || "?"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quality <span className="required">*</span></label>
                  <input value={form.quality}
                    onChange={e => setForm({ ...form, quality: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.01" value={form.quantityKg}
                    onChange={e => setForm({ ...form, quantityKg: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rolls</label>
                  <input type="number" value={form.quantityRolls}
                    onChange={e => setForm({ ...form, quantityRolls: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Meters</label>
                  <input type="number" step="0.01" value={form.quantityMeters}
                    onChange={e => setForm({ ...form, quantityMeters: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Remarks</label>
                  <input value={form.remarks}
                    onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">Create</button>
              </div>
            </form>
          )}

          {loading && <p>Loading…</p>}
          {!loading && orders.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>No orders yet.</div>
          )}

          {!loading && orders.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f5ff", borderBottom: "2px solid #667eea" }}>
                    <th style={th}>Order ID</th>
                    <th style={th}>Contract</th>
                    <th style={th}>Party</th>
                    <th style={th}>Quality</th>
                    <th style={th}>Color</th>
                    <th style={th}>Qty (kg / rolls / m)</th>
                    <th style={th}>Status</th>
                    <th style={th}>Remarks</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const sc = STATUS_COLORS[o.status] || STATUS_COLORS.IN_PROGRESS;
                    return (
                      <tr key={o.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={td}><strong>{o.orderId}</strong></td>
                        <td style={td}>{o.contractNo}</td>
                        <td style={td}>{o.nameOfParty}</td>
                        <td style={td}>{o.quality}</td>
                        <td style={td}>{o.color || "NA"}</td>
                        <td style={td}>
                          {o.quantityKg || 0} kg · {o.quantityRolls || 0} r · {o.quantityMeters || 0} m
                        </td>
                        <td style={td}>
                          <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11,
                                         fontWeight: 600, backgroundColor: sc.bg, color: sc.fg }}>
                            {sc.label}
                          </span>
                        </td>
                        <td style={td}>{o.remarks}</td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {o.status !== "DELIVERED" && (
                              <select value={o.status}
                                onChange={e => updateStatus(o, e.target.value)}
                                style={mini}>
                                {STATUS_OPTIONS.filter(s => s !== "DELIVERED").map(s => (
                                  <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
                                ))}
                              </select>
                            )}
                            {o.status === "READY_FOR_DELIVERY" && (
                              <button onClick={() => generateOutwardGP(o)}
                                style={{ ...mini, backgroundColor: "#11998e", color: "white",
                                         border: "none" }}>
                                Generate Outward GP
                              </button>
                            )}
                            <button onClick={() => deleteOrder(o)}
                              style={{ ...mini, backgroundColor: "#fee2e2", color: "#991b1b",
                                       border: "1px solid #fca5a5" }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-buttons" style={{ marginTop: 24 }}>
            <button className="btn-reset" onClick={() => navigate("/")}>← Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const th = { padding: "12px 8px", textAlign: "left", fontWeight: 600, color: "#2c3e50" };
const td = { padding: "10px 8px", color: "#374151", verticalAlign: "top" };
const mini = { padding: "4px 8px", borderRadius: 4, fontSize: 12, cursor: "pointer" };

export default Orders;
