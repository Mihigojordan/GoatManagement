import React, { useState, useEffect } from "react";
import Logo from "../assets/goat.png"; // Replace with your logo path

// eslint-disable-next-line react/prop-types
const Loader = ({ onFinish }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onFinish) onFinish(); // Trigger callback when loading is complete
    }, 3000); // 2 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [onFinish]);

  return isLoading ? (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <img
        src={Logo}
        alt="Loading..."
        className="w-24 h-24 animate-spinScale"
      />
    </div>
  ) : null; // Render nothing after loading
};

export default Loader;
