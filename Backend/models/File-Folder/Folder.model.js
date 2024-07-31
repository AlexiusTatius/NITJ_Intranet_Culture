import mongoose from 'mongoose';
const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
    index: true
  },
  path: {
    type: String,
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherUser',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for ensuring uniqueness of folder names within the same parent and owner
FolderSchema.index({ parent: 1, owner: 1, path: 1 }, { unique: true });

// Index for efficient querying of a user's folders
FolderSchema.index({ owner: 1, path: 1 });

const FolderModel = mongoose.model('Folder', FolderSchema);

export default FolderModel;
