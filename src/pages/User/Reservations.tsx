import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import queryString from 'query-string';
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

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });

    const location = useLocation();
    const history = useHistory();

    useIonViewWillEnter(() => {
        const { page: queryPage } = queryString.parse(location.search);
        const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
        setPage(parsedPage);
        fetchReservations(parsedPage);
    });

    useEffect(() => {
        if (location.pathname === '/reservations') {
            const { page: queryPage } = queryString.parse(location.search);
            const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
            setPage(parsedPage);
            fetchReservations(parsedPage);
        }
    }, [location.pathname, location.search]);

    const fetchReservations = (currentPage: number = 1) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.get(`/api/users/${userId}/reservations?page=${currentPage}&limit=${limit}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        const reservationsRaw = response.data.reservationsOfUser;

                        if (!reservationsRaw || reservationsRaw.length === 0) {
                            setReservations([]);
                            setTotalPages(1);
                            return;
                        }

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
                        setTotalPages(1);
                        setReservations([]);
                        setToast({ message: response.data.message, color: 'danger' });
                    }
                })
                .catch((err) => {
                    setToast({ message: err.response.data.message, color: 'danger' });
                    console.error(err.response.data.message || err.message);
                });
        }
    };

    const changePage = (newPage: number) => {
        if (newPage !== page) {
            history.push(`reservations?page=${newPage}`);
            setPage(newPage);
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
                        setToast({ message: "Reservation successfully removed.", color: 'success' });
                        const updatedReservations = reservations.filter(reservation => reservation._id !== reservationId);
                        const isLastItemOnPage = updatedReservations.length === 0;
                        const newPage = isLastItemOnPage && page > 1 ? page - 1 : page;

                        if (newPage !== page) {
                            history.push(`reservations?page=${newPage}`);
                        } else {
                            setReservations(updatedReservations);
                            fetchReservations(page);
                        }
                    }
                })
                .catch((err) => {
                    setToast({ message: err.response.data.message, color: 'danger' });
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
            {reservations.length === 0 ? (
                <IonContent className='ion-padding'>
                    <p className='ion-padding ion-text-center'>{toast.message}</p>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                    </div>
                </IonContent>
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
                        <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                    </div>
                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
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
