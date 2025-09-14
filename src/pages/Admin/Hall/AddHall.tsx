import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonToast, useIonViewWillEnter } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { validateHall } from './validateHall';
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

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        numberOfSeats?: string;
    }>({});

    const { t } = useTranslation();

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
                setToast({ message: err.response.data.message, color: 'danger' });
                console.error(err.response.data.message || err.message);
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
                axios.post('/api/halls', hall, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (response.status === 201) {
                            setToast({ message: "Hall successfully added.", color: 'success' });
                            setHall({
                                name: '',
                                numberOfSeats: NaN,
                                cinemaId: cinemaId
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
                                    <IonCardTitle>{t('hall.addHall.title')}</IonCardTitle>
                                    <IonCardSubtitle>{t('hall.addHall.subtitle')}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addHall}>
                                        <IonInput label={t('inputs.labels.hall.name')} type='text' placeholder={t('inputs.placeholders.hall.name')} labelPlacement='floating' fill='outline' clearInput={true} value={hall.name} onIonInput={(e) => setHall({ ...hall, name: e.detail.value?.trim() || '' })} />
                                        {validationErrors.name && <span style={{ color: 'red' }}>{validationErrors.name}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.hall.numberOfSeats')} type='number' placeholder={t('inputs.placeholders.hall.numberOfSeats')} labelPlacement='floating' fill='outline' clearInput={true} value={hall.numberOfSeats} onIonInput={(e) => setHall({ ...hall, numberOfSeats: parseInt(e.detail.value!, 10) || 0 })} />
                                        {validationErrors.numberOfSeats && <span style={{ color: 'red' }}>{validationErrors.numberOfSeats}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.hall.cinema')} type='text' labelPlacement='floating' fill='outline' disabled={true} value={cinema.name} />
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top' type='submit' color='primary'>{t('buttons.save')} <IonIcon icon={saveOutline} /></IonButton>
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

export default AddHall;