import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function FreelancerCard({ freelancer }) {
  const navigate = useNavigate();

  return (
    <Card className="h-100 shadow-sm">
      <div
        style={{
          height: "180px",
          overflow: "hidden",
          backgroundColor: "#f1f1f1",
        }}
      >
        <Card.Img
          variant="top"
          src={freelancer.image_url || "https://via.placeholder.com/180"}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <h5 className="mb-1">{freelancer.name || "Unnamed"}</h5>
        <p className="text-muted small mb-3">
          {Array.isArray(freelancer.skills)
            ? freelancer.skills.join(", ")
            : freelancer.skills || "No skills"}
        </p>

        <Button
          variant="outline-primary"
          className="mt-auto"
          onClick={() => navigate(`/freelancers/${freelancer.firebase_uid}`)}
        >
          View Profile
        </Button>
      </Card.Body>
    </Card>
  );
}