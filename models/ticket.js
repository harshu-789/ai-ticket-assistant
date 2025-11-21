import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    title : { type: String, required: true },
    description : { type: String, required: true },
    status : { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    priority : String, 
    assignedTo : { type: mongoose.Schema.Types.ObjectId, ref: 'User',default: null },
    deadline : Date,
    helpfulResources : String,
    relatedSkills : [String],
    createdAt : { type: Date, default: Date.now },

})


export default mongoose.model('Ticket', ticketSchema)