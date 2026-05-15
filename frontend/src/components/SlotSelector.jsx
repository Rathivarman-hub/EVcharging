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
              className={`w-100 py-3 d-flex flex-column align-items-center justify-content-center gap-2 transition-all border text-decoration-none ${
                isBooked 
                  ? 'bg-white bg-opacity-5 border-white border-opacity-10 text-muted cursor-not-allowed opacity-40' 
                  : isSelected 
                    ? 'bg-primary border-primary text-white shadow-glow scale-105' 
                    : 'bg-white bg-opacity-5 border-white border-opacity-10 text-white hover-glow'
              }`}
              disabled={isBooked}
              onClick={() => !isBooked && onSelect(slot)}
              style={{ 
                minHeight: '100px', 
                borderRadius: '16px',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="position-relative">
                <Clock size={18} className={isSelected ? 'text-white' : (isBooked ? 'text-muted' : 'text-primary')} />
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="position-absolute top-0 start-100 translate-middle bg-white rounded-circle p-1 shadow-sm"
                  >
                    <Check size={8} color="var(--bs-primary)" strokeWidth={4} />
                  </motion.div>
                )}
              </div>
              <span className={`fw-bold small ${isSelected ? 'text-white' : (past ? 'text-muted text-decoration-line-through' : 'text-white')}`}>
                {slot.time}
              </span>
              <Badge 
                bg={isBooked ? 'secondary' : isSelected ? 'white' : 'primary'} 
                className={`bg-opacity-10 px-2 py-1 ${isSelected ? 'text-white border border-white border-opacity-20' : ''}`}
                style={{ fontSize: '0.6rem', fontWeight: '700' }}
              >
                {slot.isBooked ? 'OCCUPIED' : past ? 'TOMORROW' : 'AVAILABLE'}
              </Badge>
            </Button>
          </Col>
        );
      })}
    </Row>
  );
};

export default SlotSelector;
