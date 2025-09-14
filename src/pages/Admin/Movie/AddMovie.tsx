import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonSelect, IonSelectOption, IonTextarea, IonToast } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { validateMovie } from './validateMovie';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

interface Movie {
    _id: string;
    title: string;
    description: string;
    genre: string;
    director: string;
    releaseDate: string;
    duration: number;
    image: string;
    rating: number;
}

const AddMovie: React.FC = () => {
    const [movie, setMovie] = useState<Omit<Movie, '_id'>>({
        title: '',
        description: '',
        genre: '',
        director: '',
        releaseDate: '',
        duration: NaN,
        rating: NaN,
        image: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{
        title?: string;
        description?: string;
        genre?: string;
        director?: string;
        releaseDate?: string;
        duration?: string;
        image?: string;
        rating?: string;
    }>({});

    const { t } = useTranslation();

    async function addMovie(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateMovie(movie, imageFile, true);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const formData = new FormData();
            formData.append('title', movie.title);
            formData.append('description', movie.description);
            formData.append('genre', movie.genre);
            formData.append('director', movie.director);
            formData.append('releaseDate', movie.releaseDate);
            formData.append('duration', movie.duration.toString());
            formData.append('rating', movie.rating.toString());

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const token = localStorage.getItem('authToken');
            if (token) {
                axios.post('/api/movies', formData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((response) => {
                        if (response.status === 201) {
                            setToast({ message: "Movie successfully added.", color: 'success' });
                            setMovie({
                                title: '',
                                description: '',
                                genre: '',
                                director: '',
                                releaseDate: '',
                                duration: NaN,
                                rating: NaN,
                                image: ''
                            });
                            setImageFile(null);
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
                        <IonCol size='12' sizeMd='12' sizeLg='10' sizeXl='8'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>{t('movie.addMovie.title')}</IonCardTitle>
                                    <IonCardSubtitle>{t('movie.addMovie.subtitle')}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addMovie}>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='6'>
                                                    <IonInput label={t('inputs.labels.movie.title')} type='text' placeholder={t('inputs.placeholders.movie.title')} labelPlacement='floating' fill='outline' clearInput={true} value={movie.title} onIonInput={(e) => setMovie({ ...movie, title: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.title && <span style={{ color: 'red' }}>{validationErrors.title}</span>}
                                                    <IonInput className='ion-margin-top' label={t('inputs.labels.movie.director')} type='text' placeholder={t('inputs.placeholders.movie.director')} labelPlacement='floating' fill='outline' clearInput={true} value={movie.director} onIonInput={(e) => setMovie({ ...movie, director: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.director && <span style={{ color: 'red' }}>{validationErrors.director}</span>}
                                                    <IonSelect className='ion-margin-top' label={t('inputs.labels.movie.genre')} placeholder={t('inputs.placeholders.movie.genre')} labelPlacement='floating' fill='outline' value={movie.genre} onIonChange={(e) => setMovie({ ...movie, genre: e.detail.value?.trim() || '' })}>
                                                        <IonSelectOption value={'Action'}>{t('genre.action')}</IonSelectOption>
                                                        <IonSelectOption value={'Animation'}>{t('genre.animation')}</IonSelectOption>
                                                        <IonSelectOption value={'Comedy'}>{t('genre.comedy')}</IonSelectOption>
                                                        <IonSelectOption value={'Crime'}>{t('genre.crime')}</IonSelectOption>
                                                        <IonSelectOption value={'Drama'}>{t('genre.drama')}</IonSelectOption>
                                                        <IonSelectOption value={'Horror'}>{t('genre.horror')}</IonSelectOption>
                                                        <IonSelectOption value={'Romance'}>{t('genre.romance')}</IonSelectOption>
                                                        <IonSelectOption value={'Thriller'}>{t('genre.thriller')}</IonSelectOption>
                                                        <IonSelectOption value={'Western'}>{t('genre.western')}</IonSelectOption>
                                                    </IonSelect>
                                                    {validationErrors.genre && <span style={{ color: 'red' }}>{validationErrors.genre}</span>}
                                                    <IonTextarea className='ion-margin-top' label={t('inputs.labels.movie.description')} placeholder={t('inputs.placeholders.movie.description')} labelPlacement='floating' fill='outline' rows={6} value={movie.description} onIonInput={(e) => setMovie({ ...movie, description: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.description && <span style={{ color: 'red' }}>{validationErrors.description}</span>}
                                                </IonCol>
                                                <IonCol size='6'>
                                                    <IonInput label={t('inputs.labels.movie.releaseDate')} type='date' placeholder={t('inputs.placeholders.movie.releaseDate')} labelPlacement='floating' fill='outline' clearInput={true} value={movie.releaseDate} onIonInput={(e) => setMovie({ ...movie, releaseDate: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.releaseDate && <span style={{ color: 'red' }}>{validationErrors.releaseDate}</span>}
                                                    <IonInput className='ion-margin-top' label={t('inputs.labels.movie.duration')} type='number' placeholder={t('inputs.placeholders.movie.duration')} labelPlacement='floating' fill='outline' value={movie.duration} onIonInput={(e) => setMovie({ ...movie, duration: parseInt(e.detail.value!, 10) || 0 })} />
                                                    {validationErrors.duration && <span style={{ color: 'red' }}>{validationErrors.duration}</span>}
                                                    <IonInput className='ion-margin-top' label={t('inputs.labels.movie.rating')} type='number' placeholder={t('inputs.placeholders.movie.rating')} labelPlacement='floating' fill='outline' step='0.1' value={movie.rating} onIonInput={(e) => setMovie({ ...movie, rating: parseFloat(e.detail.value!) })} />
                                                    {validationErrors.rating && <span style={{ color: 'red' }}>{validationErrors.rating}</span>}
                                                    <input type='file' className='ion-margin-top' value={movie.image} onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
                                                    {validationErrors.image && <span style={{ color: 'red' }}>{validationErrors.image}</span>}
                                                </IonCol>
                                            </IonRow>
                                            <IonRow className='ion-justify-content-center'>
                                                <IonButton className='ion-margin-top' type='submit' color='primary'>{t('buttons.save')} <IonIcon icon={saveOutline} /></IonButton>
                                            </IonRow>
                                        </IonGrid>
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

export default AddMovie;