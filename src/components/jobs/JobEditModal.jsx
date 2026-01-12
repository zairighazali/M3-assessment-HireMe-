// src/components/jobs/JobEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function JobEditModal({ show, onHide, job, onUpdated }) {
  const [title, setTitle] = useState(job?.title || "");
  const [description, setDescription] = useState(job?.description || "");
  const [isRemote, setIsRemote] = useState(job?.is_remote ?? true);
  const [location, setLocation] = useState(job?.location || "");
  const [payment, setPayment] = useState(job?.payment_rm || "");

  useEffect(() => {
    setTitle(job?.title || "");
    setDescription(job?.description || "");
    setIsRemote(job?.is_remote ?? true);
    setLocation(job?.location || "");
    setPayment(job?.payment_rm || "");
  }, [job]);

  const handleSubmit = async () => {
    if (!title || !description || !payment) return alert("All fields required");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      onUpdated?.(data);
      onHide();
    } else {
      alert(data.message || "Failed to update job");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Job</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Job Title</Form.Label>
            <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Check
              type="checkbox"
              label="Remote?"
              checked={isRemote}
              onChange={e => setIsRemote(e.target.checked)}
            />
          </Form.Group>

          {!isRemote && (
            <Form.Group className="mb-2">
              <Form.Label>Location</Form.Label>
              <Form.Control value={location} onChange={e => setLocation(e.target.value)} />
            </Form.Group>
          )}

          <Form.Group className="mb-2">
            <Form.Label>Payment (RM)</Form.Label>
            <Form.Control
              type="number"
              value={payment}
              onChange={e => setPayment(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}