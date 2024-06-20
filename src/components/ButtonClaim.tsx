import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import "../styles/button.css";

window.Buffer = window.Buffer || Buffer;

const ButtonClaim: React.FC = () => {
  const { count, increment, decrement } = useAppContext();
  const [clicks, setClicks] = useState<number[]>([]);

  const handleClick = () => {
    increment();    
    const newClick = Date.now();
    setClicks([...clicks, newClick]);
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click !== newClick)
      );
    }, 1000);
  };

  return (
    <div className="button-container">
      <div className="my-press-button" onClick={handleClick}>
        {clicks.map((click, index) => (
          <span
            key={click}
            className="floating-plus-one"
            // style={{ animationDelay: `${index * 0.1}s` }}
          >
            +1
          </span>
        ))}
      </div>
      <b>{"Count: " + count}</b>
      <div className="my-claim-button">Claim</div>
    </div>
  );
};

export default ButtonClaim;
