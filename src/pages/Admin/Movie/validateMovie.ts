export async function validateMovie(movie: {
    title: string;
    description: string;
    genre: string;
    director: string;
    releaseDate: string;
    duration: number;
    image: string;
    rating: number;
}, imageFile: File | null, validateImage = true) {
    const errors: {
        title?: string;
        description?: string;
        genre?: string;
        director?: string;
        releaseDate?: string;
        duration?: string;
        image?: string;
        rating?: string;
    } = {};

    if (!movie.title || movie.title.length === 0) {
        errors.title = "The title field cannot be empty.";
    } else if (movie.title.length < 2) {
        errors.title = "The title of the movie must be at least 2 characters.";
    } else if (movie.title.length > 255) {
        errors.title = "The title of the movie cannot be longer than 255 characters.";
    }

    if (!movie.description || movie.description.length === 0) {
        errors.description = "The description field cannot be empty.";
    } else if (movie.description.length < 20) {
        errors.description = "The description of the movie must be at least 20 characters.";
    } else if (movie.description.length > 500) {
        errors.description = "The description of the movie cannot be longer than 500 characters.";
    }

    if (!movie.genre || movie.genre.length === 0) {
        errors.genre = "The genre field cannot be empty.";
    } else if (movie.genre.length < 5) {
        errors.genre = "The genre of the movie must be at least 5 characters.";
    } else if (movie.genre.length > 255) {
        errors.genre = "The genre of the movie cannot be longer than 255 characters.";
    }

    if (!movie.director || movie.director.length === 0) {
        errors.director = "The director field cannot be empty.";
    } else if (movie.director.length < 5) {
        errors.director = "The director's name must be at least 5 characters.";
    } else if (movie.director.length > 255) {
        errors.director = "The director's name cannot be longer than 255 characters.";
    }

    if (!movie.releaseDate || movie.releaseDate.length === 0) {
        errors.releaseDate = "The release date field cannot be empty.";
    } else {
        const date = new Date(movie.releaseDate);
        if (isNaN(date.getTime())) {
            errors.releaseDate = "The release date is invalid.";
        }
    }

    if (isNaN(movie.duration) || !Number.isInteger(movie.duration)) {
        errors.duration = "The duration must be an integer.";
    } else if (movie.duration < 0 || movie.duration > 240) {
        errors.duration = "The duration must be a positive number between 0 and 240.";
    }

    if (isNaN(movie.rating)) {
        errors.rating = "The rating must be a number.";
    } else if (movie.rating < 1 || movie.rating > 10) {
        errors.rating = "The rating must be a number between 1 and 10.";
    }

    if (validateImage && !imageFile && !movie.image) {
        errors.image = "The image field cannot be empty.";
    }

    return errors;
}
