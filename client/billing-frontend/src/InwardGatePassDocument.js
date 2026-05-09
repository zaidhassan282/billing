import React from "react";
import "./InwardGatePassForm.css";

/**
 * Presentational component for the printable Inward Gate Pass.
 * Used by InwardPreview (after user submits the entry form) and by the Logs
 * Document Preview (re-rendering a saved snapshot).
 *
 * Props:
 *   form        — top-level fields object
 *   items       — array of row items
 *   readOnly    — when true, disables editing
 *   onFormChange(field, value)        — only used when !readOnly
 *   onItemChange(index, field, value) — only used when !readOnly
 */
function InwardGatePassDocument({ form = {}, items = [], readOnly = false, onFormChange, onItemChange }) {

  const handleField = (field, value) => {
    if (!readOnly && onFormChange) onFormChange(field, value);
  };

  const handleItem = (i, field, value) => {
    if (!readOnly && onItemChange) onItemChange(i, field, value);
  };

  const fabricType = form.fabricType || "GREY";

  const calcTotal = (field) =>
    items.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0).toFixed(2);

  const inputProps = readOnly ? { readOnly: true } : {};

  return (
    <div id="inward-gatepass-doc" className="igp-doc">
      {/* HEADER */}
      <div className="igp-header">
        <div className="igp-header-left">
          <div className="igp-logo-placeholder" title="Logo will be uploaded later">
            <span className="igp-logo-text">FINE<br />FUSION<br />TEXTILE</span>
            <small className="igp-logo-hint">[ logo ]</small>
          </div>
          <div className="igp-company-name"><strong>FINE FUSION TEXTILE</strong></div>
        </div>
        <div className="igp-header-right">
          <h1 className="igp-title">INWARD GATE PASS</h1>
        </div>
      </div>

      <div className="igp-address-bar">
        Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com
      </div>

      {/* TOP FIELDS */}
      <div className="igp-top-fields">
        <div className="igp-top-field">
          <div className="igp-top-label">GATE PASS NO.</div>
          <input type="text" className="igp-top-input" value={form.gatePassNo || ""}
            onChange={e => handleField("gatePassNo", e.target.value)} {...inputProps} />
        </div>
        <div className="igp-top-field">
          <div className="igp-top-label">DATE</div>
          <input type="date" className="igp-top-input" value={form.dated || ""}
            onChange={e => handleField("dated", e.target.value)} {...inputProps} />
        </div>
      </div>

      {/* PARTY DETAILS */}
      <div className="igp-section-header">PARTY / DETAILS</div>
      <div className="igp-section-body">
        <Row label="Supplier / Party Name" value={form.supplierName || ""}
          onChange={v => handleField("supplierName", v)} {...inputProps} />
        <Row label="Received From (Address)" value={form.receivedFrom || ""}
          onChange={v => handleField("receivedFrom", v)} {...inputProps} />
        <Row label="Vehicle No. / Transporter" value={form.vehicleNo || ""}
          onChange={v => handleField("vehicleNo", v)} {...inputProps} />
        <Row label="Driver Name / Contact" value={form.driverName || ""}
          onChange={v => handleField("driverName", v)} {...inputProps} />
        <Row label="Reference Challan / PO No." value={form.referenceChallan || ""}
          onChange={v => handleField("referenceChallan", v)} {...inputProps} />
      </div>

      {/* FABRIC TYPE */}
      <div className="igp-section-header">FABRIC DETAILS</div>
      <div className="igp-fabric-type-row">
        <div className="igp-fabric-type-label">Fabric Type</div>
        <label className={`igp-radio-label ${fabricType === "DYED" ? "active" : ""}`}>
          <input type="radio" name="fabricType" value="DYED"
            checked={fabricType === "DYED"} disabled={readOnly}
            onChange={() => handleField("fabricType", "DYED")} />
          <span className="igp-radio-custom"></span><strong>DYED FABRIC</strong>
        </label>
        <label className={`igp-radio-label ${fabricType === "GREY" ? "active" : ""}`}>
          <input type="radio" name="fabricType" value="GREY"
            checked={fabricType === "GREY"} disabled={readOnly}
            onChange={() => handleField("fabricType", "GREY")} />
          <span className="igp-radio-custom"></span><strong>GREY FABRIC</strong>
        </label>
      </div>

      {/* ITEMS TABLE */}
      <table className="igp-items-table">
        <thead>
          <tr>
            <th className="igp-col-no">#</th>
            <th>Description / Quality</th>
            <th>Color / Shade</th>
            <th>Design / Article</th>
            <th>No. of Rolls/Bags</th>
            <th>Weight (KGs)</th>
            <th>Meters / Yards</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="igp-col-no">{i + 1}</td>
              <td><input type="text" className="igp-cell-input" value={item.description || ""}
                onChange={e => handleItem(i, "description", e.target.value)} {...inputProps} /></td>
              <td><input type="text" className="igp-cell-input" value={item.color || ""}
                onChange={e => handleItem(i, "color", e.target.value)} {...inputProps} /></td>
              <td><input type="text" className="igp-cell-input" value={item.design || ""}
                onChange={e => handleItem(i, "design", e.target.value)} {...inputProps} /></td>
              <td><input type="number" className="igp-cell-input igp-cell-number" value={item.rolls || ""}
                onChange={e => handleItem(i, "rolls", e.target.value)} {...inputProps} /></td>
              <td><input type="number" className="igp-cell-input igp-cell-number" value={item.weight || ""}
                onChange={e => handleItem(i, "weight", e.target.value)} {...inputProps} /></td>
              <td><input type="number" className="igp-cell-input igp-cell-number" value={item.meters || ""}
                onChange={e => handleItem(i, "meters", e.target.value)} {...inputProps} /></td>
              <td><input type="text" className="igp-cell-input" value={item.remarks || ""}
                onChange={e => handleItem(i, "remarks", e.target.value)} {...inputProps} /></td>
            </tr>
          ))}
          <tr className="igp-total-row">
            <td colSpan="4" className="igp-total-label">TOTAL</td>
            <td className="igp-total-value">{calcTotal("rolls")}</td>
            <td className="igp-total-value">{calcTotal("weight")}</td>
            <td className="igp-total-value">{calcTotal("meters")}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* SECURITY */}
      <div className="igp-section-header">SECURITY / GATE CHECKING</div>
      <div className="igp-section-body">
        <Row label="Gate In Time" value={form.gateInTime || ""}
          onChange={v => handleField("gateInTime", v)} {...inputProps} />
        <Row label="Security Guard Name" value={form.securityGuard || ""}
          onChange={v => handleField("securityGuard", v)} {...inputProps} />
        <Row label="Received & Checked By" value={form.receivedCheckedBy || ""}
          onChange={v => handleField("receivedCheckedBy", v)} {...inputProps} />
      </div>

      {/* SIGNATURES */}
      <div className="igp-signatures">
        <SigBlock title="RECEIVED BY"
          name={form.receivedByName} designation={form.receivedByDesignation} date={form.receivedByDate}
          onName={v => handleField("receivedByName", v)}
          onDesignation={v => handleField("receivedByDesignation", v)}
          onDate={v => handleField("receivedByDate", v)}
          designationLabel="Designation:" {...inputProps} />
        <SigBlock title="STORE / WAREHOUSE"
          name={form.storeName} designation={form.storeSignature} date={form.storeDate}
          onName={v => handleField("storeName", v)}
          onDesignation={v => handleField("storeSignature", v)}
          onDate={v => handleField("storeDate", v)}
          designationLabel="Signature:" {...inputProps} />
        <SigBlock title="AUTHORIZED SIGNATORY"
          name={form.authorizedName} designation={form.authorizedDesignation} date={form.authorizedDate}
          onName={v => handleField("authorizedName", v)}
          onDesignation={v => handleField("authorizedDesignation", v)}
          onDate={v => handleField("authorizedDate", v)}
          designationLabel="Designation & Stamp:" {...inputProps} />
      </div>

      <div className="igp-footer-note">
        This gatepass must be retained for record. All issued goods must be verified before storage. | Fine Fusion Textile
      </div>
    </div>
  );
}

function Row({ label, value, onChange, readOnly }) {
  return (
    <div className="igp-row">
      <div className="igp-row-label">{label}</div>
      <input type="text" className="igp-row-input" value={value || ""}
        onChange={e => onChange(e.target.value)} readOnly={readOnly} />
    </div>
  );
}

function SigBlock({ title, name, designation, date, designationLabel,
                    onName, onDesignation, onDate, readOnly }) {
  return (
    <div className="igp-signature-col">
      <div className="igp-signature-header">{title}</div>
      <div className="igp-signature-body">
        <div className="igp-sig-line">
          <span className="igp-sig-label">Name:</span>
          <input type="text" className="igp-sig-input" value={name || ""}
            onChange={e => onName(e.target.value)} readOnly={readOnly} />
        </div>
        <div className="igp-sig-line">
          <span className="igp-sig-label">{designationLabel}</span>
          <input type="text" className="igp-sig-input" value={designation || ""}
            onChange={e => onDesignation(e.target.value)} readOnly={readOnly} />
        </div>
        <div className="igp-sig-line">
          <span className="igp-sig-label">Date:</span>
          <input type="text" className="igp-sig-input" value={date || ""}
            onChange={e => onDate(e.target.value)} readOnly={readOnly} />
        </div>
      </div>
    </div>
  );
}

export default InwardGatePassDocument;
