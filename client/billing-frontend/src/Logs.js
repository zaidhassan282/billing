import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import "./AddParty.css";

const TABS = [
  { key: "",                 label: "All" },
  { key: "PermanentTable",   label: "Permanent Parties" },
  { key: "Contract",         label: "Contracts" },
  { key: "InwardGatePass",   label: "Inward GP" },
  { key: "OutwardGatePass",  label: "Outward GP" },
  { key: "IssueToDyeing",    label: "Issue to Dyeing" },
  { key: "DyedReceive",      label: "Dyed Receive" },
  { key: "Order",            label: "Orders" },
  { key: "Entry",            label: "Daily Entries" }
];

const DOCUMENT_TYPES = new Set([
  "Contract", "InwardGatePass", "OutwardGatePass", "DyedReceive"
]);

const PAGE_SIZE = 25;

function Logs() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("");
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", PAGE_SIZE);
    if (tab) params.set("entityType", tab);
    fetch(`${API_URL}/audit?${params.toString()}`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => {
        console.error(err);
        setData({ content: [], totalPages: 0, number: 0 });
      })
      .finally(() => setLoading(false));
  }, [tab, page]);

  const handleTabChange = (key) => {
    setTab(key);
    setPage(0);
    setExpandedId(null);
  };

  const handlePreview = (row) => {
    navigate(`/preview/${row.entityType}/${row.id}`);
  };

  const renderChanges = (changesJson) => {
    if (!changesJson) return null;
    let changes;
    try { changes = JSON.parse(changesJson); } catch (_) { return null; }
    if (!Array.isArray(changes) || changes.length === 0) return null;
    return (
      <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ backgroundColor: "#fafbff" }}>
            <th style={{ ...miniTh, width: "30%" }}>Field</th>
            <th style={miniTh}>Before</th>
            <th style={miniTh}>After</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c, i) => (
            <tr key={i}>
              <td style={miniTd}><code>{c.field}</code></td>
              <td style={miniTd}>{formatVal(c.before)}</td>
              <td style={miniTd}>{formatVal(c.after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>System Logs</h1>
            <p>Audit trail of every change in the system.</p>
          </div>
        </div>

        <div className="add-party-form">
          {/* TABS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20,
                         borderBottom: "2px solid #e0e0e0", paddingBottom: 12 }}>
            {TABS.map(t => (
              <button key={t.key || "all"} onClick={() => handleTabChange(t.key)}
                style={{
                  padding: "10px 16px",
                  background: tab === t.key
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f5f5f5",
                  color: tab === t.key ? "white" : "#2c3e50",
                  border: "none", borderRadius: 6, cursor: "pointer",
                  fontWeight: 600, fontSize: 13
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading && <p>Loading…</p>}

          {!loading && data.content.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
              No log entries{tab ? ` for ${tab}` : ""} yet.
            </div>
          )}

          {!loading && data.content.length > 0 && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f5ff", borderBottom: "2px solid #667eea" }}>
                      <th style={th}>When</th>
                      <th style={th}>Entity</th>
                      <th style={th}>ID</th>
                      <th style={th}>Action</th>
                      <th style={th}>By</th>
                      <th style={th}>Summary</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((row, idx) => (
                      <React.Fragment key={row.id}>
                        <tr style={{ borderBottom: "1px solid #e0e0e0",
                                     backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={td}>{fmtDate(row.changedAt)}</td>
                          <td style={td}>{row.entityType}</td>
                          <td style={td}><code>{row.businessId || row.entityId}</code></td>
                          <td style={td}><Badge action={row.action} /></td>
                          <td style={td}>{row.changedBy}</td>
                          <td style={td}>{row.summary}</td>
                          <td style={td}>
                            {DOCUMENT_TYPES.has(row.entityType) && row.action !== "DELETE" && (
                              <button onClick={() => handlePreview(row)}
                                style={btn}>Preview</button>
                            )}
                            {row.action === "UPDATE" && (
                              <button
                                onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                                style={{ ...btn, backgroundColor: "#6b7280", marginLeft: 4 }}>
                                {expandedId === row.id ? "Hide" : "Diff"}
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedId === row.id && (
                          <tr>
                            <td colSpan={7} style={{ padding: 12, backgroundColor: "#f9fafb" }}>
                              {renderChanges(row.changes) || <em>No field changes recorded.</em>}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between",
                             alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#666" }}>
                  Page {data.number + 1} of {Math.max(1, data.totalPages)} · {data.totalElements} total
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    ← Prev
                  </button>
                  <button style={btn} disabled={page + 1 >= data.totalPages}
                    onClick={() => setPage(p => p + 1)}>
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="form-buttons" style={{ marginTop: 24 }}>
            <button className="btn-reset" onClick={() => navigate("/")}>← Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ action }) {
  const colors = {
    CREATE: { bg: "#dcfce7", fg: "#166534" },
    UPDATE: { bg: "#dbeafe", fg: "#1e40af" },
    DELETE: { bg: "#fee2e2", fg: "#991b1b" }
  };
  const c = colors[action] || { bg: "#e5e7eb", fg: "#374151" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                   backgroundColor: c.bg, color: c.fg }}>
      {action}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatVal(v) {
  if (v === null || v === undefined) return <em style={{ color: "#999" }}>(empty)</em>;
  if (typeof v === "object") return <code style={{ fontSize: 11 }}>{JSON.stringify(v)}</code>;
  return String(v);
}

const th = { padding: "12px 10px", textAlign: "left", fontWeight: 600, color: "#2c3e50", fontSize: 13 };
const td = { padding: "10px", color: "#374151", fontSize: 13, verticalAlign: "top" };
const miniTh = { padding: "6px 10px", textAlign: "left", fontWeight: 600, color: "#2c3e50",
                 fontSize: 12, borderBottom: "1px solid #d4dae3" };
const miniTd = { padding: "6px 10px", color: "#374151", fontSize: 12,
                 borderBottom: "1px solid #eef2f7" };
const btn = { padding: "6px 12px", backgroundColor: "#667eea", color: "white",
              border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 };

export default Logs;
