import React, { useState, useEffect } from "react";
import "./App.css";

export default function PaymentReminderApp() {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);


  useEffect(() => {
    fetch("http://localhost:5000/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error("Error fetching reminders:", err));
  }, []);

  // Reminder alert system
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder, index) => {
        const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
        if (
          reminderDate.getTime() - now.getTime() < 60000 &&
          !reminder.notified
        ) {
          alert(`Reminder: ${reminder.title} is due soon!`);
          const updatedReminders = [...reminders];
          updatedReminders[index].notified = true;
          setReminders(updatedReminders);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate("");
    setTime("");
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const addReminder = () => {
    if (!title || !amount || !date || !time) return;

    const newReminder = { title, amount, date, time, notified: false };

    fetch("http://localhost:5000/api/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newReminder),
    })
      .then((res) => res.json())
      .then((data) => {
        setReminders([...reminders, data]);
        resetForm();
      })
      .catch((err) => console.error("Error adding reminder:", err));
  };

  const deleteReminder = (id) => {
    fetch(`http://localhost:5000/api/reminders/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setReminders(reminders.filter((reminder) => reminder._id !== id));
        } else {
          console.error("Failed to delete reminder");
        }
      })
      .catch((err) => console.error("Error deleting reminder:", err));
  };

  const handleEdit = (reminder) => {
    setTitle(reminder.title);
    setAmount(reminder.amount);
    setDate(reminder.date);
    setTime(reminder.time);
    setEditId(reminder._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const updateReminder = () => {
    if (!title || !amount || !date || !time || !editId) return;

    const updatedReminder = { title, amount, date, time };

    fetch(`http://localhost:5000/api/reminders/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedReminder),
    })
      .then((res) => res.json())
      .then((data) => {
        setReminders(
          reminders.map((r) => (r._id === editId ? data : r))
        );
        resetForm();
      })
      .catch((err) => console.error("Error updating reminder:", err));
  };

  return (
    <div className="app-container">
      <h1 className="app-title">💰 Payment Reminder</h1>

      {!showForm ? (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="add-button" onClick={() => setShowForm(true)}>
            Click here to {isEditing ? "Edit" : "Enter"} Payment
          </button>
        </div>
      ) : (
        <div className="form-section">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter a Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              placeholder="Enter a Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Reminder Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <button
            className="add-button"
            onClick={isEditing ? updateReminder : addReminder}
          >
            {isEditing ? "Update Reminder" : "Add Reminder"}
          </button>
        </div>
      )}

      <div className="reminder-list">
        {reminders.map((reminder) => (
          <div className="reminder-card" key={reminder._id}>
            <strong>{reminder.title}</strong>
            <br />
            <span>Amount: ₹{reminder.amount}</span>
            <br />
            <small>
              Due:{" "}
              {new Date(`${reminder.date}T${reminder.time}`).toLocaleString()}
            </small>
            <br />
            <button
              className="edit-button"
              onClick={() => handleEdit(reminder)}
            >
              Edit
            </button>{" "}
            <button
              className="delete-button"
              onClick={() => deleteReminder(reminder._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
