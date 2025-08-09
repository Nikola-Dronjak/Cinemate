import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
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
                                    <IonCardTitle>Update Movie: {movie.title}</IonCardTitle>
                                    <IonCardSubtitle>Please update the movie information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateMovie}>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='6'>
                                                    <IonInput label='Title' type='text' placeholder='The title of the Movie' labelPlacement='floating' fill='outline' clearInput={true} value={movie.title} onIonInput={(e) => setMovie({ ...movie, title: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.title && <span style={{ color: 'red' }}>{validationErrors.title}</span>}
                                                    <IonInput className='ion-margin-top' label='Director' type='text' placeholder='The director of the Movie' labelPlacement='floating' fill='outline' clearInput={true} value={movie.director} onIonInput={(e) => setMovie({ ...movie, director: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.director && <span style={{ color: 'red' }}>{validationErrors.director}</span>}
                                                    <IonSelect className='ion-margin-top' label='Genre' placeholder='The genre of the Movie' labelPlacement='floating' fill='outline' value={movie.genre} onIonChange={(e) => setMovie({ ...movie, genre: e.detail.value?.trim() || '' })}>
                                                        <IonSelectOption value={'Action'}>Action</IonSelectOption>
                                                        <IonSelectOption value={'Animation'}>Animation</IonSelectOption>
                                                        <IonSelectOption value={'Comedy'}>Comedy</IonSelectOption>
                                                        <IonSelectOption value={'Crime'}>Crime</IonSelectOption>
                                                        <IonSelectOption value={'Drama'}>Drama</IonSelectOption>
                                                        <IonSelectOption value={'Thriller'}>Thriller</IonSelectOption>
                                                        <IonSelectOption value={'Horror'}>Horror</IonSelectOption>
                                                        <IonSelectOption value={'Romance'}>Romance</IonSelectOption>
                                                        <IonSelectOption value={'Western'}>Western</IonSelectOption>
                                                    </IonSelect>
                                                    {validationErrors.genre && <span style={{ color: 'red' }}>{validationErrors.genre}</span>}
                                                    <IonTextarea className='ion-margin-top' label='Description' placeholder='The description of the Movie' labelPlacement='floating' fill='outline' rows={6} value={movie.description} onIonInput={(e) => setMovie({ ...movie, description: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.description && <span style={{ color: 'red' }}>{validationErrors.description}</span>}
                                                </IonCol>
                                                <IonCol size='6'>
                                                    <IonInput label='Release Date' type='date' placeholder='The release date of the Movie' labelPlacement='floating' fill='outline' clearInput={true} value={movie.releaseDate} onIonInput={(e) => setMovie({ ...movie, releaseDate: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.releaseDate && <span style={{ color: 'red' }}>{validationErrors.releaseDate}</span>}
                                                    <IonInput className='ion-margin-top' label='Duration' type='number' placeholder='The duration of the Movie in minutes' labelPlacement='floating' fill='outline' value={movie.duration} onIonInput={(e) => setMovie({ ...movie, duration: parseInt(e.detail.value!, 10) || 0 })} />
                                                    {validationErrors.duration && <span style={{ color: 'red' }}>{validationErrors.duration}</span>}
                                                    <IonInput className='ion-margin-top' label='Rating' type='number' placeholder='The rating of the Movie (1.0 - 10.0)' labelPlacement='floating' fill='outline' step='0.1' value={movie.rating} onIonInput={(e) => setMovie({ ...movie, rating: parseFloat(e.detail.value!) })} />
                                                    {validationErrors.rating && <span style={{ color: 'red' }}>{validationErrors.rating}</span>}
                                                    <IonInput className='ion-margin-top' label='Image' type='text' placeholder='Image URL' labelPlacement='floating' fill='outline' clearInput={true} value={movie.image} onIonInput={(e) => setMovie({ ...movie, image: e.detail.value?.trim() || '' })} />
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
                                                <IonButton className='ion-margin-top' type='submit' color='primary'>Save <IonIcon icon={saveOutline} /></IonButton>
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
