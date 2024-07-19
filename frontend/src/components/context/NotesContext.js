import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [labels, setLabels] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchLabels();
    fetchNotes();
  }, []);

  const fetchLabels = async () => {
    try {
      const response = await fetch('https://noteswebapp-1.onrender.com/labels', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('jwtToken')}`,
        },
      });
      const data = await response.json();
      setLabels(data);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch('https://noteswebapp-1.onrender.com/notes', {
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`,
        },
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error.message);
    }
  };

  const addOrUpdateNote = async (note, id) => {
    try {
      const response = id
        ? await fetch(`https://noteswebapp-1.onrender.com/notes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Cookies.get('jwtToken')}`,
            },
            body: JSON.stringify(note),
          })
        : await fetch('https://noteswebapp-1.onrender.com/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Cookies.get('jwtToken')}`,
            },
            body: JSON.stringify(note),
          });

      if (response.ok) {
        await fetchNotes(); 
        await fetchLabels(); 
      }
    } catch (error) {
      console.error('Failed to add/update note:', error.message);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        labels,
        notes,
        addOrUpdateNote,
        fetchNotes
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
