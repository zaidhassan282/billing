import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_URL } from "./config";
import OutwardGatePassDocument from "./OutwardGatePassDocument";

const DRAFT_KEY = "outward-entry-draft";

function OutwardPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state?.draft) {
      setDraft(location.state.draft);
      return;
    }
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        setDraft(JSON.parse(saved));
        return;
      }
    } catch (_) {}
    navigate("/outward-entry");
  }, [location.state, navigate]);

  if (!draft) {
    return <div className="loading-container"><h2>Loading…</h2></div>;
  }

  const { form, items, fromOrder } = draft;

  // Backend uses ISSUE for delivery; map UI's DELIVERY → ISSUE.
  const backendType = form.type === "RETURN" ? "RETURN" : "ISSUE";
  const endpoint = backendType === "RETURN"
    ? `${API_URL}/outward/return`
    : `${API_URL}/outward/issue`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanItems = items
        .filter(it => it.description || it.weight || it.rolls)
        .map(it => ({
          quality: it.description,
          color: it.color || "",
          design: it.design || "",
          roll: parseInt(it.rolls, 10) || 0,
          kg: parseFloat(it.weight) || 0,
          meters: parseFloat(it.meters) || 0,
          remarks: it.remarks || ""
        }));

      const payload = {
        outwardId: form.gatePassNo,
        dated: form.dated || null,
        type: backendType,
        customerName: form.customerName,
        customerCode: "",
        contractNo: form.contractNo || form.referenceInvoice || "",
        customerLotNo: "",
        factoryLotNo: "",
        address: form.deliveryAddress,
        vehicleNo: form.vehicleNo,
        driverName: form.driverName,
        referenceNo: form.referenceInvoice,
        fabricType: form.fabricType,
        gateTime: form.gateOutTime,
        securityGuardName: form.securityGuard,
        checkedBy: form.checkedByStore,
        items: cleanItems
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }
      const saved = await res.json();

      // If this gate pass came from an Order's "Generate Outward GP" button,
      // mark that order as DELIVERED.
      if (fromOrder?.id) {
        try {
          await fetch(`${API_URL}/orders/${fromOrder.id}/deliver`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outwardId: saved.outwardId })
          });
        } catch (err) {
          console.warn("Couldn't mark order delivered:", err);
        }
      }

      sessionStorage.removeItem(DRAFT_KEY);
      alert(`Outward Gate Pass (${form.type}) saved successfully`);
      navigate(fromOrder ? "/orders" : "/");
    } catch (err) {
      alert("Error saving: " + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    navigate("/outward-entry", { state: { draft } });
  };

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const node = document.getElementById("outward-gatepass-doc");
    if (!node) return;
    html2canvas(node, { scale: 3, backgroundColor: "#ffffff" }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 200;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 5, 5, imgWidth, imgHeight);
      pdf.save(`OutwardGatePass_${form.gatePassNo || "draft"}.pdf`);
    });
  };

  return (
    <div className="ogp-wrapper">
      <div className="ogp-actions">
        <button className="ogp-btn ogp-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "💾 Save"}
        </button>
        <button className="ogp-btn ogp-btn-print" onClick={handleEdit}>✏️ Edit</button>
        <button className="ogp-btn ogp-btn-print" onClick={handlePrint}>🖨️ Print</button>
        <button className="ogp-btn ogp-btn-pdf" onClick={handlePDF}>📄 Download PDF</button>
      </div>
      <OutwardGatePassDocument form={form} items={items} readOnly={true} />
    </div>
  );
}

export default OutwardPreview;
