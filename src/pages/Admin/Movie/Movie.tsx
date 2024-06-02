import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonPage, IonRow, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, calendarOutline, createOutline, star, ticketOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from 'axios';

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
    hall: {
        name: string;
    };
    cinema: {
        name: string;
    };
}

const Movie: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
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

    const [screenings, setScreenings] = useState<Screening[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useIonViewWillEnter(() => {
        fetchMovieDetails();
    });

    const fetchMovieDetails = useCallback(() => {
        axios.get(`http://192.168.0.12:3000/api/movies/${movieId}`)
            .then((response) => {
                if (response.status === 200) {
                    const { movie, screenings } = response.data;
                    setMovie(movie);
                    setScreenings(screenings);
                    setErrorMessage('');
                } else if (response.status === 404) {
                    setScreenings([]);
                    setErrorMessage(response.data);
                }
            })
            .catch((err) => {
                setErrorMessage(err.response?.data);
                console.log(err.response?.data || err.message);
            });
    }, [movieId]);

    const isFutureScreening = (screeningDate: string) => {
        const today = new Date();
        const screeningDateTime = new Date(screeningDate);
        const diffTime = screeningDateTime.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 1;
    };

    function deleteScreening(screeningId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`http://192.168.0.12:3000/api/screenings/${screeningId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setSuccessMessage("Screening successfully removed.");
                        fetchMovieDetails();
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data);
                    console.log(err.response?.data || err.message);
                });
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
                                <IonCardContent>
                                    <IonGrid>
                                        <IonRow>
                                            <IonCol size='12' sizeMd='6'>
                                                <IonImg src={`http://192.168.0.12:3000/images/${movie.image}`} alt={movie.title} />
                                            </IonCol>
                                            <IonCol size='12' sizeMd='6'>
                                                <IonCardHeader>
                                                    <IonCardTitle>{movie.director}</IonCardTitle>
                                                    <IonCardSubtitle>{movie.genre}, {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</IonCardSubtitle>
                                                    <IonCardSubtitle>Release date: {movie.releaseDate}</IonCardSubtitle>
                                                    <IonCardSubtitle>IMDb rating: {movie.rating} <IonIcon icon={star} /></IonCardSubtitle>
                                                </IonCardHeader>
                                                <IonCardContent>{movie.description}</IonCardContent>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonCard>
                    <IonCardHeader>
                        <IonToolbar color={'none'}>
                            <IonCardTitle>Screenings for {movie.title}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/screenings/add/movie/${movieId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonCardHeader>
                    <IonCardContent className='ion-padding'>
                        {screenings.map(screening => (
                            <IonCard className='ion-padding' key={screening._id} color={'light'}>
                                <IonCardHeader>
                                    <IonCardTitle>{screening.cinema.name}, {screening.hall.name}</IonCardTitle>
                                    <IonCardSubtitle><IonIcon icon={calendarOutline} /> {screening.time} - {screening.endTime}, {screening.date}</IonCardSubtitle>
                                    <IonCardSubtitle><IonIcon icon={ticketOutline} /> Number of available seats: {screening.numberOfAvailableSeats}</IonCardSubtitle>
                                </IonCardHeader>

                                {isFutureScreening(screening.date) && (
                                    <>
                                        <IonButton routerLink={`/admin/screenings/update/${screening._id}/movie/${movieId}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                                        <IonButton onClick={() => deleteScreening(screening._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
                                    </>
                                )}
                            </IonCard>
                        ))}
                    </IonCardContent>
                </IonCard>
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
            </IonContent>
        </IonPage>
    );
}

export default Movie;