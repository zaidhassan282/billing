import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_URL } from "./config";
import InwardGatePassDocument from "./InwardGatePassDocument";

const DRAFT_KEY = "inward-entry-draft";

function InwardPreview() {
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
    navigate("/inward-entry");
  }, [location.state, navigate]);

  if (!draft) {
    return <div className="loading-container"><h2>Loading…</h2></div>;
  }

  const { form, items } = draft;

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
        inwardId: form.gatePassNo,
        dated: form.dated || null,
        nameOfParty: form.supplierName,
        supplierName: form.supplierName,
        partyCode: "",
        contractNo: form.contractNo || form.referenceChallan || "",
        customerLotNo: "",
        factoryLotNo: "",
        address: form.receivedFrom,
        vehicleNo: form.vehicleNo,
        driverName: form.driverName,
        referenceNo: form.referenceChallan,
        fabricType: form.fabricType,
        isDyedFabric: form.fabricType === "DYED",
        isGreigeFabric: form.fabricType === "GREY",
        gateTime: form.gateInTime,
        securityGuardName: form.securityGuard,
        checkedBy: form.receivedCheckedBy,
        items: cleanItems
      };

      const res = await fetch(`${API_URL}/inward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }
      sessionStorage.removeItem(DRAFT_KEY);
      alert("Inward Gate Pass saved successfully");
      navigate("/");
    } catch (err) {
      alert("Error saving: " + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    navigate("/inward-entry", { state: { draft } });
  };

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const node = document.getElementById("inward-gatepass-doc");
    if (!node) return;
    html2canvas(node, { scale: 3, backgroundColor: "#ffffff" }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 200;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 5, 5, imgWidth, imgHeight);
      pdf.save(`InwardGatePass_${form.gatePassNo || "draft"}.pdf`);
    });
  };

  return (
    <div className="igp-wrapper">
      <div className="igp-actions">
        <button className="igp-btn igp-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "💾 Save"}
        </button>
        <button className="igp-btn igp-btn-print" onClick={handleEdit}>✏️ Edit</button>
        <button className="igp-btn igp-btn-print" onClick={handlePrint}>🖨️ Print</button>
        <button className="igp-btn igp-btn-pdf" onClick={handlePDF}>📄 Download PDF</button>
      </div>
      <InwardGatePassDocument form={form} items={items} readOnly={true} />
    </div>
  );
}

export default InwardPreview;
