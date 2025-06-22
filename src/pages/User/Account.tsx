import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonPage, IonRow, IonToast, useIonViewWillEnter } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { saveOutline, trashOutline } from 'ionicons/icons';
import { validateRegister } from '../Register/validateRegister';
import Header from '../../components/Header';
import axios from '../../api/AxiosInstance';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    profilePicture: string;
}

const Account: React.FC = () => {
    const [user, setUser] = useState<Omit<User, '_id' | 'isAdmin'>>({
        username: '',
        email: '',
        password: '',
        profilePicture: ''
    });

    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
        password?: string
    }>({});

    const history = useHistory();

    useIonViewWillEnter(() => {
        fetchUser();
    });

    const fetchUser = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.get(`/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        const { username, email, password, profilePicture } = response.data;
                        setUser({ username, email, password, profilePicture })
                    }
                })
                .catch((err) => {
                    console.error('Error fetching user details:', err);
                });
        }
    }, []);

    const uploadProfilePicture = async () => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri, // returns a file URI for use with fetch
                source: CameraSource.Prompt // gives user the choice between Camera or Photos
            });

            if (photo.webPath) {
                setProfilePicturePreview(photo.webPath);

                const response = await fetch(photo.webPath);
                const blob = await response.blob();
                const file = new File([blob], "profile.jpg", { type: blob.type });

                const formData = new FormData();
                formData.append("image", file);

                const token = localStorage.getItem('authToken');
                if (token) {
                    await axios.post('/api/users/uploadPfp', formData, {
                        headers: {
                            'x-auth-token': token,
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                        .then((response) => {
                            if (response.status === 200) {
                                setSuccessMessage("Profile picture successfully added.");
                            }
                        })
                        .catch((err) => {
                            setErrorMessage(err.response.data);
                            console.log(err.response.data);
                        });
                }
            }
        } catch (err) {
            console.error('Error uploading profile image:', err);
        }
    };

    const updateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateRegister(user, true);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const { userId } = decodedToken;
                axios.put(`/api/users/${userId}`, user, {
                    headers: {
                        'x-auth-token': token,
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setSuccessMessage("User successfully updated.");
                        }
                    })
                    .catch((err) => {
                        setValidationErrors(err.response.data);
                        console.log(err.response.data);
                    });
            }
        }
    };

    function deleteUser() {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.delete(`/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        localStorage.removeItem('authToken');
                        history.push('/home');
                        setSuccessMessage("User successfully removed.");
                    } else {
                        console.log(response.data);
                    }
                })
                .catch((err) => {
                    console.log(err.response?.data || err.message);
                });
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <Header title='Cinemate' />
            </IonHeader>
            <IonContent className='ion-padding'>
                <IonGrid fixed>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>User information</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    {profilePicturePreview || user.profilePicture ? (
                                        <IonImg
                                            src={
                                                profilePicturePreview
                                                    ? profilePicturePreview
                                                    : `${import.meta.env.VITE_SERVER_ADDRESS}/images/${user.profilePicture}`
                                            }
                                            alt="Profile Picture"
                                            style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                backgroundColor: '#f0f0f0',
                                                border: '2px dashed #ccc',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '1rem'
                                            }}
                                        >
                                            <IonIcon icon="image-outline" size="large" />
                                        </div>
                                    )}
                                    <IonButton className='ion-margin-bottom' expand='block' onClick={uploadProfilePicture}>
                                        Upload Profile Picture
                                    </IonButton>
                                    <form onSubmit={updateUser}>
                                        <IonInput label='Username' type='text' value={user.username} placeholder='user123' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, username: e.detail.value?.trim() || '' })} />
                                        {validationErrors.username && <span style={{ color: 'red' }}>{validationErrors.username}</span>}
                                        <IonInput className='ion-margin-top' label='Email' type='text' value={user.email} placeholder='example@gmail.com' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, email: e.detail.value?.trim() || '' })} />
                                        {validationErrors.email && <span style={{ color: 'red' }}>{validationErrors.email}</span>}
                                        <IonInput className='ion-margin-top' label='Password' type='password' placeholder='Your current/new password' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, password: e.detail.value?.trim() || '' })} />
                                        {validationErrors.password && <span style={{ color: 'red' }}>{validationErrors.password}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top' type='submit' color='primary'>Save <IonIcon icon={saveOutline} /></IonButton>
                                            <IonButton className='ion-margin-top' onClick={() => deleteUser()} color='danger'>Remove <IonIcon icon={trashOutline} /></IonButton>
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

export default Account;
