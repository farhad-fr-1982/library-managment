import { createTransport } from "nodemailer";

const sendOtp = async (email, otp) => {
    const transporter = createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,        
        to: email,                            
        subject: "کد تایید شما",             
        html: `<h2>کد تایید شما ${otp} است</h2>` 
    });
}

export default sendOtp