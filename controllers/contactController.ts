import { Request, Response } from 'express';
import { IdentifyRequest } from '../interfaces/contact.interface';
import contactService from '../services/contact.service';
import { apiResponse } from '../utils/apiResponse';

class ContactController {
    async identify(req: Request, res: Response) {
        try {
          const payload: IdentifyRequest = req.body;
          
          // Validate payload has at least one identifier
          if (!payload.email && !payload.phoneNumber) {
            return apiResponse(res, 400, { error: 'Email or phoneNumber required' });
          }
          
          const result = await contactService.identifyContact(payload);
          return apiResponse(res, 200, result);
        } catch (error) {
          console.error('Error in identify:', error);
          return apiResponse(res, 500, { error: 'Internal server error' });
        }
      }
      async getAll(req: Request, res: Response) {
        try {
          const result = await contactService.getAllContacts();
          return apiResponse(res, 200, result);
        } catch (error) {
          console.error('Error in getAll:', error);
          return apiResponse(res, 500, { error: 'Internal server error' });
        }
      }
      
}

export default new ContactController();