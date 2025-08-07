import React from "react";
import "./DashboardDataCard.css";
import { MdSchedule } from "react-icons/md";
import { CiMail } from "react-icons/ci";

function DashboardDataCard() {
  const data = [
    { icon: <MdSchedule />, title: "Scheduled", number: 12 },
    { icon: <CiMail />, title: "Publish", number: 121 },
  ];
  return (
    <div className="dashboard-data-card">
      {data.map((item, index) => (
        <div key={index} className="data-card">
          <div className="data-icon">{item.icon}</div>
          <div>{item.title}</div>
          <div>{item.number}</div>
        </div>
      ))}
    </div>
  );
}

export default DashboardDataCard;
