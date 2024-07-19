import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './index.css';

const Archive = () => {
  const [archivedNotes, setArchivedNotes] = useState([]);

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  const fetchArchivedNotes = async () => {
    try {
      const response = await fetch('http://localhost:3000/notes/archived', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch archived notes. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Fetched archived notes:', data); // Log the fetched data
      setArchivedNotes(data);
    } catch (error) {
      console.error('Failed to fetch archived notes:', error.message);
    }
  };

  const makeUnArchiveNote = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}/restore`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });

      if (!response.ok) {
        console.error(`Failed to unarchive note. Status: ${response.status}`);
        return;
      }

      fetchArchivedNotes();
    } catch (error) {
      console.error('Failed to unarchive note:', error.message);
    }
  };

  return (
    <div className="archive-page">
        {archivedNotes.length > 0 ? 
      (<><h1>Archived Notes</h1>
      <ul className="note-list">
        {archivedNotes.map(note => (
          <li key={note.id} className="note" style={{ backgroundColor: note.color }}>
            <h1 className='note_head'>{note.title}</h1>
            <p>{note.content}</p>
            <p>Tags: <span>{note.tags}</span></p>
            <p>Reminder: {note.reminder}</p>
            <button type="button" className='unarchive-btn' onClick={() => makeUnArchiveNote(note.id)}>UnArchive</button>
          </li>
        ))}
      </ul>
      </>) : <h1>No Archived Notes</h1> }
    </div>
  );
};

export default Archive;
