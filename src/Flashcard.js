import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Flashcard.css'; 



const Flashcard = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [timer, setTimer] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    const intervals = flashcards.map((card, index) => {
      if (card.timer > 0 && (visibleIndex === index || visibleIndex === null)) {
        return setInterval(() => {
          setFlashcards(prevCards => {
            return prevCards.map((c, i) => {
              if (i === index && c.timer > 0) {
                const newTimer = Math.max(c.timer - 1, 0);
                if (newTimer === 0 && visibleIndex === index) {
                  setVisibleIndex(null);
                }
                return { ...c, timer: newTimer };
              }
              return c;
            });
          });
        }, 1000);
      }
      return null;
    });

    return () => {
      intervals.forEach(interval => interval && clearInterval(interval));
    };
  }, [flashcards, visibleIndex]);

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flashcards');
      const sortedFlashcards = response.data.sort((a, b) => {
        return a.description.localeCompare(b.description);
      });
      setFlashcards(sortedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const addFlashcard = async () => {
    try {
      // Ensure URL has http:// or https://
      const formattedLink = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
      await axios.post('http://localhost:5000/api/flashcards', { description, link: formattedLink, timer });
      fetchFlashcards();
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const deleteFlashcard = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/flashcards/${id}`);
      fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const toggleContent = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  return (
    <div className="flashcard-container">
      <h1>Flashcards</h1>
      {flashcards.length === 0 ? (
        <p>No flashcards available</p>
      ) : (
        flashcards.map((card, index) => (
          <div key={card.id} className="flashcard">
            <h2>{card.description}</h2>
            {visibleIndex === index && (
              <>
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flashcard-link"
                >
                  {card.link}
                </a>
                <p>Timer: {card.timer}</p>
              </>
            )}
            <button onClick={() => toggleContent(index)}>
              {visibleIndex === index ? 'Hide Content' : 'Show Content'}
            </button>
            <button onClick={() => deleteFlashcard(card.id)}>Delete</button>
          </div>
        ))
      )}
      <h2>Add New Flashcard</h2>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <input
        type="number"
        placeholder="Timer"
        value={timer}
        onChange={(e) => setTimer(Number(e.target.value))}
      />
      <button className="add" onClick={addFlashcard}>Add Flashcard</button>
    </div>
  );
};

export default Flashcard;
