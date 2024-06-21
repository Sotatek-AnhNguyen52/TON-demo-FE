import React, { useState, useEffect } from "react";
import "../styles/button.css";
import { ADD_SCORE } from "../constant";
import { upScore, getScore } from '../service/game-service';
import useDebounce from '../hooks/use-debounce';

window.Buffer = window.Buffer || Buffer;

const ButtonClaim: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const debouncedPoints = useDebounce(points, 1000);

  useEffect(() => {
    const fetchInitialScore = async () => {
      try {
        const scoreData = await getScore();
        setCount(Number(scoreData.value.points));
      } catch (error) {
        console.error('Failed to fetch initial score', error);
      }
    };

    fetchInitialScore();
  }, []);

  useEffect(() => {
    if (debouncedPoints > 0) {
      const updateScore = async () => {
        try {
          await upScore({ points: debouncedPoints, remaining_energy: 123234 });
          console.log("updated!");
          const scoreData = await getScore();
          setCount(Number(scoreData.value.points));
        } catch (error) {
          console.error('Failed to update score', error);
        }
      };

      updateScore();
    }
  }, [debouncedPoints]);

  const increment = () => {
    const newCount = count + ADD_SCORE;
    setCount(newCount);
    setPoints(newCount);
  };

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
            +{ADD_SCORE}
          </span>
        ))}
      </div>
      <b>{"Count: " + count}</b>
      <div className="my-claim-button">Claim</div>
    </div>
  );
};

export default ButtonClaim;
