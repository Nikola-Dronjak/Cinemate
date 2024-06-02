import React, { useState, useCallback } from 'react';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import Header from '../../components/Header';
import axios from 'axios';

interface Reservation {
    _id: string;
    screening: {
        date: string;
        time: string;
    };
    movie: {
        title: string;
    };
    hall: {
        name: string;
    };
    cinema: {
        name: string;
    };
}

const Reservations: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useIonViewWillEnter(() => {
        fetchReservations();
    });

    const fetchReservations = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.get(`http://192.168.0.12:3000/api/reservations/user/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setReservations(response.data);
                        setErrorMessage('');
                    } else if (response.status === 404) {
                        setReservations([]);
                        setErrorMessage(response.data);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data);
                    console.log(err.response?.data || err.message);
                });
        } else {
            setErrorMessage('User not logged in');
        }
    }, []);

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
            axios.delete(`http://192.168.0.12:3000/api/reservations/${reservationId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setSuccessMessage("Reservation successfully removed.");
                        fetchReservations();
                    } else {
                        setErrorMessage(response.data);
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
                                            <IonCardTitle>{reservation.movie.title}</IonCardTitle>
                                            <IonCardSubtitle>Cinema: {reservation.cinema.name}</IonCardSubtitle>
                                            <IonCardSubtitle>Hall: {reservation.hall.name}</IonCardSubtitle>
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
