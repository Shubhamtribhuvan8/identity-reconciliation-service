import { Router } from 'express';
import contactController from '../controllers/contactController';

const router = Router();

router.post('/identify', contactController.identify);
router.get('/contacts', contactController.getAll);


export default router;