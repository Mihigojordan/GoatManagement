import { BarChart, CarFront,PawPrint } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import {  FaDog } from 'react-icons/fa';

import Logo from '../assets/goat.png'

const Sidebar = () => {

  const activeLinkStyle = 'flex items-center p-2 text-white bg-blue-500 rounded-lg text-[14px]';
  const inactiveLinkStyle = 'flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-[15px] mb-3';
  const activeClassName = ({ isActive }) => (isActive ? activeLinkStyle : inactiveLinkStyle);

  return (
    <div className="w-[18%] h-[100vh] bg-gray-50 border-r border-gray-200 pl-2 pr-2 fixed">
      
           <img src={Logo} className='w-[30%]  h-3%] text-center m-auto pt-2 pb-2' alt="" />
       
      <nav>
        <ul className="space-y-2">
          <li>
            <NavLink to="/Dispatch/dashboard/home" className={activeClassName}>
              <BarChart className="mr-3 text-[12px]" /> Dashboard
            </NavLink>
          </li>
         
       <li>
  <NavLink to="manage-goat" className={activeClassName}>
    < FaDog className="mr-2 text-[25px]" /> Manage Goats
  </NavLink>
</li>

        
          
            <li>
            <NavLink to="/dashboard/checkout" className={activeClassName}>
              <CarFront className="mr-3 text-[12px]"  /> Goat Checkout 
            </NavLink>
          </li>

        
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;