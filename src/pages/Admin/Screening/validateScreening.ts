export async function validateScreening(screening: {
    movieId: string;
    hallId: string;
    date: string;
    time: string;
}, selectedCinema: string) {
    const errors: {
        movieId?: string;
        hallId?: string;
        dateTime?: string;
        cinema?: string;
    } = {};

    if (!screening.movieId) {
        errors.movieId = "Please select a movie.";
    }

    if (!screening.hallId && screening.movieId && !selectedCinema) {
        errors.cinema = "Please select a cinema.";
    }

    if (!screening.hallId) {
        errors.hallId = "Please select a hall.";
    }

    if (!screening.date || !screening.time) {
        errors.dateTime = "Please select a date and time.";
    } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(screening.date)) {
            errors.dateTime = "Please enter a valid date (YYYY-MM-DD).";
        }

        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(screening.time)) {
            errors.dateTime = "Please enter a valid time (HH:MM).";
        }

        const dateTime = new Date(`${screening.date}T${screening.time}`);
        const now = new Date();

        if (dateTime < now) {
            errors.dateTime = "Please select a date and time that are in the future.";
        } else {
            const [hours, minutes] = screening.time.split(':').map(Number);
            const screeningTime = hours * 60 + minutes;
            const startTime = 14 * 60;
            const endTime = (22 * 60) + 1;

            if (screeningTime < startTime || screeningTime >= endTime) {
                errors.dateTime = "Screening time must be between 14:00 and 22:01.";
            }
        }
    }

    return errors;
}
