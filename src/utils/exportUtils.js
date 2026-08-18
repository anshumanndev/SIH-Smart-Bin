// Export Utilities for CSV and Printable Route Manifests

export function exportBinsToCSV(bins) {
  const headers = [
    "Bin ID",
    "Location Name",
    "Latitude",
    "Longitude",
    "Fill Level (%)",
    "Capacity (L)",
    "Waste Type",
    "Battery (%)",
    "Temperature (°C)",
    "Gas PPM",
    "Status",
    "Last Emptied",
    "Assigned Truck"
  ];

  const rows = bins.map((b) => [
    b.id,
    `"${b.name.replace(/"/g, '""')}"`,
    b.lat,
    b.lng,
    b.fillLevel,
    b.capacityLiters,
    b.wasteType,
    b.batteryLevel,
    b.temperature,
    b.gasLevelPpm,
    b.status,
    `"${b.lastEmptied}"`,
    `"${b.assignedTruck || 'Unassigned'}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `EcoRoute_SmartBins_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printRouteManifest(activeRoute, depot) {
  if (!activeRoute || !activeRoute.steps || activeRoute.steps.length === 0) return;

  const win = window.open("", "_blank");
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>EcoRoute™ Dispatch Manifest - Route #${Math.floor(1000 + Math.random()*9000)}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
          .summary-val { font-size: 20px; font-weight: bold; color: #0f172a; }
          .summary-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #1e3a8a; color: #ffffff; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
          .badge-critical { background: #fee2e2; color: #dc2626; }
          .badge-warning { background: #fef3c7; color: #d97706; }
          .badge-optimal { background: #dcfce7; color: #16a34a; }
          .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div class="title">EcoRoute™ Municipal Collection Manifest</div>
              <div class="meta">SIH PS-14 Automated Dispatch Order | Generated: ${new Date().toLocaleString()}</div>
            </div>
            <div>
              <button onclick="window.print()" style="background:#1e3a8a; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Print Manifest</button>
            </div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-val">${activeRoute.optimizedStops.length}</div>
            <div class="summary-lbl">Priority Stops</div>
          </div>
          <div class="summary-card">
            <div class="summary-val">${activeRoute.totalDistanceKm} km</div>
            <div class="summary-lbl">Optimized Distance</div>
          </div>
          <div class="summary-card">
            <div class="summary-val">~${activeRoute.estimatedMinutes} mins</div>
            <div class="summary-lbl">Est. Duration</div>
          </div>
          <div class="summary-card">
            <div class="summary-val" style="color:#16a34a;">${activeRoute.fuelSavedLiters} L / ${activeRoute.co2SavedKg} kg</div>
            <div class="summary-lbl">Fuel & CO₂ Saved</div>
          </div>
        </div>

        <h3>Turn-by-Turn Collection Waypoints</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Action / Location</th>
              <th>Waste Stream</th>
              <th>Fill Level</th>
              <th>Leg Dist</th>
              <th>Cum. ETA</th>
              <th>Sign-off</th>
            </tr>
          </thead>
          <tbody>
            ${activeRoute.steps.map((s) => `
              <tr>
                <td><strong>${s.order}</strong></td>
                <td>
                  <strong>${s.title}</strong>
                  <div style="font-size:11px; color:#64748b;">${s.description}</div>
                </td>
                <td>${s.bin ? s.bin.wasteType : 'Depot Yard'}</td>
                <td>${s.bin ? `<span class="badge badge-${s.bin.status}">${s.bin.fillLevel}%</span>` : '-'}</td>
                <td>${s.distanceFromPrevKm > 0 ? s.distanceFromPrevKm + ' km' : '0 km'}</td>
                <td>+${s.etaMinutes}m</td>
                <td style="border-bottom:1px dashed #cbd5e1; width:80px;"></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          EcoRoute Intelligent Waste Fleet System • Central Municipal Authority • Driver Copy
        </div>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}
