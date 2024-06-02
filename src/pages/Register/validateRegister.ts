export async function validateRegister(user: {
    username: string,
    email: string,
    password: string
}) {
    const errors: {
        username?: string;
        email?: string;
        password?: string;
    } = {};

    if (!user.username || user.username.length === 0) {
        errors.username = "The username field cannot be empty."
    } else if (user.username.length < 6) {
        errors.username = "The username has to be at least 6 characters."
    } else if (user.username.length > 255) {
        errors.username = "The username cannot be larger than 255 characters."
    }

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
    } else if (user.password.length < 8) {
        errors.password = "The password has to be at least 8 characters."
    } else if (user.password.length > 255) {
        errors.password = "The password cannot be larger than 255 characters."
    }

    return errors;
}