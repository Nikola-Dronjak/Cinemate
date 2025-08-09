import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonToast } from '@ionic/react';
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

const AddCinema: React.FC = () => {
    const [cinema, setCinema] = useState<Omit<Cinema, '_id'>>({
        name: '',
        address: '',
        city: ''
    })

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        address?: string;
        city?: string
    }>({});

    async function addCinema(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateCinema(cinema);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                axios.post('/api/cinemas', cinema, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 201) {
                            setToast({ message: "Cinema successfully added.", color: 'success' });
                            setCinema({
                                name: '',
                                address: '',
                                city: ''
                            });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
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
                                    <IonCardTitle>Add Cinema</IonCardTitle>
                                    <IonCardSubtitle>Please enter the cinema information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addCinema}>
                                        <IonInput label='Name' type='text' placeholder='Name of the Cinema' labelPlacement='floating' fill='outline' clearInput={true} value={cinema.name} onIonInput={(e) => setCinema({ ...cinema, name: e.detail.value?.trim() || '' })} />
                                        {validationErrors.name && <span style={{ color: 'red' }}>{validationErrors.name}</span>}
                                        <IonInput className='ion-margin-top' label='Address' type='text' placeholder='Street address of the Cinema' labelPlacement='floating' fill='outline' clearInput={true} value={cinema.address} onIonInput={(e) => setCinema({ ...cinema, address: e.detail.value?.trim() || '' })} />
                                        {validationErrors.address && <span style={{ color: 'red' }}>{validationErrors.address}</span>}
                                        <IonInput className='ion-margin-top' label='City' type='text' placeholder='City in which the Cinema is located' labelPlacement='floating' fill='outline' clearInput={true} value={cinema.city} onIonInput={(e) => setCinema({ ...cinema, city: e.detail.value?.trim() || '' })} />
                                        {validationErrors.city && <span style={{ color: 'red' }}>{validationErrors.city}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top' type='submit' color='primary'>Save <IonIcon icon={saveOutline} /></IonButton>
                                        </IonRow>
                                    </form>
                                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
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

export default AddCinema;