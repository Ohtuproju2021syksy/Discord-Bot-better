import React from 'react'

const Error = ({ message }) => {
    return (
        <div className="error">

            <h3>Hey there! Something went wrong.</h3>
            <p>Try again or contact a staff member.</p>
            <p classname="msg">Error: {message}</p>

        </div>
    )
}

export default Error