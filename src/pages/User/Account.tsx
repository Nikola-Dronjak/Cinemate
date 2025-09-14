import React, { useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonPage, IonRow, IonToast, isPlatform, useIonViewWillEnter } from '@ionic/react';
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
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
        password?: string
    }>({});

    const history = useHistory();
    const { t } = useTranslation();

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
                    setToast({ message: err.response.data.message, color: 'danger' });
                    console.error(err.response.data.message || err.message);
                });
        }
    }, []);

    const uploadProfilePicture = async () => {
        if (isPlatform('capacitor') || isPlatform('ios') || isPlatform('android')) {
            try {
                const photo = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: true,
                    resultType: CameraResultType.Uri,
                    source: CameraSource.Prompt
                });

                if (photo.webPath) {
                    setProfilePicturePreview(photo.webPath);

                    const response = await fetch(photo.webPath);
                    const blob = await response.blob();
                    const file = new File([blob], "profile.jpg", { type: blob.type });

                    setProfilePicture(file);
                    setUser(user => ({ ...user, profilePicture: file.name }));
                }
            } catch (err) {
                console.error('Error capturing profile image:', err);
            }
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            setUser(user => ({ ...user, profilePicture: file.name }));
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const updateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateRegister(user, true);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const formData = new FormData();
            formData.append('username', user.username);
            formData.append('email', user.email);

            if (user.password) {
                formData.append('password', user.password);
            }

            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }

            const token = localStorage.getItem('authToken');
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const { userId } = decodedToken;
                axios.put(`/api/users/${userId}`, formData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setToast({ message: "User successfully updated.", color: 'success' });
                            setUser({
                                username: user.username,
                                email: user.email,
                                password: '',
                                profilePicture: user.profilePicture
                            });
                        }
                    })
                    .catch((err) => {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
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
                    if (response.status === 204) {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('refreshToken');
                        history.push('/home');
                        setToast({ message: "User successfully removed.", color: 'success' });
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
                                    <IonCardTitle>{t('user.title')}</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    {profilePicturePreview || user.profilePicture ? (
                                        <IonImg src={profilePicturePreview ? profilePicturePreview : `${import.meta.env.VITE_SERVER_ADDRESS}/images/${user.profilePicture}`} alt="Profile Picture" style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0', border: '2px dashed #ccc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }} >
                                            <IonIcon icon="image-outline" size="large" />
                                        </div>
                                    )}
                                    <IonButton className='ion-margin-bottom' expand='block' onClick={uploadProfilePicture}>{t('buttons.uploadProfilePicture')}</IonButton>
                                    <form onSubmit={updateUser}>
                                        <input type='file' accept='image/*' ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                                        <IonInput label={t('inputs.labels.user.username')} type='text' placeholder='user123' labelPlacement='floating' fill='outline' clearInput={true} value={user.username} onIonInput={(e) => setUser({ ...user, username: e.detail.value?.trim() || '' })} />
                                        {validationErrors.username && <span style={{ color: 'red' }}>{validationErrors.username}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.user.email')} type='text' placeholder='example@gmail.com' labelPlacement='floating' fill='outline' clearInput={true} value={user.email} onIonInput={(e) => setUser({ ...user, email: e.detail.value?.trim() || '' })} />
                                        {validationErrors.email && <span style={{ color: 'red' }}>{validationErrors.email}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.user.password')} type='password' placeholder={t('inputs.placeholders.user.newPassword')} labelPlacement='floating' fill='outline' clearInput={true} value={user.password} onIonInput={(e) => setUser({ ...user, password: e.detail.value?.trim() || '' })} />
                                        {validationErrors.password && <span style={{ color: 'red' }}>{validationErrors.password}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top' type='submit' color='primary'>{t('buttons.save')} <IonIcon icon={saveOutline} /></IonButton>
                                            <IonButton className='ion-margin-top' onClick={() => deleteUser()} color='danger'>{t('buttons.remove')} <IonIcon icon={trashOutline} /></IonButton>
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

export default Account;