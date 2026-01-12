import HeroCarousel from "./HeroCarousel";
import SearchBar from "./HeroSearchPopup";
import { useState } from "react";
import { FreelancerResults } from "../Freelancers";
import { useAuth } from "../../context/AuthContext";
import "./Hero.css";

export default function Hero() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const token = user?.token;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async (query) => {
    if (!query?.trim()) return;
    setLoading(true);

    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(
        `${API_BASE_URL}/users?search=${encodeURIComponent(query)}`,
        { headers }
      );

      if (!res.ok) throw new Error("Search request failed");

      const data = await res.json();
      // normalize data
      const normalized = data.map((u) => ({
        ...u,
        skills: Array.isArray(u.skills)
          ? u.skills
          : typeof u.skills === "string"
          ? u.skills.split(",").map((s) => s.trim())
          : [],
      }));

      setResults(normalized);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        className={`hero-wrapper ${
          results.length > 0 ? "hero-shrink" : "hero-full"
        }`}
      >
        <div className="container text-center text-black">
          <h1 className="fw-bold display-5">
            Hire <span className="text-primary">top freelancers</span> in minutes
          </h1>

          <p className="fs-5 mb-4 opacity-75">
            Search, hire, and work with skilled professionals.
          </p>

          <SearchBar onSearch={handleSearch} />

          <p className="small mt-3 opacity-50">
            Example searches: Web Developer, Graphic Designer, Musician
          </p>

          {loading && <p className="mt-3 opacity-75">Searching freelancers…</p>}
        </div>
      </section>

      {/* Freelancer results */}
      <FreelancerResults freelancers={results} />
    </>
  );
}