import './Layout.css'
import React from "react";


const Layout: React.FC<{}> = ({ children }) => {
    return (
        <div className="layout">
            {children}
        </div>
    )
};

export default Layout;
