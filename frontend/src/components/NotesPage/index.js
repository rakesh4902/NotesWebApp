import Header from '../Header';
import Navbar from '../Navbar';
import NoteForm from '../NoteForm';
import './index.css';


const NotesPage = () => {

  return (
    <div className='navbar-noteform-cont'>
      <Header/>
      
    <div className="notes-page">
      <Navbar/>
      <NoteForm />
    </div>
    </div>
  );
};

export default NotesPage;
