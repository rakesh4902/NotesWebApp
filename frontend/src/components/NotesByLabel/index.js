import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie'
import { useParams } from 'react-router-dom';

const NotesByLabel = () => {
  const { label } = useParams();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    

    fetchNotesByLabel();
  });

  const fetchNotesByLabel = async () => {
    try {
      const response = await fetch(`http://localhost:3000/notes/by-label?label=${label}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes by label:', error);
    }
  };

  const handleArchiveClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}/archive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });
      if (response.ok) {
        fetchNotesByLabel();
      }
    } catch (error) {
      console.error('Failed to archive note:', error.message);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });
      if (response.ok) {
        fetchNotesByLabel();
      }
    } catch (error) {
      console.error('Failed to delete note:', error.message);
    }
  };

  return (
    <div className='archive-page'>
      {notes.length > 0 ? 
      <><h1>Notes with label: {label}</h1>
      <ul className="note-list">
        {notes.map(note => (
          <li key={note.id} className="note" style={{ backgroundColor: note.color }}>
            <h1 className='note_head'>{note.title}</h1>
            <p>{note.content}</p>
            <p>Tags: <span>{note.tags}</span></p>
            <p>Reminder: {note.reminder}</p>
            <div className='note-buttons'>
              
              <button onClick={() => handleArchiveClick(note.id)} className='update-btn'>Archive</button>
              <button onClick={() => handleDeleteClick(note.id)} className='update-btn'>Delete</button>
            </div>
          </li> 
        ))} 
      </ul>
      </>
      : 
      <h1>No Notes for this label yet</h1>
      }
    </div>
  );
};

export default NotesByLabel;
