import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import NotesPage from './components/NotesPage';
import ProtectedRoute from './components/ProtectedRoute';
import Archive from './components/ArchivePage';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Trash from './components/TrashPage';
import NotesByLabel from './components/NotesByLabel';
import { NotesProvider } from './components/context/NotesContext'; 

function App() {
  return (
    <Router>
      <Header />
      <div className="navbar-noteform-cont">
        <NotesProvider> 
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<NotesPage />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/notes/labels/:label" element={<NotesByLabel />} />
            </Route>
          </Routes>
        </NotesProvider>
      </div>
    </Router>
  );
}

export default App;
