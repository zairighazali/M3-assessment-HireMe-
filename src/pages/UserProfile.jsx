import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HiredFreelancerCard from "../components/Freelancers/HiredFreelancerCard";
import JobCard from "../components/jobs/JobCard"; // <--- baru
import { uploadFile } from "../utils/storage";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firebaseUser = user?.firebaseUser;
  const token = user?.token;

  const API = "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState({});
  const [hired, setHired] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // FETCH HIRES + JOBS
  const fetchHiresAndJobs = async () => {
    if (!firebaseUser?.uid) return;
    try {
      const [hiredRes, jobsRes] = await Promise.all([
        fetch(`${API}/me/hires`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/me/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const hiredData = await hiredRes.json();
      const jobsData = await jobsRes.json();

      setHired(hiredData || []);
      setJobs(jobsData || []);
    } catch (err) {
      console.error("Failed to fetch hires/jobs:", err);
    }
  };

  // FETCH PROFILE
  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setProfile({
          ...data,
          skills: typeof data.skills === "string" ? data.skills : (Array.isArray(data.skills) ? data.skills.join(", ") : ""),
        });
        setImagePreview(data.image_url || "");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }

      fetchHiresAndJobs();
    };

    fetchProfile();
  }, [firebaseUser?.uid]);

  // IMAGE UPLOAD
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const url = await uploadFile(file, `profilePhotos/${firebaseUser.uid}`);
      setProfile(prev => ({ ...prev, image_url: url }));
      setImagePreview(url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // SAVE PROFILE
  const handleSaveProfile = async () => {
    if (!firebaseUser?.uid) return;

    try {
      const safeProfile = {
        name: profile.name || "Unnamed User",
        skills: profile.skills || "",
        bio: profile.bio || "",
        image_url: profile.image_url || null,
        role: profile.role || "client",
      };

      const res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(safeProfile),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const updated = await res.json();
      setProfile({
        ...updated,
        skills: typeof updated.skills === "string" ? updated.skills : (Array.isArray(updated.skills) ? updated.skills.join(", ") : ""),
      });
      setShowEdit(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to save profile");
    }
  };

  if (!firebaseUser) return <p>Loading...</p>;

  return (
    <Container className="pt-5 mt-4">
      <Row className="g-4">
        {/* LEFT */}
        <Col md={6}>
          <Card className="p-4 text-center">
            <img
              src={imagePreview || "https://via.placeholder.com/120"}
              width={120}
              height={120}
              className="rounded-circle mb-3"
            />
            <h4>{profile.name || firebaseUser.displayName || "Your Name"}</h4>
            <p className="text-muted">{profile.skills || "Your skills"}</p>
            <p>{profile.bio || "Your bio"}</p>
            <Button onClick={() => setShowEdit(true)}>Edit Profile</Button>
          </Card>
        </Col>

        {/* RIGHT */}
        <Col md={6}>
          <h4>People I Hired</h4>
          {hired.length === 0 && <p className="text-muted">None yet</p>}
          {hired.map(h => (
            <HiredFreelancerCard
              key={h.id}
              hire={h}
              userId={firebaseUser.uid}
              refresh={fetchHiresAndJobs}
            />
          ))}

          <hr />

          <h4>Jobs Offered To Me</h4>
          {jobs.length === 0 && <p className="text-muted">No jobs yet</p>}
          {jobs.map(j => (
            <JobCard
              key={j.id}
              job={j}
              refresh={fetchHiresAndJobs}
              userId={firebaseUser.uid}
            />
          ))}
        </Col>
      </Row>

      {/* EDIT MODAL */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <img
              src={imagePreview || "https://via.placeholder.com/100"}
              width={100}
              height={100}
              className="rounded-circle mb-3"
            />
            <Form.Control type="file" onChange={e => handleImageUpload(e.target.files[0])} />
            <Form.Control
              className="mt-3"
              placeholder={profile.name || firebaseUser.displayName || "Your Name"}
              value={profile.name || ""}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
            <Form.Control
              className="mt-2"
              placeholder={profile.skills || "Your skills"}
              value={profile.skills || ""}
              onChange={e => setProfile({ ...profile, skills: e.target.value })}
            />
            <Form.Control
              className="mt-2"
              as="textarea"
              rows={4}
              placeholder={profile.bio || "Your bio"}
              value={profile.bio || ""}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSaveProfile} disabled={uploading}>
            {uploading ? "Uploading..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}