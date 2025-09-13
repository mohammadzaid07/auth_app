"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import Image from "next/image";
import { X } from "lucide-react";

const initialImages = [
    "book.jpg",
    "clock.jpg",
    "key.jpg",
    "lamp.jpg",
    "specs.png",
    "pencil.png"
];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function GraphicalAuth({ onComplete, isLogin = false }) {
    const [selectedImages, setSelectedImages] = useState([]);
    const [error, setError] = useState("");
    const [shuffledImages, setShuffledImages] = useState(() => shuffleArray(initialImages));

    const handleImageClick = (image) => {
        if (selectedImages.length < 4) {
            setSelectedImages([...selectedImages, image]);
            setError("");
        } else {
            setError("Maximum of 4 images reached.");
        }
    };

    const handleReset = () => {
        setSelectedImages([]);
        setError("");
        setShuffledImages(shuffleArray(initialImages));
    };

    const handleSubmit = () => {
        if (selectedImages.length > 0) {
            onComplete(selectedImages);
        } else {
            setError("Please select at least one image.");
        }
    };

    return (
        <div className="text-center p-4 text-gray-800">
            {/* Header Text */}
            <h2 className="text-3xl font-bold mb-2 text-indigo-700">
                {isLogin ? "Enter Your Image Pattern" : "Set Your Image Pattern"}
            </h2>
            <p className="mb-6 text-gray-500">
                Select up to 4 images in your secret order.
            </p>

            {/* Display area for selected images */}
            <div className="mb-6 p-4 border-2 border-dashed rounded-xl bg-gray-50 h-24 flex items-center justify-center space-x-3">
                {selectedImages.length > 0 ? (
                    selectedImages.map((image, index) => (
                        <Image
                            key={index}
                            src={`/auth_images/${image}`}
                            alt={image.split(".")[0]}
                            width={50}
                            height={50}
                            className="rounded-lg animate-pop-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        />
                    ))
                ) : (
                    <p className="text-gray-400">Your pattern will appear here...</p>
                )}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {shuffledImages.map((image) => (
                    <div
                        key={image}
                        className="cursor-pointer border-2 border-transparent hover:border-indigo-500 rounded-lg transition-transform transform hover:scale-105 hover:-translate-y-1 p-2 bg-white shadow-md"
                        onClick={() => handleImageClick(image)}
                    >
                        <Image
                            src={`/auth_images/${image}`}
                            alt={image.split(".")[0]}
                            width={150}
                            height={150}
                            className="rounded-lg object-contain h-24 w-full"
                        />
                    </div>
                ))}
            </div>

            {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4">
                <Button
                    text="Reset"
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                >
                    <X size={16} />
                    Reset
                </Button>
                <Button
                    text="Submit"
                    onClick={handleSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700"
                />
            </div>

            {/* Keyframes for the pop-in animation */}
            <style jsx>{`
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    );
}