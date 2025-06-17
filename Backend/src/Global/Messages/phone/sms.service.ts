import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = 'https://rest.clicksend.com/v3';
  private readonly auth;

  constructor() {
    const username = process.env.CLICKSEND_USERNAME;
    const apiKey = process.env.CLICKSEND_API_KEY;

    const credentials = Buffer.from(`${username}:${apiKey}`).toString('base64');

    this.auth = {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Send an SMS using ClickSend
   * @param to - Receiver phone number (in international format, e.g., +1234567890)
   * @param message - Plaintext message to send
   */
  async sendSMS(to: string, message: string) {
    const smsPayload = {
      messages: [
        {
          source: 'nodejs',
          body: message,
          to,
          from: 'abyride',
        },
      ],
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/sms/send`,
        smsPayload,
        this.auth,
      );

      this.logger.log('SMS sent successfully', response.data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || error.message;
      this.logger.error('Error sending SMS:', errorData);
      throw new BadRequestException('Error sending SMS', errorData);
    }
  }
}
