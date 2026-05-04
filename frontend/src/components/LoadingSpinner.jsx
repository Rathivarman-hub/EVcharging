import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ fullPage = false }) => {
  const content = (
    <div className="d-flex justify-content-center align-items-center flex-column gap-3">
      <Spinner animation="border" variant="primary" />
      <span className="text-muted fw-medium">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark w-100">
        {content}
      </div>
    );
  }

  return <div className="p-5 w-100">{content}</div>;
};

export default LoadingSpinner;
