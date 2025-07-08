import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../utils/api";
import "../../styles/Admin.css";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/admin/reports").then((res) => setReports(res.data));
  }, []);

  const markResolved = async (id) => {
    await api.patch(`/admin/reports/${id}`, { status: "resolved" });
    setReports((rep) =>
      rep.map((r) => (r._id === id ? { ...r, status: "resolved" } : r))
    );
  };

  return (
    <AdminLayout>
      <section className="admin-card">
        <h3>User Reports</h3>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Target</th>
              <th>Reason</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td>{r.reporterEmail}</td>
                <td>{r.targetEmail}</td>
                <td>{r.reason}</td>
                <td>
                  <span
                    className={`admin-pill admin-badge ${
                      r.status === "resolved"
                        ? "resolved"
                        : r.status === "pending"
                        ? "pending"
                        : "open"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status !== "resolved" && (
                    <button
                      className="admin-btn"
                      onClick={() => markResolved(r._id)}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
