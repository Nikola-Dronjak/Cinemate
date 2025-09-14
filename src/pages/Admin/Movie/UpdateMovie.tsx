import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonSelect, IonSelectOption, IonTextarea, IonToast, useIonViewWillEnter } from '@ionic/react';
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

const UpdateMovie: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const [movie, setMovie] = useState<Omit<Movie, '_id'>>({
        title: '',
        description: '',
        genre: '',
        director: '',
        releaseDate: '',
        duration: NaN,
        image: '',
        rating: NaN
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

    useIonViewWillEnter(() => {
        fetchMovieDetails();
    });

    const fetchMovieDetails = useCallback(() => {
        axios.get(`/api/movies/${movieId}`)
            .then((response) => {
                if (response.status === 200) {
                    const { title, description, genre, director, releaseDate, duration, image, rating } = response.data;
                    setMovie({ title, description, genre, director, releaseDate, duration, image, rating });
                }
            })
            .catch((err) => {
                setToast({ message: err.response.data.message, color: 'danger' });
                console.error(err.response.data.message || err.message);
            });
    }, [movieId]);

    const updateMovie = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateMovie(movie, imageFile, false);
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
            formData.append('image', movie.image);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const token = localStorage.getItem('authToken');
            if (token) {
                await axios.put(`/api/movies/${movieId}`, formData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setToast({ message: "Movie successfully updated.", color: 'success' });
                            setMovie({
                                title: movie.title,
                                description: movie.description,
                                genre: movie.genre,
                                director: movie.director,
                                releaseDate: movie.releaseDate,
                                duration: movie.duration,
                                rating: movie.rating,
                                image: movie.image
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
    };

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
                                    <IonCardTitle>{t('movie.updateMovie.title')}: {movie.title}</IonCardTitle>
                                    <IonCardSubtitle>{t('movie.updateMovie.subtitle')}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateMovie}>
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
                                                    <IonInput className='ion-margin-top' label={t('inputs.labels.movie.image')} type='text' placeholder={t('inputs.placeholders.movie.imageUrl')} labelPlacement='floating' fill='outline' clearInput={true} value={movie.image} onIonInput={(e) => setMovie({ ...movie, image: e.detail.value?.trim() || '' })} />
                                                    <input type="file"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setImageFile(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
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

export default UpdateMovie;