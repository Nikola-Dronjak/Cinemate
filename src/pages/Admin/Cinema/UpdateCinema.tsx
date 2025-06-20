import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonToast, useIonViewWillEnter } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { validateCinema } from './validateCinema';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

interface Cinema {
    _id: string;
    name: string;
    address: string;
    city: string;
}

const UpdateCinema: React.FC = () => {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const [cinema, setCinema] = useState<Omit<Cinema, '_id'>>({
        name: '',
        address: '',
        city: ''
    })

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        address?: string;
        city?: string
    }>({});

    useIonViewWillEnter(() => {
        fetchCinema();
    });

    const fetchCinema = useCallback(() => {
        axios.get(`/api/cinemas/${cinemaId}`)
            .then((response) => {
                if (response.status === 200) {
                    const { name, address, city } = response.data;
                    setCinema({ name, address, city });
                }
            })
            .catch((err) => {
                setErrorMessage(err.response?.data);
                console.error(err.response?.data || err.message);
            });
    }, [cinemaId]);

    const updateCinema = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateCinema(cinema);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                axios.put(`/api/cinemas/${cinemaId}`, cinema, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setSuccessMessage("Cinema successfully updated.");
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
                                    <IonCardTitle>Update Cinema</IonCardTitle>
                                    <IonCardSubtitle>Please update the cinema information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateCinema}>
                                        <IonInput label='Name' type='text' value={cinema.name} placeholder='Name of the Cinema' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setCinema({ ...cinema, name: e.detail.value?.trim() || '' })} />
                                        {validationErrors.name && <span style={{ color: 'red' }}>{validationErrors.name}</span>}
                                        <IonInput className='ion-margin-top' label='Address' type='text' value={cinema.address} placeholder='Street address of the Cinema' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setCinema({ ...cinema, address: e.detail.value?.trim() || '' })} />
                                        {validationErrors.address && <span style={{ color: 'red' }}>{validationErrors.address}</span>}
                                        <IonInput className='ion-margin-top' label='City' type='text' value={cinema.city} placeholder='City in which the Cinema is located' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setCinema({ ...cinema, city: e.detail.value?.trim() || '' })} />
                                        {validationErrors.city && <span style={{ color: 'red' }}>{validationErrors.city}</span>}
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

export default UpdateCinema;
