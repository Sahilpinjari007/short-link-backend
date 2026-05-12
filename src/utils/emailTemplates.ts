export const verificationEmailTemplate = (otp: string): string => {
    return `Your OTP for email verification is: <b>${otp}</b>. It will expire in 10 minutes.`;
}

export const forgetPassEmailTemplate = (resetURL: string): string =>{
    return `Your reset password link is ${resetURL}`;
}