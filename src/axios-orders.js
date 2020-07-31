import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://kosmy-burger-builder.firebaseio.com/'
});

export default instance;