import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'


function DashboardMainLayout() {
    return (
        <div className=" ">
       
                <Header />
                <div className="p-6">
                    <Outlet />
                </div>

            </div>

    )
}

export default DashboardMainLayout