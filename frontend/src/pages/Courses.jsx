import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";

/** Halaman Mata Kuliah: form tambah dan daftar mata kuliah milik pengguna. */
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [kode, setKode] = useState("");
  const [dosen, setDosen] = useState("");
  const [error, setError] = useState("");

  async function loadCourses() {
    const res = await api.get("/courses");
    setCourses(res.data.courses);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/courses", { name, kode, dosen });
      setName("");
      setKode("");
      setDosen("");
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menambahkan mata kuliah.");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/courses/${id}`);
    loadCourses();
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Mata Kuliah</h1>

        <div className="card">
          <h2>Tambah Mata Kuliah</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nama Mata Kuliah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Kode Mata Kuliah"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Dosen Pengampu"
              value={dosen}
              onChange={(e) => setDosen(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Tambah</button>
          </form>
        </div>

        {courses.map((c) => (
          <div className="card" key={c.id}>
            <strong>{c.name}</strong> {c.kode && <span>({c.kode})</span>}
            <div className="meta">{c.dosen}</div>
            <button className="btn" style={{ marginTop: 10 }} onClick={() => handleDelete(c.id)}>
              Hapus
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
