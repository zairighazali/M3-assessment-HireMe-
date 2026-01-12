// src/components/Hires/HiredFreelancerCard.jsx
import { Card, Button, Badge, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HiredFreelancerCard({ hire, refresh }) {
  const { user } = useAuth();
  const token = user?.token;
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    project_description: hire.project_description || "",
    special_request: hire.special_request || "",
    notes: hire.notes || "",
  });

  useEffect(() => {
    setForm({
      project_description: hire.project_description || "",
      special_request: hire.special_request || "",
      notes: hire.notes || "",
    });
  }, [hire]);

  // MARK DONE
  const markDone = async () => {
    try {
      await axios.put(
        `${API}/hires/${hire.id}/status`,
        { status: "done" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as done");
    }
  };

  // DELETE / CANCEL
  const deleteHire = async () => {
    if (!window.confirm("Cancel this job?")) return;
    try {
      await axios.delete(`${API}/hires/${hire.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel hire");
    }
  };

  // UPDATE BOOKING
  const saveEdit = async () => {
    try {
      await axios.put(
        `${API}/hires/${hire.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEdit(false);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };

  // 🔹 CHAT BUTTON FUNCTION (REPAIRED)
  const startChat = async () => {
    try {
      // pastikan user_id integer
      const otherUserId = parseInt(hire.user_id);
      if (!otherUserId) throw new Error("Invalid user ID");

      // POST conversation endpoint → selalu return conversation object
      const res = await axios.post(
        `${API}/conversations/${otherUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const conversationId = parseInt(res.data.id);
      if (!conversationId) throw new Error("Invalid conversation ID returned");

      // navigate ke ChatPage
      navigate(`/chat?conversationId=${conversationId}`);
    } catch (err) {
      console.error("Failed to start chat:", err);
      alert("Failed to start chat. Make sure user exists.");
    }
  };

  return (
    <>
      <Card className="p-3 mb-3 position-relative">
        <Badge
          bg={hire.status === "done" ? "secondary" : "success"}
          className="position-absolute top-0 end-0 m-2"
        >
          {hire.status}
        </Badge>

        <h6 className="mb-1">{hire.user_name || "-"}</h6>
        <small className="text-muted">{hire.user_skills || "-"}</small>

        <p className="mt-2 mb-1 small">
          <b>Project:</b> {hire.project_description || "-"}
        </p>
        <p className="mb-1 small">
          <b>Special:</b> {hire.special_request || "-"}
        </p>
        <p className="small text-muted">
          <b>Notes:</b> {hire.notes || "-"}
        </p>

        {hire.status !== "done" && (
          <div className="mt-2 d-flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowEdit(true)}>Edit</Button>
            <Button size="sm" variant="success" onClick={markDone}>Done</Button>
            <Button size="sm" variant="danger" onClick={deleteHire}>Cancel</Button>
            <Button size="sm" variant="info" onClick={startChat}>Chat</Button>
          </div>
        )}
      </Card>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Project Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.project_description}
              onChange={(e) => setForm({ ...form, project_description: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Special Request</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.special_request}
              onChange={(e) => setForm({ ...form, special_request: e.target.value })}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={saveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
