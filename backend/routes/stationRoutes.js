import express from 'express';
import { 
  addStation, 
  updateStation, 
  deleteStation, 
  getAllStations, 
  getStationById, 
  getNearbyStations 
} from '../controllers/stationController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { validateStationInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllStations)
  .post(authMiddleware, roleMiddleware(['admin']), validateStationInput, addStation);

router.get('/nearby', getNearbyStations);

router.route('/:id')
  .get(getStationById)
  .put(authMiddleware, roleMiddleware(['admin']), validateStationInput, updateStation)
  .delete(authMiddleware, roleMiddleware(['admin']), deleteStation);

export default router;
