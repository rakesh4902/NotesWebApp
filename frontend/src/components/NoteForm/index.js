import React, { useState, useContext } from 'react';
import { NotesContext } from '../context/NotesContext';
import Cookies from 'js-cookie';
import './index.css';

const NoteForm = ({ onNoteAction }) => {
  const { addOrUpdateNote , fetchNotes, notes} = useContext(NotesContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('');
  const [reminder, setReminder] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newNote = { title, content, tags, color, reminder };
    await addOrUpdateNote(newNote, currentNoteId);
    if (onNoteAction) {
      onNoteAction();
    }
    setTitle('');
    setContent('');
    setTags('');
    setColor('');
    setReminder('');
    setIsUpdating(false);
    setCurrentNoteId(null);
  };

  const handleUpdateClick = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setColor(note.color);
    setReminder(note.reminder);
    setIsUpdating(true);
    setCurrentNoteId(note.id);
  };

  const handleArchiveClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}/archive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Cookies.get('jwtToken')}`,
        },
      });
      if (response.ok) {
        await fetchNotes();
        if (onNoteAction) {
          onNoteAction();
        }
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
          Authorization: `Bearer ${Cookies.get('jwtToken')}`,
        },
      });
      if (response.ok) {
        await fetchNotes();
        if (onNoteAction) {
          onNoteAction();
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error.message);
    }
  };

  return (
    <div className='notes-list-cont'>
      <form onSubmit={handleSubmit} className="note-form">
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className='text'
          required 
        />
        <textarea 
          placeholder="Add your note" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          className='content'
          required 
        />
        <input 
          type="text" 
          placeholder="Tags (comma separated)" 
          value={tags} 
          className='text'
          onChange={(e) => setTags(e.target.value)} 
        />
        <div className='color-date-note-cont'>
          <input 
            type="color" 
            value={color} 
            className='color'
            onChange={(e) => setColor(e.target.value)} 
          />
          <input 
            type="datetime-local" 
            value={reminder} 
            className='date'
            onChange={(e) => setReminder(e.target.value)} 
          />
          <button type="submit" className='add-btn'>
            {isUpdating ? 'Update Note' : 'Add Note'}
          </button>
          {isUpdating && (
            <button type="button" className="add-btn" onClick={() => {
              setIsUpdating(false);
              setCurrentNoteId(null);
              setTitle('');
              setContent('');
              setTags('');
              setColor('');
              setReminder('');
            }}>
              Cancel
            </button>
          )}

        </div>
      </form>
      <ul className="note-list">
        {notes.length > 0 ? 
        (notes.map(note => (
          <li key={note.id} className="note" style={{ backgroundColor: note.color }}>
            <h1 className='note_head'>{note.title}</h1>
            <p>{note.content}</p>
            <p>Tags: <span>{note.tags}</span></p>
            <p>Reminder: {note.reminder}</p>
            <div className='note-buttons'>
              <button onClick={() => handleUpdateClick(note)} className='update-btn'>Update</button>
              <button onClick={() => handleArchiveClick(note.id)} className='update-btn'>Archive</button>
              <button onClick={() => handleDeleteClick(note.id)} className='update-btn'>Delete</button>
            </div>
          </li> 
        ))) : <h1>No Notes Created Yet</h1>}
      </ul>
    </div>
  );
};

export default NoteForm;
