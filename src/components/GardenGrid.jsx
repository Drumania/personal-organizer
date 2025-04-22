import { useState } from "react";

const PLANT_LEVELS = {
  0: "⬜", // Empty
  1: "🌱", // Sprout
  2: "🌿", // Leaf
  3: "🌸", // Flower
  4: "🌳", // Tree
};

export default function GardenGrid({ gardenGrid }) {
  const [selectedPlant, setSelectedPlant] = useState(null);

  const handleClick = (plant) => {
    setSelectedPlant(plant);
  };

  return (
    <div>
      <div className="garden-grid">
        {gardenGrid.map((plant, index) => (
          <div
            key={index}
            className={`garden-cell ${plant.level !== 0 ? "filled" : ""}`}
            onClick={() => handleClick(plant)}
            title={
              plant.level !== 0
                ? `${plant.title}\n${plant.detail}\n${plant.date}`
                : `${plant.suggestion}`
            }
          >
            {PLANT_LEVELS[plant.level]}
          </div>
        ))}
      </div>

      {selectedPlant && (
        <div className="plant-info-modal">
          {selectedPlant.level !== 0 ? (
            <>
              <h4>{selectedPlant.title}</h4>
              <p>{selectedPlant.detail}</p>
              <p>🌱 Earned on: {selectedPlant.date}</p>
            </>
          ) : (
            <>
              <h4>🌱 Empty Plot</h4>
              <p>{selectedPlant.suggestion}</p>
            </>
          )}
          <button onClick={() => setSelectedPlant(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
