import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, searchOutline, trashOutline } from 'ionicons/icons';
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

const Halls: React.FC = () => {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const [cinema, setCinema] = useState<Omit<Cinema, '_id'>>({
        name: '',
        address: '',
        city: ''
    })

    const [halls, setHalls] = useState<Hall[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useIonViewWillEnter(() => {
        fetchHalls();
    });

    const fetchHalls = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`/api/halls/cinema/${cinemaId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        const { cinema, halls } = response.data;
                        setCinema(cinema);
                        setHalls(halls);
                        setErrorMessage('');
                    } else if (response.status === 404) {
                        setCinema({ name: '', address: '', city: '' });
                        setHalls([]);
                        setErrorMessage(response.data);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data);
                    console.log(err.response?.data || err.message);
                });
        }
    }, [cinemaId]);

    function deleteHall(hallId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/halls/${hallId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setSuccessMessage("Hall successfully removed.");
                        fetchHalls();
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
            <IonContent className="ion-padding">
                <div className='ion-text-right'>
                </div>
                <IonCard className='ion-padding'>
                    <IonToolbar>
                        <IonCardTitle>{cinema.name}</IonCardTitle>
                        <IonButtons slot="end">
                            <IonButton routerLink={`/admin/halls/add/${cinemaId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                        </IonButtons>
                    </IonToolbar>
                    <IonCardContent>
                        {halls.map(hall => (
                            <IonCard className='ion-padding' key={hall._id} color={'light'}>
                                <IonCardHeader>
                                    <IonCardTitle>{hall.name}</IonCardTitle>
                                    <IonCardSubtitle>Capacity: {hall.numberOfSeats} seats</IonCardSubtitle>
                                </IonCardHeader>

                                <IonButton routerLink={`/admin/halls/${hall._id}`} fill='solid' color={'primary'}>View <IonIcon icon={searchOutline} /></IonButton>
                                <IonButton routerLink={`/admin/halls/update/${hall._id}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                                <IonButton onClick={() => deleteHall(hall._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
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
};

export default Halls;