import React from 'react'
import { NavLink } from 'react-router-dom'

export default class Header extends React.Component {

  render() {
    return (
      <header>
        <div className="relative bg-noct-black h-20">
          <div className="sm:mx-20 ml-20">
            <div className="flex justify-between items-center py-5 h-20">
              <div className="flex justify-start lg:w-0 lg:flex-1">
                <NavLink to="/" className="">
                </NavLink>
              </div>
              <nav className="lg:flex space-x-10 h-full p-0">
                {[ // Use brackets to define array
                  {title: 'Play', url: '/play'},
                  {title: 'About', url: '/about'},
                ].map((attrs) => (
                  <NavLink 
                    to={attrs.url}
                    key={attrs.title}
                    className="hidden lg:transition-all lg:flex md:items-center lg:text-base lg:font-medium lg:text-noct-teal lg:rounded-md lg:hover:text-noct-gray lg:focus:outline-none lg:focus:ring-2 lg:focus:ring-offset-2 lg:focus:ring-indigo-500"
                  > 
                    {attrs.title} 
                  </NavLink>
                ))}
              </nav>
              <div className="hidden lg:flex items-center justify-end lg:flex-1 lg:w-0">
                <NavLink to="/login" className="transition-all whitespace-nowrap text-base font-medium text-noct-teal hover:text-noct-gray"> 
                  Log In 
                </NavLink>
                <NavLink to="/register" className="ease-in duration-200 ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 rounded-full text-base font-medium text-noct-white outline outline-noct-white bg-noct-black hover:bg-noct-white hover:outline-0 hover:text-noct-black"> 
                  Create Account 
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }
}