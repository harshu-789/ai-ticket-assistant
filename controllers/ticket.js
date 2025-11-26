import { Inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";


export const createTicket = async (req, res) =>{
    try {
        const {title, description} = req.body;
        if(!title || !description){
            return res.status(400).json({message: "Title and description are required"});
        }
        const newTicket = Ticket.create({
            title,
            description,
            createdAt: new Date(),
            createdBy: req.user._id.toString()
        })
        await Inngest.send({
            name: "ticket/created",
            data : {
                ticketId: (await newTicket)._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString()

            }
        })
        return res.status(201).json({message: "Ticket created successfully", ticket:  newTicket});
    } catch (error) {
        console.error("Error creating ticket:", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}


export const getTickets = async (req, res) =>{
    try {
        const user = req.user
        let tickets = []
        if(user.role !== "user"){
            tickets = await Ticket.find({})
            .populate("assignedTo",["email","_id"])
            .sort({createdAt: -1})
        } else {
            tickets = await Ticket.find({createdBy: user._id})
            .select(["title","description","status","createdAt","assignedTo"])
            .sort({createdAt: -1})
        }
        return res.status(200).json({tickets});
    } catch (error) {
        console.error("Error fetching tickets :", error.message);
        return res.status(500).json({message: "Internal server error"}); 
    }
}


export const getTicket = async (req,res) =>{
    try {
        const user = req.user
        let ticket
        if(user.role !== "user"){
            ticket = await Ticket.findById(req.params.id)
            .populate("assignedTo",["email","_id"])
        
        } else {
            ticket = await Ticket.findOne({createdBy: user._id, _id: req.params.id})
            .select(["title","description","status","createdAt","assignedTo"])
        }
        if(!ticket){
            return res.status(404).json({message: "Ticket not found"});
        }
        return res.status(200).json({ticket});
    } catch (error) {
         console.error("Error fetching ticket:", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}


export const updateTicket = async (req, res) => {
  try {
    const user = req.user;
    const updateData = req.body;

    let ticket;

    if (user.role !== "user") {
      // Admin / Agent can update any ticket
      ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }    // returns the updated document
      ).populate("assignedTo", ["email", "_id"]);

    } else {
      // Normal user can update only their ticket
      ticket = await Ticket.findOneAndUpdate(
        { createdBy: user._id, _id: req.params.id },
        updateData,
        { new: true }
      ).select(["title", "description", "status", "createdAt", "assignedTo"]);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket
    });

  } catch (error) {
    console.error("Error updating ticket:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteTicket = async (req, res) => {
    try {
        const user = req.user;
        const {id} = req.params;
        let ticket;
        if(user.role !== "user"){
            ticket = await Ticket.findByIdAndDelete(id)
            .populate("assignedTo", ["email", "_id"]);
        }
        else {
            ticket = await Ticket.findOneAndDelete({createdBy: user._id, _id: id})
            .select(["title", "description", "status", "createdAt", "assignedTo"]);

        }
        if(!ticket){
            return res.status(404).json({message: "Ticket not found"});
        }
        return res.status(200).json({message: "Ticket deleted successfully"});
    } catch (error) {
        console.error("Error deleting ticket:", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}