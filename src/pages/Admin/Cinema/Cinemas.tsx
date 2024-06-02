import React, { useState, useCallback } from 'react';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, pinOutline, searchOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from 'axios';

interface Cinema {
    _id: string;
    name: string;
    address: string;
    city: string;
}

const Cinemas: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useIonViewWillEnter(() => {
        fetchCinemas();
    });

    const fetchCinemas = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get('http://192.168.0.12:3000/api/cinemas', {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setCinemas(response.data);
                        setErrorMessage('');
                    } else if (response.status === 404) {
                        setCinemas([]);
                        setErrorMessage(response.data);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data);
                    console.log(err.response?.data || err.message);
                });
        }
    }, []);

    function deleteCinema(cinemaId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`http://192.168.0.12:3000/api/cinemas/${cinemaId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setSuccessMessage("Cinema successfully removed.");
                        fetchCinemas();
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
                <div className='ion-text-right'>
                    <IonButton routerLink='/admin/cinemas/add' fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                </div>
                {cinemas.map(cinema => (
                    <IonCard className='ion-padding' key={cinema._id}>
                        <IonCardHeader>
                            <IonCardTitle>{cinema.name}</IonCardTitle>
                            <IonCardSubtitle><IonIcon icon={pinOutline} /> {cinema.address}, {cinema.city}</IonCardSubtitle>
                        </IonCardHeader>

                        <IonButton routerLink={`/admin/cinemas/${cinema._id}`} fill='solid' color={'primary'}>View <IonIcon icon={searchOutline} /></IonButton>
                        <IonButton routerLink={`/admin/cinemas/update/${cinema._id}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                        <IonButton onClick={() => deleteCinema(cinema._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
                    </IonCard>
                ))}
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

export default Cinemas;
