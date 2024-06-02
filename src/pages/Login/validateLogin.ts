export async function validateLogin(user: {
    email: string,
    password: string
}) {
    const errors: {
        email?: string;
        password?: string;
    } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || user.email.length === 0) {
        errors.email = "The email field cannot be empty."
    } else if (!emailRegex.test(user.email)) {
        errors.email = "Please enter a valid email address."
    } else if (user.email.length > 255) {
        errors.email = "The email cannot be larger than 255 characters."
    }

    if (!user.password || user.password.length === 0) {
        errors.password = "The password field cannot be empty."
    } else if (user.password.length > 255) {
        errors.password = "The password cannot be larger than 255 characters."
    }

    return errors;
}