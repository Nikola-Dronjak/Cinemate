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

const AddScreening: React.FC = () => {
    const { movieId, hallId } = useParams<{ movieId?: string; hallId?: string }>();

    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<string>('');

    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieName, setMovieName] = useState<string>('');

    const [halls, setHalls] = useState<Hall[]>([]);
    const [hallName, setHallName] = useState<string>('');
    const [hallSeats, setHallSeats] = useState<number>(0);

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
                const token = localStorage.getItem('authToken');
                if (token) {
                    const response = await axios.get('/api/screenings/', {
                        params: { movieId, hallId, cinemaId: selectedCinema },
                        headers: {
                            'x-auth-token': token
                        }
                    });
                    const data = response.data;
                    if (data.movie) {
                        setMovieName(data.movie.title);
                        setScreening(prevState => ({
                            ...prevState,
                            movieId: data.movie._id
                        }));
                        setCinemas(data.cinemas);
                    } else if (data.hall) {
                        setHallName(data.hall.name);
                        setHallSeats(data.hall.numberOfSeats);
                        setScreening(prevState => ({
                            ...prevState,
                            hallId: data.hall._id
                        }));
                        setMovies(data.movies);
                    }
                    if (data.halls) {
                        setHalls(data.halls);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [movieId, hallId, selectedCinema]);

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
                        if (response.status === 200) {
                            setSuccessMessage("Screening successfully added.");
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
                                    <IonCardTitle>Add a new Screening</IonCardTitle>
                                    <IonCardSubtitle>Please enter the screening information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addScreening}>
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

export default AddScreening;
