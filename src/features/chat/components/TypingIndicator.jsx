import { useEffect, useState } from "react";

export const TypingIndicator = ({ baseText = "ИИ думает" }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      {baseText}
      {dots}
    </div>
  );
};

const styles = {
  container: {
    opacity: 0.6,
    fontStyle: "italic",
    margin: "8px 0",
  },
};