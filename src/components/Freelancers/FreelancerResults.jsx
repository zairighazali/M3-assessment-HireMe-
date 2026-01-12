import { Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function FreelancerResults({ freelancers = [] }) {
  const navigate = useNavigate();

  if (!freelancers.length) return null;

  return (
    <section className="freelancer-results py-4">
      <div className="container">
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {freelancers.map((f) => (
            <Col key={f.firebase_uid}>
              <Card className="h-100 shadow-sm">
                {/* IMAGE */}
                <div
                  style={{
                    height: "180px",
                    overflow: "hidden",
                    objectFit: "contain",
                    backgroundColor: "#f1f1f1",
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={f.image_url || "https://via.placeholder.com/180"}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* BODY */}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-1">{f.name || "Unnamed"}</Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    {Array.isArray(f.skills)
                      ? f.skills.join(", ")
                      : typeof f.skills === "string"
                      ? f.skills.split(",").map((s) => s.trim()).join(", ")
                      : "No skills"}
                  </Card.Text>

                  <Button
                    variant="outline-primary"
                    className="mt-auto"
                    onClick={() => navigate(`/users/${f.firebase_uid}`)}
                  >
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}