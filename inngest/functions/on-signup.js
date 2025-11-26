import { inngest } from "../client.js";
import { User } from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/email.js";

export const onSignup = inngest.createFunction(
  { name: "On User Signup", retries: 2, event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("Get User Email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User not found");
        }
        return userObject;
      });
      await step.run("Send Welcome Email", async () => {
        const subject = "Welcome to AI Ticket Assistant!";
        const message = `Hello ${user.name},\n\nThank you for signing up for AI Ticket Assistant. We're excited to have you on board!\n\nBest regards,\nThe AI Ticket Assistant Team`;

        await sendEmail(user.email, subject, message);
    });
    return { success: true };
    } catch (error) {
        console.error("Error in onSignup function:", error);
        return { success: false, error: error.message };
    }
  }
);
