import Contact from '../models/contact.model';
import { IdentifyRequest, ConsolidatedContact } from '../interfaces/contact.interface';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

class ContactService {
  async identifyContact(payload: IdentifyRequest): Promise<ConsolidatedContact> {
    return sequelize.transaction(async (transaction: Transaction) => {
      const { email, phoneNumber } = payload;
      
      // Find existing contacts matching email or phoneNumber
      const matchingContacts = await Contact.findAll({
        where: {
          [Op.or]: [
            ...(email ? [{ email }] : []),
            ...(phoneNumber ? [{ phoneNumber }] : [])
          ],
          deletedAt: null
        },
        transaction
      });

      // Case 1: No existing contacts found
      if (matchingContacts.length === 0) {
        const newContact = await Contact.create({
          phoneNumber,
          email,
          linkPrecedence: 'primary',
        }, { transaction });
        
        return this.formatResponse(newContact.id);
      }

      // Collect all primary contact IDs
      const primaryContactIds = new Set<number>();
      for (const contact of matchingContacts) {
        if (contact.linkPrecedence === 'primary') {
          primaryContactIds.add(contact.id);
        } else {
          primaryContactIds.add(contact.linkedId!);
        }
      }

      // Find primary contacts
      const primaryContacts = await Contact.findAll({
        where: {
          id: Array.from(primaryContactIds),
          linkPrecedence: 'primary',
          deletedAt: null
        },
        order: [['createdAt', 'ASC']],
        transaction
      });

      // Determine main primary contact (oldest)
      const mainPrimaryContact = primaryContacts[0];
      const otherPrimaryContacts = primaryContacts.slice(1);

      // Convert other primary contacts to secondary
      for (const contact of otherPrimaryContacts) {
        await Contact.update(
          { linkPrecedence: 'secondary', linkedId: mainPrimaryContact.id },
          { where: { id: contact.id }, transaction }
        );
        
        await Contact.update(
          { linkedId: mainPrimaryContact.id },
          { 
            where: { 
              linkedId: contact.id,
              deletedAt: null
            },
            transaction 
          }
        );
      }

      // Check if new contact needs to be created
      const allContacts = await Contact.findAll({
        where: {
          [Op.or]: [
            { id: mainPrimaryContact.id },
            { linkedId: mainPrimaryContact.id }
          ],
          deletedAt: null
        },
        transaction
      });

      const existingEmails = new Set(allContacts.map(c => c.email).filter(Boolean));
      const existingPhones = new Set(allContacts.map(c => c.phoneNumber).filter(Boolean));

      const hasNewEmail = email && !existingEmails.has(email);
      const hasNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

      if (hasNewEmail || hasNewPhone) {
        await Contact.create({
          email,
          phoneNumber,
          linkedId: mainPrimaryContact.id,
          linkPrecedence: 'secondary'
        }, { transaction });
      }

      return this.formatResponse(mainPrimaryContact.id, transaction);
    });
  }

  private async formatResponse(primaryContactId: number, transaction?: Transaction): Promise<ConsolidatedContact> {
    const allContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContactId },
          { linkedId: primaryContactId }
        ],
        deletedAt: null
      },
      order: [['createdAt', 'ASC']],
      transaction // Pass transaction through
    });
  
    // Handle case where primary contact is not found
    if (allContacts.length === 0) {
      return {
        primaryContactId,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
      };
    }
  
    // Find primary contact - it might not be first in the list
    const primaryContact = allContacts.find(c => c.id === primaryContactId) || allContacts[0];
    const secondaryContacts = allContacts.filter(c => c.id !== primaryContactId);
  
    // Collect unique emails with primary first
    const emails = new Set<string>();
    if (primaryContact.email) emails.add(primaryContact.email);
    secondaryContacts.forEach(c => {
      if (c.email) emails.add(c.email);
    });
  
    // Collect unique phone numbers with primary first
    const phoneNumbers = new Set<string>();
    if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);
    secondaryContacts.forEach(c => {
      if (c.phoneNumber) phoneNumbers.add(c.phoneNumber);
    });
  
    return {
      primaryContactId,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds: secondaryContacts.map(c => c.id)
    };
  }

  async getAllContacts(): Promise<ConsolidatedContact[]> {
    const allContacts = await Contact.findAll({
      where: { deletedAt: null },
      order: [['createdAt', 'ASC']]
    });
  
    // Group contacts by primary contact
    const grouped = new Map<number, ConsolidatedContact>();
  
    for (const contact of allContacts) {
      const primaryId = contact.linkPrecedence === 'primary' ? contact.id : contact.linkedId!;
      if (!grouped.has(primaryId)) {
        grouped.set(primaryId, {
          primaryContactId: primaryId,
          emails: [],
          phoneNumbers: [],
          secondaryContactIds: [],
        });
      }
  
      const group = grouped.get(primaryId)!;
  
      if (contact.email && !group.emails.includes(contact.email)) {
        group.emails.push(contact.email);
      }
  
      if (contact.phoneNumber && !group.phoneNumbers.includes(contact.phoneNumber)) {
        group.phoneNumbers.push(contact.phoneNumber);
      }
  
      if (contact.id !== primaryId) {
        group.secondaryContactIds.push(contact.id);
      }
    }
  
    return Array.from(grouped.values());
  }
  
}

export default new ContactService();