import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
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

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        address?: string;
        city?: string
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
                            setToast({ message: "Cinema successfully updated.", color: 'success' });
                            setCinema({
                                name: cinema.name,
                                address: cinema.address,
                                city: cinema.city
                            });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message)
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
                                    <IonCardTitle>{t('cinema.updateCinema.title')}</IonCardTitle>
                                    <IonCardSubtitle>{t('cinema.updateCinema.subtitle')}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateCinema}>
                                        <IonInput label={t('inputs.labels.cinema.name')} type='text' placeholder={t('inputs.placeholders.cinema.name')} labelPlacement='floating' fill='outline' clearInput={true} value={cinema.name} onIonInput={(e) => setCinema({ ...cinema, name: e.detail.value?.trim() || '' })} />
                                        {validationErrors.name && <span style={{ color: 'red' }}>{validationErrors.name}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.cinema.address')} type='text' placeholder={t('inputs.placeholders.cinema.address')} labelPlacement='floating' fill='outline' clearInput={true} value={cinema.address} onIonInput={(e) => setCinema({ ...cinema, address: e.detail.value?.trim() || '' })} />
                                        {validationErrors.address && <span style={{ color: 'red' }}>{validationErrors.address}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.cinema.city')} type='text' placeholder={t('inputs.placeholders.cinema.city')} labelPlacement='floating' fill='outline' clearInput={true} value={cinema.city} onIonInput={(e) => setCinema({ ...cinema, city: e.detail.value?.trim() || '' })} />
                                        {validationErrors.city && <span style={{ color: 'red' }}>{validationErrors.city}</span>}
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

export default UpdateCinema;