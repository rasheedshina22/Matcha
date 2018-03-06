import age from 's-age';
import ago from 's-ago';


/* News selector */

export const newsSelector = ({ visits, likes, onlineUsers }, id) => {

	const LIKE = 'liked your profile',
		UNLIKE = 'unliked your profile',
		VISIT = 'visited your profile';
	let news = [];
		
	likes.forEach(x => { 
		if (x.receiver == id)
			news.push({
				id: x.sender,
				fname: x.firstname,
				lname: x.lastname,
				age: age(x.birthdate),
				occupation: x.occupation,
				photo: JSON.parse(x.photos)[0], 
				connected: onlineUsers.includes(x.sender),
				clicked: x.clicked,
				type: x.unliked == true ? UNLIKE : LIKE ,
				time: ago(new Date(x.created_at)),
				created_at: new Date(x.created_at).getTime(),
				content: false,
			});
	});

	visits.forEach(x => { 
		if (x.receiver == id)
			news.push({
				id: x.sender,
				fname: x.firstname,
				lname: x.lastname,
				age: age(x.birthdate),
				occupation: x.occupation,
				photo: JSON.parse(x.photos)[0], 
				connected: onlineUsers.includes(x.sender),
				clicked: x.clicked,
				type: VISIT,
				time: ago(new Date(x.created_at)),
				created_at: new Date(x.created_at).getTime(),
				content: false,
			});
	});

	news.sort((a, b) => b.created_at - a.created_at);

	return news;
};


/* Match Selector and helpers */

const findMatches = (likes, id) => {	

	const likeSent = likes.filter(x => x.sender == id),
	      likeReceived = likes.filter(x => x.receiver == id);

	let matches = likeSent
		/* Find matches */
		.reduce((acc, like) => {
			const match = likeReceived.find(x => x.sender == like.receiver); 	
			return match ? [...acc, like] : acc;
		}, [])
		/* Clean matches (deduplicate and get id) */
		.map(match => match.receiver)
		.reduce((acc, match) => acc.includes(match) ? acc : [match, ...acc], []);

	return matches;
};


const findLastMessage = (match, likes, messages, id) => {	

	const lastMessage = messages
		.filter(x => (x.receiver == match && x.sender == id) || (x.receiver == id && x.sender == match))
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		[0];

	if (lastMessage)
		return {...lastMessage, match};

	const lastMatch = likes
		.filter(x => (x.receiver == match && x.sender == id) || (x.receiver == id && x.sender == match))
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		[0];

	return {...lastMatch, match};
};


const formatMatch = (x, onlineUsers) => {	
		
	return ({ 
		id: x.match,
		fname: x.firstname,
		lname: x.lastname,
		age: age(x.birthdate),
		occupation: x.message ? x.message : `You and ${x.firstname} just matched`,
		photo: JSON.parse(x.photos)[0], 
		connected: onlineUsers.includes(x.sender),
		clicked: x.clicked,
		created_at: x.created_at
	}); 
};

export const matchSelector = ({ likes, messages, onlineUsers }, id) => {	

	const matches = findMatches(likes, id)
		.map(match => findLastMessage(match, likes, messages, id))
		.map(match => formatMatch(match, onlineUsers));

	console.log('matches', matches);
	return matches;
};



const mockMatch = {
	id: 527,
	fname: 'Bill',
	lname: 'Becker',
	age: 32,
	occupation: 'Waterside Worker',
	photo: 'https://res.cloudinary.com/matcha/image/upload/v1518690862/yasxzl2kl4jip1k65b4t.jpg',
	connected: false,
	clicked: false,
};








//function newsEqual(a, b) {
//	return [
//		a.receiver = b.receiver,
//		a.sender = b.sender,
//		a.type = b.type
//	].reduce((acc, bool) => bool && acc, true);
//} 

//	news.reduce((acc, x) => acc.find((a) => newsEqual(a, x)) ? acc : [x, ...acc], []);