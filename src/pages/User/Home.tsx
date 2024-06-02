import React, { useCallback, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonImg, IonPage, IonRow, useIonViewWillEnter } from '@ionic/react';
import Header from '../../components/Header';
import axios from 'axios';

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

const Home: React.FC = () => {
	const [movies, setMovies] = useState<Movie[]>([]);

	const [errorMessage, setErrorMessage] = useState('');

	useIonViewWillEnter(() => {
		fetchMovies();
	});

	const fetchMovies = useCallback(() => {
		axios.get('http://192.168.0.12:3000/api/movies')
			.then((response) => {
				if (response.status === 200) {
					setMovies(response.data);
					setErrorMessage('');
				} else if (response.status === 404) {
					setMovies([]);
					setErrorMessage(response.data);
				}
			})
			.catch((err) => {
				setErrorMessage(err.response?.data || 'Error fetching movies');
				console.log(err.response?.data || err.message);
			});
	}, []);

	return (
		<IonPage>
			<IonHeader>
				<Header title='Cinemate' />
			</IonHeader>
			{errorMessage ? (
				<IonContent className='ion-padding ion-text-center'>{errorMessage}</IonContent>
			) : (
				<IonContent className='ion-padding'>
					<IonGrid>
						<IonRow>
							{movies.map(movie => (
								<IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3" key={movie._id}>
									<IonCard className='ion-padding'>
										<IonImg src={`http://192.168.0.12:3000/images/${movie.image}`} alt={movie.title} />
										<IonCardHeader>
											<IonCardTitle>{movie.title}</IonCardTitle>
											<IonCardSubtitle>Director: {movie.director}</IonCardSubtitle>
											<IonCardSubtitle>Genre: {movie.genre}</IonCardSubtitle>
											<IonCardSubtitle>Duration: {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</IonCardSubtitle>
										</IonCardHeader>
										<IonCardContent>
											<IonRow className='ion-justify-content-center'>
												<IonButton routerLink={`/home/details/${movie._id}`} fill='solid' color={'primary'}>View</IonButton>
											</IonRow>
										</IonCardContent>
									</IonCard>
								</IonCol>
							))}
						</IonRow>
					</IonGrid>
				</IonContent>
			)}
		</IonPage>
	);
};

export default Home;
