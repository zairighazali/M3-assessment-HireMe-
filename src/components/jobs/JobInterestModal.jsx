import { Modal, Button, ListGroup, Image } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

export default function JobInterestsModal({ show, onHide, jobId, onHired }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!show) return;

    const fetchInterests = async () => {
      const token = await getAuth().currentUser.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}/interests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setUsers(data);
    };

    fetchInterests();
  }, [show]);

  const handleHire = async (userId) => {
    const token = await getAuth().currentUser.getIdToken();
    await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${jobId}/hire/${userId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    onHired();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Interested Freelancers</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {users.length === 0 && <p>No interest yet</p>}

        <ListGroup>
          {users.map((u) => (
            <ListGroup.Item
              key={u.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <Image
                  src={u.image_url || "https://via.placeholder.com/40"}
                  roundedCircle
                  width={40}
                  className="me-2"
                />
                {u.name}
              </div>

              <Button size="sm" onClick={() => handleHire(u.id)}>
                Hire
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}