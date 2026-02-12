import { EmailVerificationService } from "./emailVerification.service";
import { EmailVerificationController } from "./emailVerification.controller";

const emailVerificationService = EmailVerificationService.create();
const emailVerificationController = new EmailVerificationController(emailVerificationService);

export { emailVerificationService, emailVerificationController };
