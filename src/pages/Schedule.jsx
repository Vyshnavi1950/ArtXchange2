/*  Schedule.jsx  – Calendar + e‑mail scheduling */
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Schedule.css";

export default function Schedule() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  /* fetch sessions once */
  useEffect(() => {
    api.get("/schedule").then((res) =>
      setEvents(
        res.data.map((s) => ({
          id: s._id,
          title: `${s.title} (${s.skill})`,
          start: s.dateStart,
          end: s.dateEnd,
          color:
            s.status === "done"
              ? "#4caf50"
              : s.status === "cancelled"
              ? "#e54848"
              : "#6c63ff",
        }))
      )
    );
  }, []);

  /* create a session after selecting a slot */
  const handleSelect = async (info) => {
    const title = prompt("Enter session title:");
    if (!title) return;

    const skill = prompt("Skill to practise / teach:");
    if (!skill) return;

    const partnerEmail = prompt("Partner's email:");
    if (!partnerEmail) return;

    try {
      /* 1️⃣ look up partner by e‑mail */
      const { data: partner } = await api.get(
        `/users/email/${encodeURIComponent(partnerEmail)}`
      );

      if (partner._id === user._id) {
        alert("You cannot schedule with yourself.");
        return;
      }

      /* 2️⃣ save session in DB */
      const { data: saved } = await api.post("/schedule", {
        title,
        skill,
        dateStart: info.startStr,
        dateEnd: info.endStr,
        partnerId: partner._id,
      });

      /* 3️⃣ add to calendar */
      setEvents((prev) => [
        ...prev,
        {
          id: saved._id,
          title: `${saved.title} (${saved.skill})`,
          start: saved.dateStart,
          end: saved.dateEnd,
          color: "#6c63ff",
        },
      ]);
    } catch (err) {
      alert(
        "Could not schedule session. " +
          (err.response?.data?.msg || err.message)
      );
    }
  };

  return (
    <div className="schedule-page">
      <h2>My Schedule</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
        selectable
        selectMirror
        select={handleSelect}
        events={events}
      />
    </div>
  );
}
