import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import JobCard from "../components/jobs/JobCard";
import JobPostModal from "../components/jobs/JobPostModal";
import { useAuth } from "../context/AuthContext";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [showPost, setShowPost] = useState(false);
  const { user } = useAuth();
  const currentUserUid = user?.firebaseUser?.uid;

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handlePosted = (job) => setJobs((prev) => [job, ...prev]);
  const handleUpdated = (job) => setJobs((prev) => prev.map(j => (j.id === job.id ? job : j)));
  const handleDeleted = (jobId) => setJobs(prev => prev.filter(j => j.id !== jobId));

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Jobs</h2>
        <Button onClick={() => setShowPost(true)}>Post a Job</Button>
      </div>

      {jobs.length === 0 && <p className="text-muted">No jobs available</p>}

      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          currentUserUid={currentUserUid}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}

      <JobPostModal
        show={showPost}
        onHide={() => setShowPost(false)}
        onPosted={handlePosted}
      />
    </Container>
  );
}