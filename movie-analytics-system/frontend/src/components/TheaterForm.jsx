// components/TheaterForm.jsx
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

export default function TheaterForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    street1: initialData?.location.address.street1 || "",
    city: initialData?.location.address.city || "",
    state: initialData?.location.address.state || "",
    zipcode: initialData?.location.address.zipcode || "",
  });

  // Thêm useEffect để cập nhật form nếu initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData({
        street1: initialData.location?.address?.street1 || "",
        city: initialData.location?.address?.city || "",
        state: initialData.location?.address?.state || "",
        zipcode: initialData.location?.address?.zipcode || "",
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
      location: {
        address: {
          street1: formData.street1,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
        },
      },
    };
    onSubmit(apiData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Đường" name="street1" value={formData.street1} onChange={handleChange} placeholder="Đường" />
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Thành phố" name="city" value={formData.city} onChange={handleChange} placeholder="Thành phố" />
        <FormInput label="Tiểu bang" name="state" value={formData.state} onChange={handleChange} placeholder="Tiểu bang" />
      </div>
      <FormInput label="Zipcode" name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zipcode" />
      
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