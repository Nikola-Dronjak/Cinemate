import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, calendarOutline, createOutline, ticketOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from 'axios';

interface Screening {
    _id: string;
    date: string;
    time: string;
    endTime: string;
    numberOfAvailableSeats: number;
    movieId: string;
    movieTitle?: string;
    hallId: string;
}

const Hall: React.FC = () => {
    const { hallId } = useParams<{ hallId: string }>();
    const [hallName, setHallName] = useState('');

    const [screenings, setScreenings] = useState<Screening[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useIonViewWillEnter(() => {
        fetchScreeningsForHall();
    });

    const fetchScreeningsForHall = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`http://192.168.0.12:3000/api/halls/${hallId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        const { hall, screenings } = response.data;
                        setHallName(hall.name);
                        setScreenings(screenings);
                        setErrorMessage('');
                    } else if (response.status === 404) {
                        setHallName('');
                        setScreenings([]);
                        setErrorMessage(response.data);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data);
                    console.log(err.response?.data || err.message);
                });
        }
    }, [hallId]);

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
                        fetchScreeningsForHall();
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
                <IonCard className='ion-padding'>
                    <IonToolbar>
                        <IonCardTitle>Screenings for {hallName}</IonCardTitle>
                        <IonButtons slot="end">
                            <IonButton routerLink={`/admin/screenings/add/hall/${hallId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                        </IonButtons>
                    </IonToolbar>
                    <IonCardContent>
                        {screenings.map(screening => (
                            <IonCard className='ion-padding' key={screening._id} color={'light'}>
                                <IonCardHeader>
                                    <IonCardTitle>{screening.movieTitle}</IonCardTitle>
                                    <IonCardSubtitle><IonIcon icon={calendarOutline} /> {screening.time} - {screening.endTime}, {screening.date}</IonCardSubtitle>
                                    <IonCardSubtitle><IonIcon icon={ticketOutline} /> Number of available seats: {screening.numberOfAvailableSeats}</IonCardSubtitle>
                                </IonCardHeader>

                                {isFutureScreening(screening.date) && (
                                    <>
                                        <IonButton routerLink={`/admin/screenings/update/${screening._id}/hall/${hallId}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
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

export default Hall;