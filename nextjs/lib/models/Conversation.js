import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  products: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages: [MessageSchema],
  userInfo: {
    nombre: { type: String },
    email: { type: String },
    telefono: { type: String }
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'lead_captured'],
    default: 'active'
  },
  leadCaptured: { type: Boolean, default: false },
  leadData: { type: mongoose.Schema.Types.Mixed },
  messageCount: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'conversations'
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
