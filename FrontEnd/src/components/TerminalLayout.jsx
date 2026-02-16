import React from 'react';

const TerminalLayout = ({ children }) => {
    return (
        <div className="terminalWrapper">
            <div className="terminalBox">
                <div className="monoText">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default TerminalLayout;
