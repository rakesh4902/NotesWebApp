import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TbBulb } from "react-icons/tb";
import { RiInboxArchiveLine } from "react-icons/ri";
import { IoTrashBinOutline } from "react-icons/io5";
import { MdOutlineLabel } from "react-icons/md";
import { NotesContext } from '../context/NotesContext';
import './index.css';

const Navbar = () => {
  const { labels } = useContext(NotesContext);

  return (
    <div className="left-navbar">
      <ul className='side-nav-lists'>
        <ul className='side-nav-list'>
          <li className='each-list'><TbBulb size={30}/></li>
          <Link to="/" className='notes-link'><li className='each-list-value'>Notes</li></Link>
        </ul>
        {labels.length > 0 &&
          labels.map((label) => (
            <ul key={label} className='side-nav-list'>
              <li className='each-list'><MdOutlineLabel size={30}/></li>
              <Link to={`/notes/labels/${label}`} className='notes-link'>
                <li className='each-list-value'>{label}</li>
              </Link>
            </ul>
          ))}
        <ul className='side-nav-list'>
          <li className='each-list'><RiInboxArchiveLine size={30}/></li>
          <Link to="/archive" className='notes-link'><li className='each-list-value'>Archive</li></Link>
        </ul>
        <ul className='side-nav-list'>
          <li className='each-list'><IoTrashBinOutline size={30}/></li>
          <Link to="/trash" className='notes-link'><li className='each-list-value'>Trash</li></Link>
        </ul>
      </ul>
    </div>
  );
};

export default Navbar;
