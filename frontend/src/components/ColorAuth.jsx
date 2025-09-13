"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import { X } from "lucide-react";

const initialColors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FFA500",
    "#800080"
];

const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};

export default function ColorAuth({ onComplete, isLogin = false }) {
    const [selectedColors, setSelectedColors] = useState([]);
    const [error, setError] = useState("");
    const [shuffledColors, setShuffledColors] = useState(() => shuffleArray(initialColors));

    const handleColorClick = (color) => {
        if (selectedColors.length < 4) {
            setSelectedColors([...selectedColors, color]);
            setError("");
        } else {
            setError("Maximum of 4 colors reached.");
        }
    };

    const handleReset = () => {
        setSelectedColors([]);
        setError("");
        setShuffledColors(shuffleArray(initialColors));
    };

    const handleSubmit = () => {
        if (selectedColors.length > 0) {
            onComplete(selectedColors);
        } else {
            setError("Please select at least one color to create your pattern.");
        }
    };

    return (
        <div className="text-center p-4 text-gray-800">
            <h2 className="text-3xl font-bold mb-2 text-indigo-700">
                {isLogin ? "Enter Your Color Pattern" : "Set Your Color Pattern"}
            </h2>
            <p className="mb-6 text-gray-500">
                Select up to 4 colors in your secret order.
            </p>

            <div className="mb-6 p-4 border-2 border-dashed rounded-xl bg-gray-50 h-24 flex items-center justify-center space-x-3">
                {selectedColors.length > 0 ? (
                    selectedColors.map((color, index) => (
                        <div
                            key={index}
                            className="w-12 h-12 rounded-full shadow-md animate-pop-in"
                            style={{ backgroundColor: color, animationDelay: `${index * 100}ms` }}
                        ></div>
                    ))
                ) : (
                    <p className="text-gray-400">Your pattern will appear here...</p>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {shuffledColors.map((color) => (
                    <div
                        key={color}
                        className="w-full h-24 rounded-lg cursor-pointer shadow-lg transition-transform transform hover:scale-105 hover:-translate-y-1"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorClick(color)}
                    ></div>
                ))}
            </div>

            {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

            <div className="flex justify-between items-center mt-4">
                <Button
                    text="Reset"
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                >
                    <X size={16} />
                    Reset
                </Button>
                <Button text="Next Step" onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700" />
            </div>

            <style jsx>{`
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    );
}