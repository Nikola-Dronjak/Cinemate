export async function validateCinema(cinema: {
    name: string;
    address: string;
    city: string
}) {
    const errors: {
        name?: string;
        address?: string;
        city?: string
    } = {};

    if (!cinema.name || cinema.name.length === 0) {
        errors.name = "The name field cannot be empty.";
    } else if (cinema.name.length < 5) {
        errors.name = "The name of the cinema must be at least 5 characters.";
    } else if (cinema.name.length > 255) {
        errors.name = "The name of the cinema cannot be longer than 255 characters.";
    }

    if (!cinema.address || cinema.address.length === 0) {
        errors.address = "The address field cannot be empty.";
    } else if (cinema.address.length < 5) {
        errors.address = "The street address of the cinema must be at least 5 characters.";
    } else if (cinema.address.length > 255) {
        errors.address = "The street address of the cinema cannot be longer than 255 characters.";
    }

    if (!cinema.city || cinema.city.length === 0) {
        errors.city = "The city field cannot be empty.";
    } else if (cinema.city.length < 2) {
        errors.city = "The name of the city in which the cinema is located must be at least 2 characters.";
    } else if (cinema.city.length > 255) {
        errors.city = "The name of the city in which the cinema is located cannot be longer than 255 characters.";
    }

    return errors;
}
