import React from 'react'
import logo from '../images/hy_logo.jpg'

const Footer = () => {
    return (
        <div className="footer">
            <div className="footer-img-wrapper">
                <img src={logo} alt="hy_logo" className="footer-img"/>
            </div>
            <div className="footer-text-wrapper">
                <p className="footer-text">© University of Helsinki 2021</p>
            </div>
        </div>
    )
}

export default Footer