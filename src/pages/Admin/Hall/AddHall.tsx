import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
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

const AddHall: React.FC = () => {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const [cinema, setCinema] = useState<Omit<Cinema, '_id'>>({
        name: '',
        address: '',
        city: ''
    })

    const [hall, setHall] = useState<Omit<Hall, '_id'>>({
        name: '',
        numberOfSeats: NaN,
        cinemaId: cinemaId
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        numberOfSeats?: string;
    }>({});

    useIonViewWillEnter(() => {
        fetchCinema();
    });

    const fetchCinema = useCallback(() => {
        axios.get(`http://192.168.0.12:3000/api/cinemas/${cinemaId}`)
            .then((response) => {
                if (response.status === 200) {
                    setCinema(response.data);
                } else if (response.status === 404) {
                    setCinema({ name: '', address: '', city: '' });
                }
            })
            .catch((err) => {
                setErrorMessage(err.response.data);
                console.log(err.response.data);
            });
    }, [cinemaId]);

    async function addHall(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateHall(hall);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                axios.post('http://192.168.0.12:3000/api/halls', hall, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setSuccessMessage("Hall successfully added.");
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
            <IonContent className='ion-padding' scrollY={false}>
                <IonGrid fixed>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>Add a new Hall</IonCardTitle>
                                    <IonCardSubtitle>Please enter the hall information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addHall}>
                                        <IonInput label='Name' type='text' placeholder='Name of the Hall' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setHall({ ...hall, name: e.detail.value?.trim() || '' })} />
                                        {validationErrors.name && <span style={{ color: 'red' }}>{validationErrors.name}</span>}
                                        <IonInput className='ion-margin-top' label='Number of Seats' type='number' placeholder='Number of Seats in the Hall' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setHall({ ...hall, numberOfSeats: parseInt(e.detail.value!, 10) || 0 })} />
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

export default AddHall;