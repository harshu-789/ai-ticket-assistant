import { Inngest } from "../client.js";
import analyzeTicket from "../../utils/ai-agent.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { sendEmail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";

export const onTicketCreate = Inngest.createFunction(
  { name: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { tickedId } = event.data;
      // fetch ticket from db
      const ticket = await step.run("Fetch Ticket", async () => {
        const ticketObj = await ticket.findById(tickedId);
        if (!ticket) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObj;
      });
      // Update ticket using ai agent
      await step.run("Update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTicket(ticket);
      const aiRelatedSkills = await step.run(
        "Update-ticket-with-ai-response",
        async () => {
          let relatedSkills = [];
          if (aiResponse) {
            await Ticket.findByIdAndUpdate(ticket._id, {
              priority: !["low", "medium", "high"].includes(aiResponse.priority)
                ? "medium"
                : aiResponse.priority,
              helpfulNotes: aiResponse.helpfulNotes,
              status: "IN_PROGRESS",
              relatedSkills: aiResponse.relatedSkills,
            });
            skills: aiResponse.relatedSkills;
          }
          return relatedSkills;
        }
      );
      // Assigning to moderators

      const moderator = await step.run(
        "Assign-ticket-to-moderator",
        async () => {
          let user = await user.findOne({
            role: "moderator",
            skills: {
              $elemMatch: {
                $regex: relatedskills.join("|"),
                $options: "i",
              },
            },
          });
          if (!user) {
            user = await User.findOne({ role: "admin" });
          }
          await Ticket.findByIdAndUpdate(ticket._id, {
            assignedTo: user._id || null,
          });
          return user;
        }
      );

      // Notify the moderator via email
      await step.run("Notify-moderator-via-email", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendEmail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running the step", err.message);
      return { success: false };
    }
  }
);
