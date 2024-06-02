export async function validateHall(hall: {
    name: string;
    numberOfSeats: number
}) {
    const errors: {
        name?: string;
        numberOfSeats?: string;
    } = {};

    if (!hall.name || hall.name.length === 0) {
        errors.name = "The name field cannot be empty.";
    } else if (hall.name.length < 5) {
        errors.name = "The name of the hall must be at least 5 characters.";
    } else if (hall.name.length > 255) {
        errors.name = "The name of the hall cannot be longer than 255 characters.";
    }

    if (isNaN(hall.numberOfSeats) || !Number.isInteger(hall.numberOfSeats)) {
        errors.numberOfSeats = "The number of seats in the hall must be an integer.";
    } else if (hall.numberOfSeats < 10 || hall.numberOfSeats > 50) {
        errors.numberOfSeats = "The number of seats in the hall must be a number between 10 and 50.";
    }

    return errors;
}
