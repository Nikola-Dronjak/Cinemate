import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonDatetime, IonGrid, IonHeader, IonInput, IonPage, IonRow, IonSelect, IonSelectOption, IonToast } from '@ionic/react';
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
    numberOfAvailableSeats: number;
    movieId: string;
    hallId: string;
}

const UpdateScreening: React.FC = () => {
    const { movieId, screeningId } = useParams<{ movieId?: string; screeningId: string }>();

    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<string>('');

    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieName, setMovieName] = useState<string>('');

    const [halls, setHalls] = useState<Hall[]>([]);
    const [hallName, setHallName] = useState<string>('');
    const [hallSeats, setHallSeats] = useState<string>('');

    const [screening, setScreening] = useState<Omit<Screening, '_id' | 'endTime' | 'numberOfAvailableSeats'>>({
        date: '',
        time: '',
        movieId: '',
        hallId: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/screenings/${screeningId}`);
                const { screening, movie, hall, cinema, cinemas, halls, movies } = response.data;

                setScreening({ movieId: screening.movieId, hallId: screening.hallId, date: screening.date, time: screening.time });
                setMovieName(movie.title);
                setHallName(hall.name);
                setHallSeats(hall.numberOfSeats);
                setSelectedCinema(cinema._id);
                setCinemas(cinemas);
                setHalls(halls);
                setMovies(movies);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [screeningId]);

    useEffect(() => {
        const fetchHalls = async () => {
            if (selectedCinema) {
                try {
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        const response = await axios.get(`/api/halls/cinema/${selectedCinema}`, {
                            headers: {
                                'x-auth-token': token
                            }
                        });
                        setHalls(response.data.halls);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };

        fetchHalls();
    }, [selectedCinema]);

    async function updateScreening(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateScreening(screening, selectedCinema);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                axios.put(`/api/screenings/${screeningId}`, screening, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setSuccessMessage("Screening successfully updated.");
                        }
                    })
                    .catch((err) => {
                        setErrorMessage(err.response.data);
                        console.log(err.response.data);
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
                                    <IonCardTitle>Update Screening</IonCardTitle>
                                    <IonCardSubtitle>Please update the screening information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateScreening}>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='12' sizeMd='6'>
                                                    {movieId ? (
                                                        <>
                                                            <IonInput label='Movie' type='text' value={movieName} labelPlacement='floating' fill='outline' disabled={true} />
                                                            <IonSelect className='ion-margin-top' label='Cinema' value={selectedCinema} placeholder="Select Cinema" labelPlacement='floating' fill='outline' onIonChange={(e) => setSelectedCinema(e.detail.value)}>
                                                                {cinemas.map(cinema => (
                                                                    <IonSelectOption key={cinema._id} value={cinema._id}>
                                                                        {cinema.name}
                                                                    </IonSelectOption>
                                                                ))}
                                                            </IonSelect>
                                                            {validationErrors.cinema && <span style={{ color: 'red' }}>{validationErrors.cinema}</span>}
                                                            {selectedCinema && (
                                                                <>
                                                                    <IonSelect className='ion-margin-top' label='Hall' value={screening.hallId} placeholder="Select Hall" labelPlacement='floating' fill='outline' onIonChange={(e) => setScreening({ ...screening, hallId: e.detail.value })}>
                                                                        {halls.map(hall => (
                                                                            <IonSelectOption key={hall._id} value={hall._id}>
                                                                                {`${hall.name}, ${hall.numberOfSeats} seats`}
                                                                            </IonSelectOption>
                                                                        ))}
                                                                    </IonSelect>
                                                                    {validationErrors.hallId && <span style={{ color: 'red' }}>{validationErrors.hallId}</span>}
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IonSelect label='Movie' value={screening.movieId} placeholder="Select Movie" labelPlacement='floating' fill='outline' onIonChange={(e) => setScreening({ ...screening, movieId: e.detail.value })}>
                                                                {movies.map(movie => (
                                                                    <IonSelectOption key={movie._id} value={movie._id}>
                                                                        {movie.title}
                                                                    </IonSelectOption>
                                                                ))}
                                                            </IonSelect>
                                                            {validationErrors.movieId && <span style={{ color: 'red' }}>{validationErrors.movieId}</span>}
                                                            <IonInput className='ion-margin-top' label='Hall' type='text' value={`${hallName}, ${hallSeats} seats`} labelPlacement='floating' fill='outline' disabled={true} />
                                                        </>

                                                    )}
                                                </IonCol>
                                                <IonCol size='12' sizeMd='6'>
                                                    <IonDatetime presentation="date-time" hourCycle="h23" value={`${screening.date}T${screening.time}`}
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
                                                <IonButton className='ion-margin-top' type='submit' color='primary'>Save</IonButton>
                                            </IonRow>
                                        </IonGrid>
                                    </form>
                                    <IonToast isOpen={successMessage !== ''} message={successMessage} duration={3000} color={'success'} onDidDismiss={() => setSuccessMessage('')} style={{
                                        position: 'fixed',
                                        top: '10px',
                                        right: '10px',
                                        width: 'auto',
                                        maxWidth: '300px',
                                        zIndex: 9999
                                    }} />
                                    <IonToast isOpen={errorMessage !== ''} message={errorMessage} duration={3000} color={'danger'} onDidDismiss={() => setErrorMessage('')} style={{
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

export default UpdateScreening;
