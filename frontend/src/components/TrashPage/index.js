import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './index.css';

const Trash = () => {
  const [trashedNotes, setTrashedNotes] = useState([]);

  useEffect(() => {
    fetchTrashedNotes();
  }, []);

  const fetchTrashedNotes = async () => {
    try {
      const response = await fetch('http://localhost:3000/notes/trash', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch trashed notes. Status: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Fetched trashed notes:', data);
      setTrashedNotes(data);
    } catch (error) {
      console.error('Failed to fetch trashed notes:', error.message);
    }
  };

  const untrashNote = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}/untrash`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });

      if (!response.ok) {
        console.error(`Failed to untrash note. Status: ${response.status}`);
        return;
      }

      fetchTrashedNotes();
    } catch (error) {
      console.error('Failed to untrash note:', error.message);
    }
  };

  const deleteNotePermanently = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}/permanent`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`
        }
      });

      if (!response.ok) {
        console.error(`Failed to delete note permanently. Status: ${response.status}`);
        return;
      }

      fetchTrashedNotes();
    } catch (error) {
      console.error('Failed to delete note permanently:', error.message);
    }
  };

  return (
    <div className="archive-page">
      {trashedNotes.length>0 ? (
        <>
        <h1>Trashed Notes</h1>
        <ul className="note-list">
            {trashedNotes.map(note => (
            <li key={note.id} className="note" style={{ backgroundColor: note.color }}>
                <h1 className='note_head'>{note.title}</h1>
                <p>{note.content}</p>
                <p>Tags: <span>{note.tags}</span></p>
                <p>Reminder: {note.reminder}</p>
                <button type="button" className='unarchive-btn' onClick={() => untrashNote(note.id)}>Untrash</button>
                <button type="button" className='unarchive-btn' onClick={() => deleteNotePermanently(note.id)}>Delete Permanently</button>
            </li>
            ))}
        </ul>
        </>) 
        : 
        <h1>No trashed Notes</h1> 
        }
    </div>
  );
};

export default Trash;
