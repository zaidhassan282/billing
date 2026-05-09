import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import "./AddParty.css";

function IssueToDyeingPage() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [issues, setIssues] = useState([]);
  const [contractNo, setContractNo] = useState("");
  const [contract, setContract] = useState(null);
  const [stock, setStock] = useState([]);          // greige inventory rows for this contract
  const [stockLoading, setStockLoading] = useState(false);

  const [form, setForm] = useState({
    quality: "", color: "", qtyKg: "", qtyRolls: "", qtyMeters: "", remarks: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [issueId, setIssueId] = useState("");

  // Auto-generate ITD26001-style preview id
  const computeNextId = (existing) => {
    const yy = new Date().getFullYear().toString().slice(-2);
    const prefix = `ITD${yy}`;
    const nums = (existing || [])
      .map(d => d.issueId || "")
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.slice(prefix.length), 10) || 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${prefix}${next.toString().padStart(3, "0")}`;
  };

  useEffect(() => {
    fetch(`${API_URL}/contracts`).then(r => r.json()).then(setContracts).catch(console.error);
    fetch(`${API_URL}/dyeing/issues`)
      .then(r => r.json())
      .then(list => { setIssues(list); setIssueId(computeNextId(list)); })
      .catch(() => setIssueId(computeNextId([])));
  }, []);

  // When contract changes, load its greige inventory
  useEffect(() => {
    if (!contractNo) { setStock([]); setContract(null); return; }
    setStockLoading(true);
    setContract(contracts.find(c => c.contractNo === contractNo) || null);
    fetch(`${API_URL}/inventory`)
      .then(r => r.json())
      .then(rows => {
        const filtered = rows.filter(r => r.contractNo === contractNo && r.stage === "GREIGH");
        setStock(filtered);
      })
      .catch(console.error)
      .finally(() => setStockLoading(false));
  }, [contractNo, contracts]);

  // When user picks quality+color, prefill row reference
  const selectedRow = stock.find(
    s => s.quality === form.quality && (s.color || "NA") === (form.color || "NA")
  );

  const cap = {
    kg: selectedRow?.availableKg ?? 0,
    rolls: selectedRow?.availableRolls ?? 0,
    meters: selectedRow?.availableMeters ?? 0
  };

  const handleField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!contractNo) return "Pick a contract first";
    if (!form.quality) return "Pick a quality";
    if (!selectedRow) return "Selected quality/color is not in this contract's greige stock";
    const kg = parseFloat(form.qtyKg);
    if (!kg || kg <= 0) return "Weight (kg) must be greater than 0";
    if (kg > cap.kg) return `Weight exceeds available (${cap.kg} kg)`;
    const rolls = parseInt(form.qtyRolls, 10) || 0;
    if (rolls > cap.rolls) return `Rolls exceed available (${cap.rolls})`;
    const meters = parseFloat(form.qtyMeters) || 0;
    if (meters > cap.meters) return `Meters exceed available (${cap.meters})`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }

    setSubmitting(true);
    try {
      const payload = {
        contractNo,
        quality: form.quality,
        color: form.color || "NA",
        qtyKg: parseFloat(form.qtyKg),
        qtyRolls: parseInt(form.qtyRolls, 10) || 0,
        qtyMeters: parseFloat(form.qtyMeters) || 0,
        remarks: form.remarks
      };
      const res = await fetch(`${API_URL}/dyeing/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Save failed");
      }
      const saved = await res.json();
      alert(`Issued to dyeing: ${saved.issueId}`);
      navigate("/");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Issue to Dyeing</h1>
            <p>Pick a contract, then issue greige stock to dyeing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-party-form">

          <div className="form-section">
            <h3>Identifier</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Issue ID <small style={{ color: "#888" }}>(auto-generated)</small></label>
                <input value={issueId} readOnly
                  style={{ backgroundColor: "#eef2ff", fontWeight: 700, color: "#1e3a8a" }} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contract</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contract No <span className="required">*</span></label>
                <select value={contractNo} onChange={e => setContractNo(e.target.value)} required>
                  <option value="">Select contract</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.contractNo}>
                      {c.contractNo} — {c.nameOfParty || "?"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Party</label>
                <input value={contract?.nameOfParty || ""} readOnly />
              </div>
            </div>
          </div>

          {contractNo && (
            <div className="form-section">
              <h3>Available Greige Stock for {contractNo}</h3>
              {stockLoading ? <p>Loading…</p> : stock.length === 0 ? (
                <div style={{ padding: 16, color: "#999", backgroundColor: "#f9f9f9",
                              borderRadius: 6 }}>
                  No greige stock recorded against this contract yet.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f5ff" }}>
                      <th style={th}>Quality</th>
                      <th style={th}>Color</th>
                      <th style={th}>Available kg</th>
                      <th style={th}>Available rolls</th>
                      <th style={th}>Available meters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map(r => (
                      <tr key={r.id}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              form.quality === r.quality && (form.color || "NA") === (r.color || "NA")
                                ? "#dbeafe" : undefined
                          }}
                          onClick={() => setForm(prev => ({
                            ...prev, quality: r.quality, color: r.color || ""
                          }))}>
                        <td style={td}>{r.quality}</td>
                        <td style={td}>{r.color || "NA"}</td>
                        <td style={td}>{r.availableKg ?? 0}</td>
                        <td style={td}>{r.availableRolls ?? 0}</td>
                        <td style={td}>{r.availableMeters ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="form-section">
            <h3>Issue Quantity</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Quality <span className="required">*</span></label>
                <input value={form.quality}
                  onChange={e => handleField("quality", e.target.value)}
                  placeholder="Click a row above or type" required />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input value={form.color}
                  onChange={e => handleField("color", e.target.value)}
                  placeholder="NA if not applicable" />
              </div>
              <div className="form-group">
                <label>Weight (kg) <span className="required">*</span>{selectedRow && (
                  <small style={{ color: "#666" }}> &nbsp;avail {cap.kg}</small>)}</label>
                <input type="number" step="0.01" min="0" max={cap.kg || undefined}
                  value={form.qtyKg}
                  onChange={e => handleField("qtyKg", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Rolls{selectedRow && <small style={{ color: "#666" }}> &nbsp;avail {cap.rolls}</small>}</label>
                <input type="number" min="0" max={cap.rolls || undefined}
                  value={form.qtyRolls}
                  onChange={e => handleField("qtyRolls", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Meters{selectedRow && <small style={{ color: "#666" }}> &nbsp;avail {cap.meters}</small>}</label>
                <input type="number" step="0.01" min="0" max={cap.meters || undefined}
                  value={form.qtyMeters}
                  onChange={e => handleField("qtyMeters", e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label>Remarks</label>
                <input value={form.remarks}
                  onChange={e => handleField("remarks", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Issuing…" : "Issue to Dyeing"}
            </button>
            <button type="button" className="btn-reset" onClick={() => navigate("/")}>
              ← Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const th = { padding: "10px 8px", textAlign: "left", fontWeight: 600, color: "#2c3e50",
             borderBottom: "2px solid #667eea" };
const td = { padding: "8px", borderBottom: "1px solid #e0e0e0", color: "#374151" };

export default IssueToDyeingPage;
