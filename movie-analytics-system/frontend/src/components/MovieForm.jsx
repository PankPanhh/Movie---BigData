// components/MovieForm.jsx
import React, { useState, useEffect } from "react";

// Component Input được tái sử dụng
const FormInput = ({ label, name, value, onChange, ...props }) => (
  <div className={props.className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg p-3 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      {...props}
    />
  </div>
);

export default function MovieForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    genres: "",
    year: "",
    rating: "",
    poster: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        genres: initialData.genres ? initialData.genres.join(", ") : "",
        year: initialData.year || "",
        rating: initialData.imdb?.rating || "",
        poster: initialData.poster || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const apiData = {
      title: formData.title,
      year: formData.year ? parseInt(formData.year) : null,
      genres: formData.genres.split(",").map((g) => g.trim()).filter((g) => g),
      imdb: {
        rating: formData.rating ? parseFloat(formData.rating) : null,
      },
      poster: formData.poster,
    };
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Tên phim" name="title" value={formData.title} onChange={handleChange} placeholder="Tên phim" required />
      <FormInput label="Thể loại" name="genres" value={formData.genres} onChange={handleChange} placeholder="Thể loại (cách nhau bằng dấu phẩy)" />
      
      {/* Grid 2 cột */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Năm" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="Năm" />
        <FormInput label="Rating" name="rating" type="number" step="0.1" value={formData.rating} onChange={handleChange} placeholder="vd: 8.5" />
      </div>

      <FormInput label="Link Poster" name="poster" value={formData.poster} onChange={handleChange} placeholder="Link Poster (URL)" />
      
      {/* Nút bấm */}
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
          Hủy
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md">
          Lưu
        </button>
      </div>
    </form>
  );
}