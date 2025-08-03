import React, { useState } from 'react';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import Header from '../../components/Header';
import axios from '../../api/AxiosInstance';

interface Reservation {
    _id: string;
    userId: string;
    screening: {
        _id: string;
        date: string;
        time: string;
        endTime: string;
        numberOfAvailableSeats: number;
        movieId: string;
        hallId: string;
        hallName?: string;
        cinemaName?: string;
        movieTitle?: string;
    }
}

const Reservations: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useIonViewWillEnter(() => {
        fetchReservations(page);
    });

    const fetchReservations = (currentPage: number = page) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.get(`/api/users/${userId}/reservations?page=${page}&limit=${limit}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        const reservationsRaw = response.data.reservationsOfUser;

                        const reservationsWithScreeningDetails = await Promise.all(
                            reservationsRaw.map(async (reservation: any) => {
                                let screeningDetails = {};
                                let hallName = 'Unknown';
                                let cinemaName = 'Unknown';
                                let movieTitle = 'Unknown';
                                try {
                                    const screening = await axios.get(`/api/screenings/${reservation.screeningId}`);
                                    if (screening.status === 200) {
                                        screeningDetails = screening.data;

                                        try {
                                            const hall = await axios.get(`/api/halls/${screening.data.hallId}`);
                                            if (hall.status === 200) {
                                                hallName = hall.data.name;

                                                try {
                                                    const cinema = await axios.get(`/api/cinemas/${hall.data.cinemaId}`);
                                                    if (cinema.status === 200) {
                                                        cinemaName = cinema.data.name;

                                                    }
                                                } catch (err) {
                                                    console.error(`Error fetching cinema ${hall.data.cinemaId}`, err);
                                                }
                                            }
                                        } catch (err) {
                                            console.error(`Error fetching hall ${screening.data.hallId}`, err);
                                        }

                                        try {
                                            const movie = await axios.get(`/api/movies/${screening.data.movieId}`);
                                            if (movie.status === 200) {
                                                movieTitle = movie.data.title;
                                            }
                                        } catch (err) {
                                            console.error(`Error fetching movie ${screening.data.movieId}`, err);
                                        }
                                    }
                                } catch (err) {
                                    console.error(`Error fetching screening ${reservation.screeningId}`, err);
                                }
                                return {
                                    ...reservation,
                                    screening: {
                                        ...screeningDetails,
                                        hallName,
                                        cinemaName,
                                        movieTitle
                                    }
                                };
                            })
                        );
                        setTotalPages(response.data.totalPages);
                        setReservations(reservationsWithScreeningDetails);
                    } else if (response.status === 404) {
                        setReservations([]);
                        setErrorMessage(response.data.message);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });
        }
    };

    const isFutureScreening = (screeningDate: string) => {
        const today = new Date();
        const screeningDateTime = new Date(screeningDate);
        const diffTime = screeningDateTime.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 1;
    };

    function deleteReservation(reservationId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/reservations/${reservationId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 204) {
                        setSuccessMessage("Reservation successfully removed.");
                        fetchReservations();
                    } else {
                        setErrorMessage(response.data);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <Header title='Cinemate' />
                </IonToolbar>
            </IonHeader>
            {errorMessage ? (
                <IonContent className='ion-padding ion-text-center'>{errorMessage}</IonContent>
            ) : (
                <IonContent className='ion-padding'>
                    <IonGrid>
                        <IonRow>
                            {reservations.map(reservation => (
                                <IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3" key={reservation._id}>
                                    <IonCard className='ion-padding'>
                                        <IonCardHeader>
                                            <IonCardTitle>{reservation.screening.movieTitle}</IonCardTitle>
                                            <IonCardSubtitle>Cinema: {reservation.screening.cinemaName}</IonCardSubtitle>
                                            <IonCardSubtitle>Hall: {reservation.screening.hallName}</IonCardSubtitle>
                                            <IonCardSubtitle>Date: {reservation.screening.date}</IonCardSubtitle>
                                            <IonCardSubtitle>Time: {reservation.screening.time}</IonCardSubtitle>
                                        </IonCardHeader>
                                        <IonRow className='ion-justify-content-center'>
                                            {isFutureScreening(reservation.screening.date) && (
                                                <IonButton onClick={() => deleteReservation(reservation._id)} fill='solid' color={'danger'}>Cancel</IonButton>
                                            )}
                                        </IonRow>
                                    </IonCard>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</IonButton>
                    </div>
                    <IonToast isOpen={successMessage !== ''} message={successMessage} duration={3000} color={'success'} onDidDismiss={() => setSuccessMessage('')} style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        width: 'auto',
                        maxWidth: '300px',
                        zIndex: 9999
                    }} />
                </IonContent>
            )}
        </IonPage>
    );
};

export default Reservations;
