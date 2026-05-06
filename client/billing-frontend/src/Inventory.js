import React, { useState, useEffect } from "react";

function Inventory() {
  const [greyInventory, setGreyInventory] = useState([]);
  const [dyedInventory, setDyedInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("grey");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    setLoading(true);
    fetch("http://localhost:8080/inventory")
      .then(res => res.json())
      .then(data => {
        const grey = data.filter(item => item.stage === "GREIGH" || item.refId?.startsWith("IGP"));
        const dyed = data.filter(item => item.stage === "DYED" || item.refId?.startsWith("DR"));
        setGreyInventory(grey);
        setDyedInventory(dyed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="add-party-page">
        <div className="loading-container">
          <h2>Loading Inventory...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Inventory Management</h1>
            <p>Track your materials at every stage</p>
          </div>
        </div>

        <div className="add-party-form">
          {/* TABS */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0' }}>
            <button
              onClick={() => setActiveTab("grey")}
              style={{
                padding: '15px 30px',
                background: activeTab === "grey" ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
                color: activeTab === "grey" ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              💾 Grey Material
            </button>
            <button
              onClick={() => setActiveTab("dyed")}
              style={{
                padding: '15px 30px',
                background: activeTab === "dyed" ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#f5f5f5',
                color: activeTab === "dyed" ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              🎨 Dyed Fabric
            </button>
          </div>

          {/* GREY INVENTORY TAB */}
          {activeTab === "grey" && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '20px', fontWeight: '600' }}>Grey Material Inventory</h3>
              {greyInventory.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <p style={{ color: '#999', fontSize: '16px' }}>No grey material in inventory</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f5ff', borderBottom: '2px solid #667eea' }}>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Reference ID</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Quality</th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2c3e50' }}>Available (KG)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {greyInventory.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '600' }}>{item.refId}</td>
                          <td style={{ padding: '15px', color: '#555' }}>{item.quality}</td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#2c3e50', fontWeight: '600' }}>{item.availableKg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* DYED INVENTORY TAB */}
          {activeTab === "dyed" && (
            <div>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '20px', fontWeight: '600' }}>Dyed Fabric Inventory</h3>
              {dyedInventory.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <p style={{ color: '#999', fontSize: '16px' }}>No dyed fabric in inventory</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0fff8', borderBottom: '2px solid #11998e' }}>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Reference ID</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Quality</th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2c3e50' }}>Available (KG)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dyedInventory.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '600' }}>{item.refId}</td>
                          <td style={{ padding: '15px', color: '#555' }}>{item.quality}</td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#2c3e50', fontWeight: '600' }}>{item.availableKg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REFRESH BUTTON */}
          <div className="form-buttons">
            <button className="btn-submit" onClick={fetchInventory}>
              Refresh Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
