import React from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SlotSelector = ({ slots, selectedSlot, onSelect }) => {
  const isPast = (slotTime) => {
    try {
      const [startTimeStr] = slotTime.split(' - ');
      const now = new Date();
      const [time, modifier] = startTimeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const slotDate = new Date();
      slotDate.setHours(hours, minutes, 0, 0);
      
      return slotDate < now;
    } catch (e) {
      return false;
    }
  };

  return (
    <Row className="g-3">
      {slots.map((slot) => {
        const isBooked = slot.isBooked;
        const isSelected = selectedSlot?._id === slot._id;
        const past = isPast(slot.time);

        return (
          <Col key={slot._id} xs={6} md={4} lg={3}>
            <Button
              variant="link"
              className={`w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2 transition-all border text-decoration-none shadow-sm ${
                isBooked 
                  ? 'bg-dark bg-opacity-50 border-white border-opacity-10 text-muted cursor-not-allowed opacity-40' 
                  : isSelected 
                    ? 'bg-primary border-primary text-white shadow-glow scale-105' 
                    : 'bg-dark bg-opacity-25 border-white border-opacity-10 text-white hover-glow'
              }`}
              disabled={isBooked}
              onClick={() => !isBooked && onSelect(slot)}
              style={{ 
                minHeight: '120px', 
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="position-absolute top-0 end-0 p-2"
                >
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '20px', height: '20px' }}>
                    <Check size={12} className="text-primary" strokeWidth={4} />
                  </div>
                </motion.div>
              )}

              <div className={`p-2 rounded-circle mb-1 ${isSelected ? 'bg-white bg-opacity-20' : 'bg-primary bg-opacity-10'}`}>
                <Clock size={20} className={isSelected ? 'text-white' : (isBooked ? 'text-muted' : 'text-primary')} />
              </div>

              <span className={`fw-bold small px-2 text-center ${isSelected ? 'text-white' : (past ? 'text-muted text-decoration-line-through' : 'text-white')}`} style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                {slot.time}
              </span>

              <Badge 
                bg={isBooked ? 'secondary' : isSelected ? 'white' : 'primary'} 
                className={`bg-opacity-10 px-2 py-1 mt-1 ${isSelected ? 'text-white border border-white border-opacity-20' : ''}`}
                style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.5px' }}
              >
                {slot.isBooked ? 'BOOKED' : past ? 'TOMORROW' : 'AVAILABLE'}
              </Badge>
            </Button>
          </Col>
        );
      })}
    </Row>
  );
};

export default SlotSelector;
