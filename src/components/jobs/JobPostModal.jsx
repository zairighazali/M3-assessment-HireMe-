// src/components/jobs/JobPostModal.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getAuth } from "firebase/auth";

export default function JobPostModal({ show, onHide, onPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRemote, setIsRemote] = useState(true);
  const [location, setLocation] = useState("");
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // VALIDATION
    if (!title || !description || !payment || (!isRemote && !location)) {
      return alert("Please fill all required fields");
    }

    setLoading(true);

    try {
      // Ambil Firebase ID token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const token = await user.getIdToken();

      // POST JOB
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          is_remote: isRemote,
          location: isRemote ? null : location,
          payment_rm: Number(payment),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (typeof onPosted === "function") onPosted(data); // safe check
        onHide();
        // RESET FORM
        setTitle("");
        setDescription("");
        setLocation("");
        setPayment("");
        setIsRemote(true);
      } else {
        alert(data.message || "Failed to post job");
      }
    } catch (err) {
      console.error("Error posting job:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Post a Job</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Job Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Check
              type="checkbox"
              label="Remote?"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
            />
          </Form.Group>

          {!isRemote && (
            <Form.Group className="mb-2">
              <Form.Label>Location</Form.Label>
              <Form.Control
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-2">
            <Form.Label>Payment (RM)</Form.Label>
            <Form.Control
              type="number"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}