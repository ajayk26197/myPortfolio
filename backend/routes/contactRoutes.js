import express from 'express';
import nodemailer from 'nodemailer';
import Message from '../models/Message.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const sendEmailNotification = async (msgData) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const recipient = process.env.RECEIVER_EMAIL || 'ajayk26197@gmail.com';

  if (!emailUser || !emailPass) {
    console.log('ℹ️ Note: EMAIL_USER and EMAIL_PASS not set in backend/.env. Message is saved to database.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${emailUser}>`,
      to: recipient,
      replyTo: msgData.email,
      subject: `📬 Portfolio Message from ${msgData.name}: ${msgData.subject || 'New Contact Form Submission'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
          <h2 style="color: #f97316; margin-top: 0;">📬 New Message on Your Portfolio!</h2>
          <p style="font-size: 15px; color: #94a3b8;">You received a new inquiry on your portfolio website:</p>
          
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 18px 0;">
            <p style="margin: 6px 0;"><strong>👤 Sender Name:</strong> ${msgData.name}</p>
            <p style="margin: 6px 0;"><strong>✉️ Sender Email:</strong> <a href="mailto:${msgData.email}" style="color: #38bdf8;">${msgData.email}</a></p>
            <p style="margin: 6px 0;"><strong>📌 Subject:</strong> ${msgData.subject || 'N/A'}</p>
            <p style="margin: 6px 0;"><strong>⏰ Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 8px; margin-top: 14px; border-left: 4px solid #f97316;">
            <strong style="display: block; margin-bottom: 8px; color: #e2e8f0;">💬 Message:</strong>
            <p style="white-space: pre-wrap; line-height: 1.6; margin: 0; color: #cbd5e1;">${msgData.message}</p>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="mailto:${msgData.email}" style="background: #f97316; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: bold; display: inline-block;">
              ✉️ Reply to ${msgData.name}
            </a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email forwarded to ${recipient}`);
  } catch (err) {
    console.error('⚠️ Failed to forward email via Nodemailer:', err.message);
  }
};

// POST /api/contact (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : '',
      message: message.trim(),
    });

    // Forward email in background without blocking response
    sendEmailNotification({
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : '',
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error saving message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
});

// GET /api/contact/messages (Protected - Admin Only)
router.get('/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
});

// DELETE /api/contact/messages/:id (Protected - Admin Only)
router.delete('/messages/:id', protect, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Error deleting message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
});

export default router;
