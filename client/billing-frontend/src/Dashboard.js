import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* HEADER */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-placeholder">LOGO</div>
          </div>
          <div className="header-text">
            <h1>FINE FUSION TEXTILE</h1>
            <p>Billing & Document Management System</p>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Welcome to Your Billing System</h2>
          <p>Manage invoices, contracts, gate passes, inventory, and receipts with ease</p>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section className="modules-section">
        <div className="modules-container">
          <h3 className="section-title">Select Module</h3>
          <div className="cards-grid">

            <Card
              icon="➕"
              title="Add Party"
              description="Add new party to permanent table"
              onClick={() => navigate("/add-party")}
            />
            <Card
              icon="📑"
              title="Permanent Table"
              description="Permanent entries and records"
              onClick={() => navigate("/permenant-table")}
            />
            <Card
              icon="🧾"
              title="Invoice"
              description="Create and manage invoices"
              onClick={() => navigate("/invoice")}
            />
            <Card
              icon="📋"
              title="Contract"
              description="Create and manage contracts"
              onClick={() => navigate("/contract")}
            />
            <Card
              icon="📊"
              title="Contract Table"
              description="View and manage sales contracts"
              onClick={() => navigate("/contracts")}
            />

            <Card
              icon="🎫"
              title="Inward Gate Pass"
              description="Receive greigh material"
              onClick={() => navigate("/inward-page")}
            />
            <Card
              icon="📤"
              title="Outward Gate Pass"
              description="Issue/return materials to customers"
              onClick={() => navigate("/outward-gatepass")}
            />
            <Card
              icon="🏭"
              title="Issue to Dyeing"
              description="Issue greigh to dyeing process"
              onClick={() => navigate("/issue-to-dyeing")}
            />
            <Card
              icon="🎨"
              title="Dyed Receive"
              description="Receive dyed fabric"
              onClick={() => navigate("/dyed-receive")}
            />

            <Card
              icon="📦"
              title="Inventory"
              description="Manage grey and dyed fabric inventory"
              onClick={() => navigate("/inventory")}
            />
            <Card
              icon="📄"
              title="Receipts Table"
              description="View and manage receipt documents"
              onClick={() => navigate("/receipts")}
            />
            <Card
              icon="🔖"
              title="Greigh Receipt"
              description="Greigh receipt management"
              onClick={() => navigate("/griegh-receipts")}
            />

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>&copy; 2026 Fine Fusion Textile. All rights reserved. | Karachi, Pakistan</p>
      </footer>

    </div>
  );
}

function Card({ icon, title, description, onClick }) {
  return (
    <div className="module-card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      <div className="card-arrow">→</div>
    </div>
  );
}

export default Dashboard;
