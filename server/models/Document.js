const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'medical-bill', 'prescription', 'insurance', 'tax-document', 'legal',
      'birth-certificate', 'passport', 'drivers-license', 'contract',
      'receipt', 'warranty', 'manual', 'other'
    ],
    required: true
  },
  category: {
    type: String,
    enum: [
      'health', 'finance', 'legal', 'personal', 'work', 'education', 'travel', 'other'
    ],
    required: true
  },
  description: String,
  file: {
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String
  },
  documentNumber: String, // For official documents like passport numbers
  issueDate: Date,
  expiryDate: Date,
  amount: Number, // For bills and financial documents
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  location: String, // Physical location if stored physically
  isDigital: {
    type: Boolean,
    default: true
  },
  isSecure: {
    type: Boolean,
    default: false
  },
  encryptionKey: String, // For sensitive documents
  accessLevel: {
    type: String,
    enum: ['private', 'shared', 'public'],
    default: 'private'
  },
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit', 'admin'] }
  }],
  reminders: [{
    date: Date,
    message: String,
    type: { type: String, enum: ['email', 'push', 'sms'] },
    sent: { type: Boolean, default: false }
  }],
  notes: String,
  metadata: {
    scanned: Boolean,
    ocrText: String, // Extracted text from scanned documents
    keywords: [String]
  }
}, {
  timestamps: true
});

// Specialized schemas for different document types
const medicalBillSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  provider: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  patient: {
    name: String,
    dateOfBirth: Date,
    insuranceId: String
  },
  services: [{
    description: String,
    date: Date,
    amount: Number,
    insuranceCovered: Number,
    patientResponsibility: Number
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    claimNumber: String
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially-paid', 'paid', 'disputed'],
    default: 'unpaid'
  },
  dueDate: Date,
  lateFees: Number,
  paymentHistory: [{
    date: Date,
    amount: Number,
    method: String,
    reference: String
  }]
});

const prescriptionSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  prescriber: {
    name: String,
    license: String,
    specialty: String,
    contact: String
  },
  patient: {
    name: String,
    dateOfBirth: Date,
    allergies: [String]
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    quantity: String,
    refills: Number
  }],
  diagnosis: String,
  prescriptionDate: Date,
  expiryDate: Date,
  isRefillable: Boolean,
  pharmacy: {
    name: String,
    address: String,
    phone: String
  },
  cost: Number,
  insuranceCovered: Boolean
});

const insuranceSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  type: {
    type: String,
    enum: ['health', 'auto', 'home', 'life', 'travel', 'other']
  },
  provider: {
    name: String,
    address: String,
    phone: String,
    website: String
  },
  policy: {
    number: String,
    type: String,
    startDate: Date,
    endDate: Date,
    premium: Number,
    frequency: String
  },
  coverage: {
    amount: Number,
    deductible: Number,
    coPay: Number,
    outOfPocketMax: Number
  },
  beneficiaries: [{
    name: String,
    relationship: String,
    percentage: Number
  }],
  claims: [{
    date: Date,
    description: String,
    amount: Number,
    status: String,
    claimNumber: String
  }]
});

// Indexes
documentSchema.index({ userId: 1, type: 1 });
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ userId: 1, expiryDate: 1 });
documentSchema.index({ userId: 1, 'sharedWith.userId': 1 });

medicalBillSchema.index({ documentId: 1 });
prescriptionSchema.index({ documentId: 1 });
insuranceSchema.index({ documentId: 1 });

// Virtual for document age
documentSchema.virtual('age').get(function() {
  if (!this.createdAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days until expiry
documentSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if document is expired
documentSchema.methods.isExpired = function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// Method to check if document expires soon (within 30 days)
documentSchema.methods.expiresSoon = function() {
  if (!this.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow;
};

// Method to add reminder
documentSchema.methods.addReminder = function(date, message, type = 'email') {
  this.reminders.push({ date, message, type });
  return this.save();
};

// Method to share document
documentSchema.methods.shareWith = function(userId, permission = 'view') {
  const existingShare = this.sharedWith.find(share => share.userId.toString() === userId.toString());
  if (existingShare) {
    existingShare.permission = permission;
  } else {
    this.sharedWith.push({ userId, permission });
  }
  return this.save();
};

module.exports = {
  Document: mongoose.model('Document', documentSchema),
  MedicalBill: mongoose.model('MedicalBill', medicalBillSchema),
  Prescription: mongoose.model('Prescription', prescriptionSchema),
  Insurance: mongoose.model('Insurance', insuranceSchema)
};
