"use client";
import React from "react";
import clsx from "clsx";

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  error,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition",
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-indigo-400",
          "placeholder-gray-400 text-gray-900",
          className
        )}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
