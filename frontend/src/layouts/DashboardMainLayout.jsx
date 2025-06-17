import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'


function DashboardMainLayout() {
    return (
        <div className=" flex ">
            <Sidebar />

            <div className=" w-[82%] ml-[18%]   z-50">
                <Header />
                <div className="p-6 bg-gray-100  -z-10">

                    <Outlet />
                </div>

            </div>
        </div>
    )
}

export default DashboardMainLayout