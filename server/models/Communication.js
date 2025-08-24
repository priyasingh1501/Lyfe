const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['maid', 'cook', 'driver', 'gardener', 'maintenance', 'delivery', 'service', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['household', 'personal', 'work', 'health', 'finance', 'other'],
    default: 'household'
  },
  contact: {
    phone: String,
    email: String,
    address: String,
    emergencyContact: String
  },
  services: [{
    name: String,
    description: String,
    frequency: String,
    rate: Number,
    currency: { type: String, default: 'USD' },
    paymentMethod: String
  }],
  schedule: {
    days: [Number], // 0-6 for days of week
    startTime: String,
    endTime: String,
    isFlexible: { type: Boolean, default: false }
  },
  payment: {
    amount: Number,
    frequency: String,
    dueDate: Date,
    method: String,
    lastPaid: Date,
    nextPayment: Date
  },
  performance: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: [String],
    issues: [String],
    improvements: [String]
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    expiryDate: Date
  }],
  notes: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on-hold'],
    default: 'active'
  },
  tags: [String]
}, {
  timestamps: true
});

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  type: {
    type: String,
    enum: ['instruction', 'request', 'feedback', 'schedule', 'payment', 'emergency', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: String,
  content: {
    type: String,
    required: true
  },
  instructions: [String],
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  delivery: {
    method: {
      type: String,
      enum: ['in-person', 'phone', 'text', 'email', 'app', 'note'],
      required: true
    },
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    acknowledged: { type: Boolean, default: false }
  },
  response: {
    received: { type: Boolean, default: false },
    content: String,
    receivedAt: Date,
    actionTaken: String
  },
  followUp: {
    required: { type: Boolean, default: false },
    date: Date,
    notes: String,
    completed: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'delivered', 'read', 'acknowledged', 'completed', 'cancelled'],
    default: 'draft'
  },
  notes: String
}, {
  timestamps: true
});

const taskInstructionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'one-time', 'recurring'],
    required: true
  },
  description: String,
  instructions: [String],
  checklist: [{
    item: String,
    completed: { type: Boolean, default: false },
    notes: String
  }],
  schedule: {
    startDate: Date,
    endDate: Date,
    time: String,
    days: [Number], // 0-6 for days of week
    frequency: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  materials: [{
    name: String,
    quantity: String,
    location: String,
    notes: String
  }],
  budget: {
    estimated: Number,
    actual: Number,
    currency: { type: String, default: 'USD' }
  },
  quality: {
    standard: String,
    photos: [String],
    feedback: String
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'],
    default: 'pending'
  },
  completion: {
    startedAt: Date,
    completedAt: Date,
    duration: Number, // in minutes
    notes: String,
    issues: [String]
  },
  notes: String
}, {
  timestamps: true
});

const groceryOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['grocery', 'household', 'personal-care', 'other'],
    default: 'grocery'
  },
  items: [{
    name: String,
    quantity: String,
    brand: String,
    category: String,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notes: String,
    purchased: { type: Boolean, default: false },
    price: Number
  }],
  store: {
    name: String,
    location: String,
    phone: String,
    website: String
  },
  budget: {
    estimated: Number,
    actual: Number,
    currency: { type: String, default: 'USD' }
  },
  delivery: {
    method: { type: String, enum: ['pickup', 'delivery', 'in-store'], default: 'pickup' },
    address: String,
    instructions: String,
    preferredTime: String
  },
  status: {
    type: String,
    enum: ['planned', 'ordered', 'shopping', 'completed', 'cancelled'],
    default: 'planned'
  },
  notes: String,
  dueDate: Date
}, {
  timestamps: true
});

// Indexes
contactSchema.index({ userId: 1, type: 1 });
contactSchema.index({ userId: 1, status: 1 });
messageSchema.index({ userId: 1, contactId: 1, createdAt: -1 });
taskInstructionSchema.index({ userId: 1, contactId: 1, status: 1 });
groceryOrderSchema.index({ userId: 1, status: 1, dueDate: 1 });

// Virtual for contact's next payment due
contactSchema.virtual('nextPaymentDue').get(function() {
  if (!this.payment.nextPayment) return null;
  const now = new Date();
  const diffTime = this.payment.nextPayment - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for message delivery status
messageSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'draft') return 'draft';
  if (this.status === 'sent' && !this.delivery.deliveredAt) return 'sent';
  if (this.delivery.deliveredAt && !this.delivery.readAt) return 'delivered';
  if (this.delivery.readAt && !this.response.acknowledged) return 'read';
  if (this.response.acknowledged) return 'acknowledged';
  return 'unknown';
});

// Method to send message
messageSchema.methods.send = function() {
  this.status = 'sent';
  this.delivery.sentAt = new Date();
  return this.save();
};

// Method to mark as delivered
messageSchema.methods.markDelivered = function() {
  this.delivery.deliveredAt = new Date();
  return this.save();
};

// Method to mark as read
messageSchema.methods.markRead = function() {
  this.delivery.readAt = new Date();
  return this.save();
};

// Method to acknowledge message
messageSchema.methods.acknowledge = function(response, actionTaken) {
  this.response.received = true;
  this.response.content = response;
  this.response.receivedAt = new Date();
  this.response.actionTaken = actionTaken;
  this.response.acknowledged = true;
  this.status = 'acknowledged';
  return this.save();
};

// Method to add task instruction
contactSchema.methods.addTaskInstruction = function(taskData) {
  // This would typically be done through the TaskInstruction model
  // but we can store basic task info
  if (!this.services) {
    this.services = [];
  }
  if (taskData.service && !this.services.find(s => s.name === taskData.service)) {
    this.services.push({
      name: taskData.service,
      description: taskData.description,
      frequency: taskData.frequency
    });
  }
  return this.save();
};

// Method to update payment
contactSchema.methods.updatePayment = function(amount, method) {
  this.payment.lastPaid = new Date();
  this.payment.amount = amount;
  this.payment.method = method;
  
  // Calculate next payment based on frequency
  if (this.payment.frequency === 'weekly') {
    this.payment.nextPayment = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  } else if (this.payment.frequency === 'monthly') {
    this.payment.nextPayment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  return this.save();
};

module.exports = {
  Contact: mongoose.model('Contact', contactSchema),
  Message: mongoose.model('Message', messageSchema),
  TaskInstruction: mongoose.model('TaskInstruction', taskInstructionSchema),
  GroceryOrder: mongoose.model('GroceryOrder', groceryOrderSchema)
};
