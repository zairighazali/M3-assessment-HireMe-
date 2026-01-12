import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { Card, Button, Modal, Form, ListGroup, Badge } from "react-bootstrap";

export default function JobCard({ job, currentUserUid, onUpdated, onDeleted }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showInterested, setShowInterested] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [isRemote, setIsRemote] = useState(job.is_remote);
  const [location, setLocation] = useState(job.location || "");
  const [payment, setPayment] = useState(job.payment_rm || "");
  const [loading, setLoading] = useState(false);

  const isOwner = job.owner_uid === currentUserUid;
  const isOpen = job.status === "open";

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    return await user.getIdToken(true);
  };

  // ===== UPDATE =====
  const handleUpdate = async () => {
    if (!title || !description || (!isRemote && !location) || !payment) return alert("All fields required");
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, is_remote: isRemote, location: isRemote ? null : location, payment_rm: Number(payment) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      onUpdated?.(data);
      setShowEdit(false);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  // ===== DELETE =====
  const handleDelete = async () => {
    if (!confirm("Delete this job?")) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      onDeleted?.(job.id);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  // ===== VIEW INTERESTED =====
  const fetchInterestedUsers = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}/interests`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setInterestedUsers(data);
      setShowInterested(true);
    } catch (err) { alert(err.message); }
  };

  // ===== MARK INTEREST =====
  const handleInterested = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}/interested`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      alert("Interest sent to job owner");
      window.location.reload(); // refresh to show locked job
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{job.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{job.is_remote ? "Remote" : `Onsite: ${job.location || "-"}`}</Card.Subtitle>
          <Card.Text>{job.description}</Card.Text>
          <Card.Text>Payment: {job.payment_rm ? `RM${job.payment_rm}` : "Not specified"}</Card.Text>

          {!isOpen && <Badge bg="secondary">{job.status.toUpperCase()}</Badge>}

          {isOwner && isOpen && (
            <>
              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setShowEdit(true)}>Edit</Button>
              <Button variant="outline-danger" size="sm" onClick={handleDelete} disabled={loading}>Delete</Button>
            </>
          )}

          {isOwner && !isOpen && (
            <Button size="sm" variant="info" onClick={fetchInterestedUsers}>View Interested</Button>
          )}

          {!isOwner && (
            <Button size="sm" variant="success" disabled={!isOpen || loading} onClick={handleInterested}>
              {isOpen ? "I'm Interested" : "Locked"}
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Job</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2"><Form.Label>Job Title</Form.Label><Form.Control value={title} onChange={e => setTitle(e.target.value)} /></Form.Group>
            <Form.Group className="mb-2"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></Form.Group>
            <Form.Check className="mb-2" type="checkbox" label="Remote?" checked={isRemote} onChange={e => setIsRemote(e.target.checked)} />
            {!isRemote && <Form.Group className="mb-2"><Form.Label>Location</Form.Label><Form.Control value={location} onChange={e => setLocation(e.target.value)} /></Form.Group>}
            <Form.Group className="mb-2"><Form.Label>Payment (RM)</Form.Label><Form.Control type="number" value={payment} onChange={e => setPayment(e.target.value)} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Interested Users Modal */}
      <Modal show={showInterested} onHide={() => setShowInterested(false)}>
        <Modal.Header closeButton><Modal.Title>Interested Users</Modal.Title></Modal.Header>
        <Modal.Body>
          <ListGroup>
            {interestedUsers.map(u => (
              <ListGroup.Item key={u.user_id} className="d-flex justify-content-between align-items-center">
                {u.name || "Unnamed"} 
                <Button size="sm" variant="primary" onClick={() => window.open(`/chat/${u.conversation_id}`, "_blank")}>Chat</Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInterested(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}