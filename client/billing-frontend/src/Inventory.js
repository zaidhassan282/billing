import React, { useState, useEffect } from "react";
import { API_URL } from "./config";

function Inventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("grey");
  const [contractFilter, setContractFilter] = useState("");

  const fetchInventory = () => {
    setLoading(true);
    fetch(`${API_URL}/inventory`)
      .then(res => res.json())
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, []);

  const stage = activeTab === "grey" ? "GREIGH" : "DYED";
  const contracts = Array.from(new Set(rows.map(r => r.contractNo).filter(Boolean))).sort();

  const filtered = rows
    .filter(r => r.stage === stage)
    .filter(r => !contractFilter || r.contractNo === contractFilter);

  const totals = filtered.reduce((acc, r) => ({
    kg: acc.kg + (r.availableKg || 0),
    rolls: acc.rolls + (r.availableRolls || 0),
    meters: acc.meters + (r.availableMeters || 0)
  }), { kg: 0, rolls: 0, meters: 0 });

  if (loading) {
    return (
      <div className="add-party-page">
        <div className="loading-container"><h2>Loading Inventory…</h2></div>
      </div>
    );
  }

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Inventory Management</h1>
            <p>Stock per contract, split by Greige and Dyed.</p>
          </div>
        </div>

        <div className="add-party-form">

          {/* TABS */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20,
                         borderBottom: "2px solid #e0e0e0" }}>
            <TabButton active={activeTab === "grey"} onClick={() => setActiveTab("grey")}
              accent="purple" label="💾 Grey Material" />
            <TabButton active={activeTab === "dyed"} onClick={() => setActiveTab("dyed")}
              accent="green" label="🎨 Dyed Fabric" />
          </div>

          {/* CONTRACT FILTER */}
          <div style={{ display: "flex", gap: 12, alignItems: "center",
                         marginBottom: 20, flexWrap: "wrap" }}>
            <label style={{ fontWeight: 600 }}>Contract:</label>
            <select value={contractFilter} onChange={e => setContractFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d4dae3" }}>
              <option value="">All contracts</option>
              {contracts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn-reset" onClick={fetchInventory}
              style={{ padding: "6px 14px" }}>Refresh</button>
            <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>
              <strong>Totals:</strong> {totals.kg.toFixed(2)} kg ·
              {" "}{totals.rolls} rolls ·
              {" "}{totals.meters.toFixed(2)} m
            </div>
          </div>

          {/* TABLE */}
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", backgroundColor: "#f9f9f9",
                          borderRadius: 8, color: "#999" }}>
              No {activeTab === "grey" ? "greige" : "dyed"} stock
              {contractFilter ? ` for contract ${contractFilter}` : ""}.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: activeTab === "grey" ? "#f0f5ff" : "#f0fff8",
                                borderBottom: `2px solid ${activeTab === "grey" ? "#667eea" : "#11998e"}` }}>
                    <th style={th}>Contract</th>
                    <th style={th}>Quality</th>
                    <th style={th}>Color</th>
                    <th style={th}>Source Ref</th>
                    <th style={{ ...th, textAlign: "center" }}>Available kg</th>
                    <th style={{ ...th, textAlign: "center" }}>Rolls</th>
                    <th style={{ ...th, textAlign: "center" }}>Meters</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #e0e0e0",
                                              backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <td style={{ ...td, fontWeight: 600 }}>{row.contractNo}</td>
                      <td style={td}>{row.quality}</td>
                      <td style={td}>{row.color || "NA"}</td>
                      <td style={{ ...td, color: "#666", fontSize: 12 }}>{row.refId}</td>
                      <td style={{ ...td, textAlign: "center", fontWeight: 600 }}>{row.availableKg ?? 0}</td>
                      <td style={{ ...td, textAlign: "center" }}>{row.availableRolls ?? 0}</td>
                      <td style={{ ...td, textAlign: "center" }}>{row.availableMeters ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, accent, label }) {
  const gradient = accent === "purple"
    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
  return (
    <button onClick={onClick} style={{
      padding: "15px 30px",
      background: active ? gradient : "#f5f5f5",
      color: active ? "white" : "#2c3e50",
      border: "none", cursor: "pointer", fontWeight: 600,
      fontSize: 14, textTransform: "uppercase"
    }}>{label}</button>
  );
}

const th = { padding: "15px", textAlign: "left", fontWeight: 600, color: "#2c3e50" };
const td = { padding: "12px 15px", color: "#374151" };

export default Inventory;
