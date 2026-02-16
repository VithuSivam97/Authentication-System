import React from 'react';

const ErrorPopup = ({ isOpen, onClose, code, status, action }) => {
    if (!isOpen) return null;

    return (
        <div className="popupOverlay">
            <div className="popupBox">
                <div className="popupHeader">
                    <span className="alertPulse">⚠</span> ACCESS DENIED
                </div>
                <div className="popupBody">
                    <p>{`> ERROR_CODE: ${code || '403_FORBIDDEN'}`}</p>
                    <p>{`> STATUS: ${status || 'INVALID_OPERATION'}`}</p>
                    <p>{`> ACTION: ${action || 'VERIFY_INPUT_DATA'}`}</p>
                </div>
                <button
                    onClick={onClose}
                    className="acknowledgeBtn"
                >
                    ACKNOWLEDGE
                </button>
            </div>
        </div>
    );
};

export default ErrorPopup;
