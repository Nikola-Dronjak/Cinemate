import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonDatetime, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonSelect, IonSelectOption, IonToast } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { validateScreening } from './validateScreening';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

interface Cinema {
    _id: string;
    name: string;
    address: string;
    city: string;
}

interface Hall {
    _id: string,
    name: string,
    numberOfSeats: number,
    cinemaId: string
}

interface Movie {
    _id: string;
    title: string;
    description: string;
    genre: string;
    director: string;
    releaseDate: string;
    duration: number;
    image: string;
    rating: number;
}

interface Screening {
    _id: string;
    date: string;
    time: string;
    endTime: string;
    movieId: string;
    hallId: string;
    numberOfAvailableSeats: number;
    basePriceEUR: number;
}

const AddScreening: React.FC = () => {
    const { movieId, hallId } = useParams<{ movieId?: string; hallId?: string }>();

    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<string>('');

    const [movies, setMovies] = useState<Movie[]>([]);
    const [movie, setMovie] = useState<Omit<Movie, '_id'>>({
        title: '',
        description: '',
        genre: '',
        director: '',
        releaseDate: '',
        duration: NaN,
        image: '',
        rating: NaN
    });

    const [halls, setHalls] = useState<Hall[]>([]);
    const [hall, setHall] = useState<Omit<Hall, '_id'>>({
        name: '',
        numberOfSeats: NaN,
        cinemaId: ''
    })

    const [screening, setScreening] = useState<Omit<Screening, '_id' | 'endTime' | 'numberOfAvailableSeats'>>({
        date: '',
        time: '',
        movieId: '',
        hallId: '',
        basePriceEUR: NaN
    });

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const { t } = useTranslation();

    useEffect(() => {
        fetchData();
    }, [movieId, hallId, selectedCinema]);

    const fetchData = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            if (movieId) {
                setScreening(screening => ({
                    ...screening,
                    movieId: movieId
                }));

                await axios.get(`/api/movies/${movieId}`)
                    .then((response) => {
                        if (response.status === 200) {
                            const { title, description, genre, director, releaseDate, duration, image, rating } = response.data;
                            setMovie({ title, description, genre, director, releaseDate, duration, image, rating });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    });

                await axios.get('/api/cinemas', {
                    headers: {
                        'x-auth-token': token,
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            const cleanCinemas: Cinema[] = response.data.cinemas.map((cinema: any) => ({
                                _id: cinema._id,
                                name: cinema.name,
                                address: cinema.address,
                                city: cinema.city
                            }));
                            setCinemas(cleanCinemas);
                        } else if (response.status === 404) {
                            setCinemas([]);
                            setToast({ message: response.data.message, color: 'danger' });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    });;
            } else if (hallId) {
                setScreening(screening => ({
                    ...screening,
                    hallId: hallId
                }));

                await axios.get(`/api/halls/${hallId}`, {
                    headers: {
                        'x-auth-token': token,
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            const { name, numberOfSeats, cinemaId } = response.data;
                            setHall({ name, numberOfSeats, cinemaId })
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    });

                await axios.get('/api/movies')
                    .then((response) => {
                        if (response.status === 200) {
                            const cleanMovies: Movie[] = response.data.movies.map((movie: any) => ({
                                _id: movie._id,
                                title: movie.title,
                                description: movie.description,
                                genre: movie.genre,
                                director: movie.director,
                                releaseDate: movie.releaseDate,
                                duration: movie.duration,
                                image: movie.image,
                                rating: movie.rating
                            }));
                            setMovies(cleanMovies);
                        } else if (response.status === 404) {
                            setMovies([]);
                            setToast({ message: response.data.message, color: 'danger' });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    });
            }

            if (selectedCinema) {
                axios.get(`/api/cinemas/${selectedCinema}/halls`, {
                    headers: {
                        'x-auth-token': token,
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            const cleanHalls: Hall[] = response.data.halls.map((hall: any) => ({
                                _id: hall._id,
                                name: hall.name,
                                numberOfSeats: hall.numberOfSeats,
                                cinemaId: hall.cinemaId
                            }));
                            setHalls(cleanHalls);
                        } else if (response.status === 404) {
                            setHalls([]);
                            setToast({ message: response.data.message, color: 'danger' });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    });
            }
        }
    };

    async function addScreening(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateScreening(screening, selectedCinema);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                axios.post('/api/screenings', screening, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 201) {
                            setToast({ message: "Screening successfully added.", color: 'success' });
                            if (movieId) {
                                setMovie({
                                    title: movie.title,
                                    description: movie.description,
                                    genre: movie.genre,
                                    director: movie.director,
                                    releaseDate: movie.releaseDate,
                                    duration: movie.duration,
                                    rating: movie.rating,
                                    image: movie.image
                                });
                                setSelectedCinema('');
                                setHall({
                                    name: '',
                                    numberOfSeats: NaN,
                                    cinemaId: ''
                                });
                            } else {
                                setMovie({
                                    title: '',
                                    description: '',
                                    genre: '',
                                    director: '',
                                    releaseDate: '',
                                    duration: NaN,
                                    rating: NaN,
                                    image: ''
                                });
                                setSelectedCinema(selectedCinema);
                                setHall({
                                    name: hall.name,
                                    numberOfSeats: hall.numberOfSeats,
                                    cinemaId: hall.cinemaId
                                });
                            }
                            setScreening({
                                date: '',
                                time: '',
                                movieId: '',
                                hallId: '',
                                basePriceEUR: NaN
                            });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    });
            }
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <Header title='Cinemate' />
            </IonHeader>
            <IonContent className='ion-padding'>
                <IonGrid fixed>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='12' sizeLg='10' sizeXl='8'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>{t('screening.addScreening.title')}</IonCardTitle>
                                    <IonCardSubtitle>{t('screening.addScreening.subtitle')}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addScreening}>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='12' sizeMd='6'>
                                                    {movieId ? (
                                                        <>
                                                            <IonInput label={t('inputs.labels.screening.movie')} type='text' labelPlacement='floating' fill='outline' disabled={true} value={movie.title} />
                                                            <IonSelect className='ion-margin-top' label={t('inputs.labels.screening.cinema')} placeholder={t('inputs.placeholders.screening.cinema')} labelPlacement='floating' fill='outline' value={selectedCinema} onIonChange={(e) => setSelectedCinema(e.detail.value)}>
                                                                {cinemas.map(cinema => (
                                                                    <IonSelectOption key={cinema._id} value={cinema._id}>
                                                                        {cinema.name}
                                                                    </IonSelectOption>
                                                                ))}
                                                            </IonSelect>
                                                            {validationErrors.cinema && <span style={{ color: 'red' }}>{validationErrors.cinema}</span>}
                                                            {selectedCinema && (
                                                                <>
                                                                    <IonSelect className='ion-margin-top' label={t('inputs.labels.screening.hall')} placeholder={t('inputs.placeholders.screening.hall')} labelPlacement='floating' fill='outline' value={screening.hallId} onIonChange={(e) => setScreening({ ...screening, hallId: e.detail.value })}>
                                                                        {halls.map(hall => (
                                                                            <IonSelectOption key={hall._id} value={hall._id}>
                                                                                {`${hall.name}, ${hall.numberOfSeats} ${t('screening.seats')}`}
                                                                            </IonSelectOption>
                                                                        ))}
                                                                    </IonSelect>
                                                                    {validationErrors.hallId && <span style={{ color: 'red' }}>{validationErrors.hallId}</span>}
                                                                </>
                                                            )}
                                                            <IonInput className='ion-margin-top' label={t('inputs.labels.screening.price')} type='number' placeholder={t('inputs.placeholders.screening.price')} labelPlacement='floating' fill='outline' value={screening.basePriceEUR} onIonInput={(e) => setScreening({ ...screening, basePriceEUR: parseInt(e.detail.value!, 10) || 0 })} />
                                                            {validationErrors.priceEUR && <span style={{ color: 'red' }}>{validationErrors.priceEUR}</span>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IonSelect label={t('inputs.labels.screening.movie')} placeholder={t('inputs.placeholders.screening.movie')} labelPlacement='floating' fill='outline' value={screening.movieId} onIonChange={(e) => setScreening({ ...screening, movieId: e.detail.value })}>
                                                                {movies.map(movie => (
                                                                    <IonSelectOption key={movie._id} value={movie._id}>
                                                                        {movie.title}
                                                                    </IonSelectOption>
                                                                ))}
                                                            </IonSelect>
                                                            {validationErrors.movieId && <span style={{ color: 'red' }}>{validationErrors.movieId}</span>}
                                                            <IonInput className='ion-margin-top' label={t('inputs.labels.screening.hall')} type='text' labelPlacement='floating' fill='outline' disabled={true} value={`${hall.name}, ${hall.numberOfSeats} ${t('screening.seats')}`} />
                                                            <IonInput className='ion-margin-top' label={t('inputs.labels.screening.price')} type='number' placeholder={t('inputs.placeholders.screening.price')} labelPlacement='floating' fill='outline' value={screening.basePriceEUR} onIonInput={(e) => setScreening({ ...screening, basePriceEUR: parseInt(e.detail.value!, 10) || 0 })} />
                                                            {validationErrors.priceEUR && <span style={{ color: 'red' }}>{validationErrors.priceEUR}</span>}
                                                        </>
                                                    )}
                                                </IonCol>
                                                <IonCol size='12' sizeMd='6'>
                                                    <IonDatetime presentation="date-time" hourCycle="h23"
                                                        onIonChange={(e) => {
                                                            const dateTime = e.detail.value as string;
                                                            if (dateTime) {
                                                                const [date, time] = dateTime.split('T');
                                                                const formattedTime = time.slice(0, 5);
                                                                setScreening({ ...screening, date, time: formattedTime });
                                                            }
                                                        }}
                                                    />
                                                    {validationErrors.dateTime && <span style={{ color: 'red' }}>{validationErrors.dateTime}</span>}
                                                </IonCol>
                                            </IonRow>
                                            <IonRow className='ion-justify-content-center'>
                                                <IonButton className='ion-margin-top' type='submit' color='primary'>{t('buttons.save')} <IonIcon icon={saveOutline} /></IonButton>
                                            </IonRow>
                                        </IonGrid>
                                    </form>
                                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
                                        position: 'fixed',
                                        top: '10px',
                                        right: '10px',
                                        width: 'auto',
                                        maxWidth: '300px',
                                        zIndex: 9999
                                    }} />
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default AddScreening;