import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Clock, Check } from 'lucide-react';

const SlotSelector = ({ slots, selectedSlot, onSelect }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="text-center p-5 border border-dashed border-white border-opacity-10 rounded-3">
        <p className="text-muted mb-0">No slots available for this station.</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      {slots.map((slot) => {
        const isSelected = selectedSlot?._id === slot._id;
        const isBooked = slot.isBooked;

        return (
          <Col key={slot._id} xs={6} md={4} lg={3}>
            <Button
              variant={isBooked ? "outline-secondary" : isSelected ? "primary" : "outline-primary"}
              className={`w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2 transition-all ${
                isBooked ? 'opacity-50 cursor-not-allowed' : ''
              } ${isSelected ? 'shadow-lg scale-105' : ''}`}
              disabled={isBooked}
              onClick={() => !isBooked && onSelect(slot)}
              style={{ minHeight: '100px' }}
            >
              <div className="position-relative">
                <Clock size={20} />
                {isSelected && (
                  <div className="position-absolute top-0 start-100 translate-middle bg-white rounded-circle p-1 shadow-sm">
                    <Check size={10} color="var(--primary)" strokeWidth={4} />
                  </div>
                )}
              </div>
              <span className={`fw-bold small ${isSelected ? 'text-white' : ''}`}>
                {slot.time}
              </span>
              <span className="small opacity-75" style={{ fontSize: '0.65rem' }}>
                {isBooked ? 'Occupied' : 'Available'}
              </span>
            </Button>
          </Col>
        );
      })}
    </Row>
  );
};

export default SlotSelector;
