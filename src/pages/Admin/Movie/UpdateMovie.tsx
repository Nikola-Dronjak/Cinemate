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

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
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
                    const { movie } = response.data;
                    setMovie(movie);
                } else if (response.status === 404) {
                    setMovie({ title: '', description: '', genre: '', director: '', releaseDate: '', duration: NaN, image: '', rating: NaN });
                }
            })
            .catch((err) => {
                setErrorMessage(err.response.data);
                console.log(err.response?.data || err.message);
            });
    }, [movieId]);

    const updateMovie = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateMovie(movie, imageFile, false);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    let imageUrl = movie.image;
                    if (imageFile) {
                        const formData = new FormData();
                        formData.append('image', imageFile);
                        formData.append('oldImageUrl', movie.image);

                        const uploadResponse = await axios.post('/api/movies/upload', formData, {
                            headers: {
                                'x-auth-token': token,
                                'Content-Type': 'multipart/form-data'
                            }
                        });

                        if (uploadResponse.status === 200) {
                            imageUrl = uploadResponse.data.imageUrl;
                        }
                    }

                    const updateResponse = await axios.put(`/api/movies/${movieId}`, { title: movie.title, description: movie.description, genre: movie.genre, director: movie.director, releaseDate: movie.releaseDate, duration: movie.duration, image: imageUrl, rating: movie.rating }, {
                        headers: {
                            'x-auth-token': token,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (updateResponse.status === 200) {
                        setSuccessMessage("Movie successfully updated.");
                    }
                } catch (err) {
                    console.log(err);
                }
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
                                                    <IonInput label='Title' type='text' value={movie.title} placeholder='The title of the Movie' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, title: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.title && <span style={{ color: 'red' }}>{validationErrors.title}</span>}
                                                    <IonInput className='ion-margin-top' label='Director' type='text' value={movie.director} placeholder='The director of the Movie' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, director: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.director && <span style={{ color: 'red' }}>{validationErrors.director}</span>}
                                                    <IonSelect className='ion-margin-top' label='Genre' value={movie.genre} placeholder='The genre of the Movie' labelPlacement='floating' fill='outline' onIonChange={(e) => setMovie({ ...movie, genre: e.detail.value?.trim() || '' })}>
                                                        <IonSelectOption value={'Action'}>Action</IonSelectOption>
                                                        <IonSelectOption value={'Animation'}>Animation</IonSelectOption>
                                                        <IonSelectOption value={'Comedy'}>Comedy</IonSelectOption>
                                                        <IonSelectOption value={'Crime'}>Crime</IonSelectOption>
                                                        <IonSelectOption value={'Drama'}>Drama</IonSelectOption>
                                                        <IonSelectOption value={'Thriller'}>Thriller</IonSelectOption>
                                                        <IonSelectOption value={'Horror'}>Horror</IonSelectOption>
                                                        <IonSelectOption value={'Romance'}>Romace</IonSelectOption>
                                                        <IonSelectOption value={'Western'}>Western</IonSelectOption>
                                                    </IonSelect>
                                                    {validationErrors.genre && <span style={{ color: 'red' }}>{validationErrors.genre}</span>}
                                                    <IonTextarea className='ion-margin-top' label='Description' value={movie.description} placeholder='The description of the Movie' labelPlacement='floating' fill='outline' rows={6} onIonInput={(e) => setMovie({ ...movie, description: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.description && <span style={{ color: 'red' }}>{validationErrors.description}</span>}
                                                </IonCol>
                                                <IonCol size='6'>
                                                    <IonInput label='Release Date' type='date' value={movie.releaseDate} placeholder='The release date of the Movie' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, releaseDate: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.releaseDate && <span style={{ color: 'red' }}>{validationErrors.releaseDate}</span>}
                                                    <IonInput className='ion-margin-top' label='Duration' type='number' value={movie.duration} placeholder='The duration of the Movie in minutes' labelPlacement='floating' fill='outline' onIonInput={(e) => setMovie({ ...movie, duration: parseInt(e.detail.value!, 10) || 0 })} />
                                                    {validationErrors.duration && <span style={{ color: 'red' }}>{validationErrors.duration}</span>}
                                                    <IonInput className='ion-margin-top' label='Rating' type='number' value={movie.rating} placeholder='The rating of the Movie (1.0 - 10.0)' labelPlacement='floating' fill='outline' step='0.1' onIonInput={(e) => setMovie({ ...movie, rating: parseFloat(e.detail.value!) })} />
                                                    {validationErrors.rating && <span style={{ color: 'red' }}>{validationErrors.rating}</span>}
                                                    <IonInput className='ion-margin-top' label='Image' type='text' value={movie.image} placeholder='Image URL' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, image: e.detail.value?.trim() || '' })} />
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

export default UpdateMovie;
