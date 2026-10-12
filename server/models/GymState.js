import mongoose from 'mongoose';

const gymStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'primary' },
    gymName: { type: String, trim: true, default: 'FitControl Gym' },
    members: { type: [mongoose.Schema.Types.Mixed], default: [] },
    payments: { type: [mongoose.Schema.Types.Mixed], default: [] },
    routines: { type: [mongoose.Schema.Types.Mixed], default: [] },
    activities: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('GymState', gymStateSchema);
