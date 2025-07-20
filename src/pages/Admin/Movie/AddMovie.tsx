import React, { useState } from 'react';
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
                            setSuccessMessage("Movie successfully added.");
                        }
                    })
                    .catch((err) => {
                        setErrorMessage(err.response.data.message);
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
                                    <IonCardTitle>Add a new Movie</IonCardTitle>
                                    <IonCardSubtitle>Please enter the movie information</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={addMovie}>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='6'>
                                                    <IonInput label='Title' type='text' placeholder='The title of the Movie' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, title: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.title && <span style={{ color: 'red' }}>{validationErrors.title}</span>}
                                                    <IonInput className='ion-margin-top' label='Director' type='text' placeholder='The director of the Movie' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, director: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.director && <span style={{ color: 'red' }}>{validationErrors.director}</span>}
                                                    <IonSelect className='ion-margin-top' label='Genre' placeholder='The genre of the Movie' labelPlacement='floating' fill='outline' onIonChange={(e) => setMovie({ ...movie, genre: e.detail.value?.trim() || '' })}>
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
                                                    <IonTextarea className='ion-margin-top' label='Description' placeholder='The description of the Movie' labelPlacement='floating' fill='outline' rows={6} onIonInput={(e) => setMovie({ ...movie, description: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.description && <span style={{ color: 'red' }}>{validationErrors.description}</span>}
                                                </IonCol>
                                                <IonCol size='6'>
                                                    <IonInput label='Release Date' type='date' placeholder='The release date of the Movie' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setMovie({ ...movie, releaseDate: e.detail.value?.trim() || '' })} />
                                                    {validationErrors.releaseDate && <span style={{ color: 'red' }}>{validationErrors.releaseDate}</span>}
                                                    <IonInput className='ion-margin-top' label='Duration' type='number' placeholder='The duration of the Movie in minutes' labelPlacement='floating' fill='outline' onIonInput={(e) => setMovie({ ...movie, duration: parseInt(e.detail.value!, 10) || 0 })} />
                                                    {validationErrors.duration && <span style={{ color: 'red' }}>{validationErrors.duration}</span>}
                                                    <IonInput className='ion-margin-top' label='Rating' type='number' placeholder='The rating of the Movie (1.0 - 10.0)' labelPlacement='floating' fill='outline' step='0.1' onIonInput={(e) => setMovie({ ...movie, rating: parseFloat(e.detail.value!) })} />
                                                    {validationErrors.rating && <span style={{ color: 'red' }}>{validationErrors.rating}</span>}
                                                    <input type='file' className='ion-margin-top' onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
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

export default AddMovie;
