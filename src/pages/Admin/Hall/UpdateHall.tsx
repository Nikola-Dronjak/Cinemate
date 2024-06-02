import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonToast, useIonViewWillEnter } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { validateHall } from './validateHall';
import Header from '../../../components/Header';
import axios from 'axios';

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

const UpdateHall: React.FC = () => {
    const { hallId } = useParams<{ hallId: string }>();
    const [hall, setHall] = useState<Omit<Hall, '_id'>>({
        name: '',
        numberOfSeats: NaN,
        cinemaId: ''
    });

    const [cinema, setCinema] = useState<Omit<Cinema, '_id'>>({
        name: '',
        address: '',
        city: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        numberOfSeats?: string;
    }>({});

    useIonViewWillEnter(() => {
        fetchHall();
    });

    const fetchHall = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`http://192.168.0.12:3000/api/halls/${hallId}`, {
                headers: {
                    'x-auth-token': token
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        const { hall, cinema } = response.data;
                        setHall(hall);
                        setCinema(cinema);
                    } else if (response.status === 404) {
                        setHall({ name: '', numberOfSeats: NaN, cinemaId: '' });
                        setCinema({ name: '', address: '', city: '' });
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data);
                    console.log(err.response?.data || err.message);
                });
        }
    }, [hallId]);

    const updateHall = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateHall(hall);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                axios.put(`http://192.168.0.12:3000/api/halls/${hallId}`, { name: hall.name, numberOfSeats: hall.numberOfSeats, cinemaId: hall.cinemaId }, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setSuccessMessage("Hall successfully updated.");
                        }
                    })
                    .catch((err) => {
                        setErrorMessage(err.response.data);
                        console.log(err.response.data);
                    });
            }
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <Header title='Cinemate' />
            </IonHeader>
            <IonContent className='ion-padding' scrollY={false}>
                <IonGrid fixed>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>Update Hall: {hall.name}</IonCardTitle>
                                    <IonCardSubtitle>Please update the hall information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateHall}>
                                        <IonInput label='Name' type='text' value={hall.name} placeholder='Name of the Hall' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setHall({ ...hall, name: e.detail.value?.trim() || '' })} />
                                        {validationErrors.name && <span style={{ color: 'red' }}>{validationErrors.name}</span>}
                                        <IonInput className='ion-margin-top' label='Number of Seats' type='number' value={hall.numberOfSeats} placeholder='Number of Seats in the Hall' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setHall({ ...hall, numberOfSeats: parseInt(e.detail.value!, 10) || 0 })} />
                                        {validationErrors.numberOfSeats && <span style={{ color: 'red' }}>{validationErrors.numberOfSeats}</span>}
                                        <IonInput className='ion-margin-top' label='Cinema' type='text' value={cinema.name} labelPlacement='floating' fill='outline' disabled={true} />
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top' type='submit' color='primary'>Save <IonIcon icon={saveOutline} /></IonButton>
                                        </IonRow>
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

export default UpdateHall;
