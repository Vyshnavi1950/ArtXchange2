import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../utils/api";
import "../../styles/Admin.css";

export default function SessionsList() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get("/admin/sessions").then((res) => setSessions(res.data));
  }, []);

  return (
    <AdminLayout>
      <section className="admin-card">
        <h3>Scheduled Sessions</h3>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Artists</th>
              <th>Skill</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id}>
                <td>{s.userAName} ⇄ {s.userBName}</td>
                <td>{s.skill}</td>
                <td>{new Date(s.date).toLocaleString()}</td>
                <td>
                  <span className="admin-pill">
                    {s.status === "done" ? "Completed" : "Upcoming"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
